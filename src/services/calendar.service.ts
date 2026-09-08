import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import { env } from '../config/env.js';
import { Doctor, ClinicConfig } from '../config/clinic.js';
import { clinicsRegistry, ClinicEntity } from '../config/clinics.registry.js';
import { SecureLogger } from '../utils/logger.js';

export interface TimeSlot {
  start: string; // ISO String
  end: string;   // ISO String
  display: string; // "(Hoy) martes 16:00" o "(Mañana) miércoles 09:00"
  doctorId: string;
  doctorName: string;
  clinicId: string;
}

export interface AppointmentResult {
  success: boolean;
  appointmentId: string;
  doctorName: string;
  specialty: string;
  dateTime: string;
  patientName: string;
  message: string;
}

export interface AppointmentRecord {
  id: string;
  clinicId: string;
  clinicName: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  dateTime: string;
  patientName: string;
  patientPhone: string;
  notes?: string;
  createdAt: string;
}

export class CalendarService {
  private calendar: any = null;
  private isLiveGoogle = false;
  private mockBookedSlots: Set<string> = new Set();
  private appointments: AppointmentRecord[] = [];
  private appointmentsFile: string;

  constructor() {
    this.appointmentsFile = path.resolve(process.cwd(), '.appointments.json');
    this.loadAppointments();
    this.initGoogleCalendar();
  }

  private loadAppointments() {
    try {
      if (fs.existsSync(this.appointmentsFile)) {
        const raw = fs.readFileSync(this.appointmentsFile, 'utf-8');
        this.appointments = JSON.parse(raw);
        for (const app of this.appointments) {
          this.mockBookedSlots.add(`${app.doctorId}_${app.dateTime}`);
        }
      }
    } catch (err) {
      SecureLogger.warn('CalendarService', 'Error al cargar .appointments.json:', err);
    }
  }

  private saveAppointments() {
    try {
      fs.writeFileSync(this.appointmentsFile, JSON.stringify(this.appointments, null, 2), 'utf-8');
    } catch (err) {
      SecureLogger.warn('CalendarService', 'Error al persistir .appointments.json:', err);
    }
  }

  private initGoogleCalendar() {
    if (env.GOOGLE_SERVICE_ACCOUNT_EMAIL && env.GOOGLE_PRIVATE_KEY) {
      try {
        const auth = new google.auth.JWT({
          email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          key: env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          scopes: ['https://www.googleapis.com/auth/calendar'],
        });
        this.calendar = google.calendar({ version: 'v3', auth });
        this.isLiveGoogle = true;
        SecureLogger.info('CalendarService', 'Google Calendar API inicializado correctamente.');
      } catch (err) {
        SecureLogger.warn('CalendarService', 'Error al inicializar Google Calendar, usando modo local:', err);
      }
    } else {
      SecureLogger.info('CalendarService', 'Modo local activo (no se encontraron credenciales de Google Service Account).');
    }
  }

  public getAllAppointments(clinicId?: string): AppointmentRecord[] {
    if (clinicId) {
      return this.appointments.filter(a => a.clinicId === clinicId);
    }
    return this.appointments;
  }

  public getAppointmentsMetrics(clinicId?: string) {
    const list = clinicId ? this.appointments.filter(a => a.clinicId === clinicId) : this.appointments;
    const total = list.length;
    const confirmed = list.filter(a => (a as any).status !== 'cancelled').length;
    const cancelled = list.filter(a => (a as any).status === 'cancelled').length;
    
    // Identificar citas de hoy en Guayaquil (YYYY-MM-DD)
    const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Guayaquil' });
    const todayAppointments = list.filter(a => a.dateTime && a.dateTime.startsWith(todayStr));

    const retentionRate = total > 0 ? Math.round((confirmed / total) * 100) : 100;

    return {
      total,
      confirmed,
      cancelled,
      todayCount: todayAppointments.length,
      todayAppointments,
      retentionRate
    };
  }

  /**
   * Obtiene los horarios disponibles para una especialidad en una clínica y fecha dada.
   */
  public async getAvailableSlots(
    specialty: string, 
    targetDate?: string,
    clinicId?: string
  ): Promise<{ doctor: Doctor; slots: TimeSlot[]; clinic: ClinicConfig }> {
    const clinic: ClinicEntity = (clinicId ? clinicsRegistry.getById(clinicId) : null) || clinicsRegistry.getDefault();
    
    // Filtrar únicamente doctores activos (no marcados como ausentes por la secretaria)
    const activeDoctors = (clinic.doctors || []).filter(d => d.isActive !== false);
    if (activeDoctors.length === 0) {
      throw new Error(`En este momento los especialistas de ${clinic.name} se encuentran fuera de turno o ausentes.`);
    }

    // Buscar doctor por especialidad dentro de los activos
    let doctor = activeDoctors.find(d => 
      d.specialty.toLowerCase() === specialty.toLowerCase() ||
      d.specialty.includes(specialty.toLowerCase())
    );

    if (!doctor) {
      doctor = activeDoctors.find(d => d.specialty.toLowerCase().includes('general')) || activeDoctors[0];
    }

    if (!doctor) {
      throw new Error(`La clínica ${clinic.name} no tiene doctores activos para esta especialidad.`);
    }

    const slots = await this.generateSlotsForDoctor(doctor, clinic, targetDate);
    return { doctor, slots, clinic };
  }

  private async generateSlotsForDoctor(
    doctor: Doctor, 
    clinic: ClinicConfig,
    targetDateStr?: string
  ): Promise<TimeSlot[]> {
    const now = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const durationMs = (doctor.slotDurationMinutes || 45) * 60 * 1000;

    // Fechas de referencia en Guayaquil
    const todayStr = now.toLocaleDateString('es-EC', { timeZone: 'America/Guayaquil', year: 'numeric', month: 'numeric', day: 'numeric' });
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowStr = tomorrow.toLocaleDateString('es-EC', { timeZone: 'America/Guayaquil', year: 'numeric', month: 'numeric', day: 'numeric' });

    let target: Date;
    let isSpecificDateRequested = false;

    if (targetDateStr) {
      isSpecificDateRequested = true;
      const parts = targetDateStr.split('-');
      if (parts.length === 3) {
        target = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      } else {
        target = new Date(targetDateStr);
      }
      if (isNaN(target.getTime())) {
        target = new Date(now);
        isSpecificDateRequested = false;
      }
    } else {
      // INICIAR DESDE HOY (sin saltar a ciegas +24 horas)
      target = new Date(now);
    }

    let startHour = 9;
    let endHour = 18;
    if (typeof doctor.workingHours === 'string') {
      const match = doctor.workingHours.match(/(\d{2}):\d{2}\s*-\s*(\d{2}):\d{2}/);
      if (match) {
        startHour = parseInt(match[1], 10);
        endHour = parseInt(match[2], 10);
      }
    } else if (doctor.workingHours && typeof doctor.workingHours === 'object') {
      if ((doctor.workingHours as any).start) startHour = parseInt((doctor.workingHours as any).start.split(':')[0], 10);
      if ((doctor.workingHours as any).end) endHour = parseInt((doctor.workingHours as any).end.split(':')[0], 10);
    }

    const slots: TimeSlot[] = [];
    let searchAttempts = 0;

    // Buscar slots: si hoy no hay horas o no atiende, avanzar hasta encontrar un día con horas
    while (slots.length === 0 && searchAttempts < 14) {
      const currentDayIndex = target.getDay();
      const currentDayName = dayNames[currentDayIndex];
      const isAvailable = Array.isArray(doctor.availableDays) && (doctor.availableDays as Array<string | number>).some(d =>
        d === currentDayIndex ||
        (typeof d === 'string' && d.toLowerCase() === currentDayName.toLowerCase())
      );

      if (isAvailable) {
        for (let hour = startHour; hour < endHour; hour++) {
          const slotStart = new Date(target);
          slotStart.setHours(hour, 0, 0, 0);
          const slotEnd = new Date(slotStart.getTime() + durationMs);

          // Si el slot ya pasó hoy respecto a la hora real, omitirlo
          if (slotStart.getTime() <= Date.now()) {
            continue;
          }

          const slotKey = `${doctor.id}_${slotStart.toISOString()}`;
          if (!this.mockBookedSlots.has(slotKey)) {
            const timeOptions: Intl.DateTimeFormatOptions = { 
              weekday: 'long', 
              month: 'short', 
              day: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit',
              timeZone: 'America/Guayaquil',
            };

            const slotDateStr = slotStart.toLocaleDateString('es-EC', { timeZone: 'America/Guayaquil', year: 'numeric', month: 'numeric', day: 'numeric' });
            const isToday = slotDateStr === todayStr;
            const isTomorrow = slotDateStr === tomorrowStr;
            const relativeTag = isToday ? '(Hoy) ' : isTomorrow ? '(Mañana) ' : '';

            const display = `${relativeTag}${slotStart.toLocaleDateString('es-EC', timeOptions)} con ${doctor.name}`;

            slots.push({
              start: slotStart.toISOString(),
              end: slotEnd.toISOString(),
              display,
              doctorId: doctor.id,
              doctorName: doctor.name,
              clinicId: clinic.clinicId,
            });
          }

          if (slots.length >= 3) break;
        }
      }

      // Si no encontramos slots en este día (ya pasó o no atiende), avanzamos al día siguiente
      if (slots.length === 0) {
        target.setDate(target.getDate() + 1);
        searchAttempts++;
      }
    }

    return slots;
  }

  /**
   * Agenda la cita en Google Calendar o en la memoria persistente.
   */
  public async bookAppointment(params: {
    specialty: string;
    startDateTime: string;
    patientName: string;
    patientPhone?: string;
    notes?: string;
    clinicId?: string;
  }): Promise<AppointmentResult> {
    const clinic: ClinicEntity = (params.clinicId ? clinicsRegistry.getById(params.clinicId) : null) || clinicsRegistry.getDefault();

    const doctor = clinic.doctors.find(d => 
      d.specialty.toLowerCase() === params.specialty.toLowerCase() ||
      d.specialty.includes(params.specialty.toLowerCase())
    ) || clinic.doctors[0];

    const durationMs = (doctor?.slotDurationMinutes || 45) * 60 * 1000;
    const startDate = new Date(params.startDateTime);
    const endDate = new Date(startDate.getTime() + durationMs);
    const slotKey = `${doctor.id}_${startDate.toISOString()}`;

    // Validar si ya está ocupado
    if (this.mockBookedSlots.has(slotKey)) {
      return {
        success: false,
        appointmentId: '',
        doctorName: doctor.name,
        specialty: doctor.specialty,
        dateTime: params.startDateTime,
        patientName: params.patientName,
        message: `El horario solicitado con ${doctor.name} en ${clinic.name} ya no se encuentra disponible. Por favor elige otro horario.`,
      };
    }

    const appointmentId = `cita_${Date.now()}`;
    const targetCalendarId = doctor.calendarId || clinic.calendarId || env.GOOGLE_CALENDAR_ID;

    // Si tenemos Google Calendar en vivo
    if (this.isLiveGoogle && this.calendar) {
      try {
        const event = {
          summary: `🦷 Cita ${clinic.name}: ${params.patientName} - ${doctor.specialtyLabel}`,
          description: `Paciente: ${params.patientName}\nTeléfono: ${params.patientPhone || 'No registrado'}\nClínica: ${clinic.name} (${clinic.city})\nEspecialista: ${doctor.name}\nNotas: ${params.notes || 'Agendado vía Agente IA'}`,
          start: { dateTime: startDate.toISOString() },
          end: { dateTime: endDate.toISOString() },
        };

        const res = await this.calendar.events.insert({
          calendarId: targetCalendarId,
          requestBody: event,
        });

        this.mockBookedSlots.add(slotKey);
        const record: AppointmentRecord = {
          id: res.data.id || appointmentId,
          clinicId: clinic.clinicId,
          clinicName: clinic.name,
          doctorId: doctor.id,
          doctorName: doctor.name,
          specialty: doctor.specialty,
          dateTime: startDate.toISOString(),
          patientName: params.patientName,
          patientPhone: params.patientPhone || 'No proporcionado',
          notes: params.notes,
          createdAt: new Date().toISOString(),
        };
        this.appointments.push(record);
        this.saveAppointments();

        return {
          success: true,
          appointmentId: record.id,
          doctorName: doctor.name,
          specialty: doctor.specialty,
          dateTime: startDate.toLocaleString('es-EC', { timeZone: 'America/Guayaquil' }),
          patientName: params.patientName,
          message: `Cita confirmada con éxito en Google Calendar (${clinic.name}) con ${doctor.name}.`,
        };
      } catch (err: any) {
        SecureLogger.error('CalendarService', 'Error en Google Calendar API:', err?.message || err);
        return {
          success: false,
          appointmentId: '',
          doctorName: doctor.name,
          specialty: doctor.specialty,
          dateTime: params.startDateTime,
          patientName: params.patientName,
          message: `Hubo un inconveniente al registrar la cita en la agenda de Google Calendar (${clinic.name}). Por favor intenta de nuevo.`,
        };
      }
    }

    // Modo local persistente
    this.mockBookedSlots.add(slotKey);
    const record: AppointmentRecord = {
      id: appointmentId,
      clinicId: clinic.clinicId,
      clinicName: clinic.name,
      doctorId: doctor.id,
      doctorName: doctor.name,
      specialty: doctor.specialty,
      dateTime: startDate.toISOString(),
      patientName: params.patientName,
      patientPhone: params.patientPhone || 'No proporcionado',
      notes: params.notes,
      createdAt: new Date().toISOString(),
    };
    this.appointments.push(record);
    this.saveAppointments();

    return {
      success: true,
      appointmentId,
      doctorName: doctor.name,
      specialty: doctor.specialty,
      dateTime: startDate.toLocaleString('es-EC', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'America/Guayaquil'
      }),
      patientName: params.patientName,
      message: `Cita reservada correctamente en ${clinic.name} con ${doctor.name}.`,
    };
  }
}

export const calendarService = new CalendarService();
