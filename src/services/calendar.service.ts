import { google } from 'googleapis';
import { env } from '../config/env.js';
import { clinicManager, Doctor } from '../config/clinic.js';

export interface TimeSlot {
  start: string; // ISO String
  end: string;   // ISO String
  display: string; // "Jueves 16:00 - 16:45"
  doctorId: string;
  doctorName: string;
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

export class CalendarService {
  private calendar: any = null;
  private isLiveGoogle = false;
  // Simulación en memoria para desarrollo si no hay Service Account de Google
  private mockBookedSlots: Set<string> = new Set();

  constructor() {
    this.initGoogleCalendar();
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
        console.log('📅 [CalendarService] Google Calendar API inicializado correctamente.');
      } catch (err) {
        console.warn('⚠️ [CalendarService] Error al inicializar Google Calendar, usando modo simulado:', err);
      }
    } else {
      console.log('📅 [CalendarService] Modo Simulación activo (no se encontraron credenciales de Google Service Account).');
    }
  }

  /**
   * Obtiene los horarios disponibles para una especialidad en una fecha dada o próxima.
   */
  public async getAvailableSlots(specialty: string, targetDate?: string): Promise<{ doctor: Doctor; slots: TimeSlot[] }> {
    const doctor = clinicManager.getDoctorBySpecialty(specialty);
    if (!doctor) {
      // Si no encuentra doctor específico, asigna al odontólogo general
      const fallbackDoc = clinicManager.getDoctorBySpecialty('odontologia_general') || clinicManager.getConfig().doctors[0];
      return this.generateSlotsForDoctor(fallbackDoc, targetDate);
    }

    return this.generateSlotsForDoctor(doctor, targetDate);
  }

  private async generateSlotsForDoctor(doctor: Doctor, targetDateStr?: string): Promise<{ doctor: Doctor; slots: TimeSlot[] }> {
    const now = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    let target: Date;
    if (targetDateStr) {
      // Manejar formato YYYY-MM-DD
      const parts = targetDateStr.split('-');
      if (parts.length === 3) {
        target = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      } else {
        target = new Date(targetDateStr);
      }
    } else {
      target = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }

    if (isNaN(target.getTime())) {
      target = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }

    // Buscar el día laboral más próximo del doctor que esté en availableDays
    let attempts = 0;
    while (!doctor.availableDays.includes(dayNames[target.getDay()]) && attempts < 14) {
      target.setDate(target.getDate() + 1);
      attempts++;
    }

    const slots: TimeSlot[] = [];
    const durationMs = doctor.slotDurationMinutes * 60 * 1000;

    // Extraer horas exactas desde workingHours (ej. "14:00 - 19:00")
    let startHour = 14;
    let endHour = 18;
    const match = doctor.workingHours.match(/(\d{2}):\d{2}\s*-\s*(\d{2}):\d{2}/);
    if (match) {
      startHour = parseInt(match[1], 10);
      endHour = parseInt(match[2], 10);
    }

    for (let hour = startHour; hour < endHour; hour++) {
      const slotStart = new Date(target);
      slotStart.setHours(hour, 0, 0, 0);
      const slotEnd = new Date(slotStart.getTime() + durationMs);

      // Si el slot ya pasó hoy, omitirlo
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
        const display = `${slotStart.toLocaleDateString('es-EC', timeOptions)} con ${doctor.name}`;

        slots.push({
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
          display,
          doctorId: doctor.id,
          doctorName: doctor.name,
        });
      }

      if (slots.length >= 3) break; // Máximo 3 opciones para claridad
    }

    return { doctor, slots };
  }

  /**
   * Agenda la cita en Google Calendar o en la memoria simulada.
   */
  public async bookAppointment(params: {
    specialty: string;
    startDateTime: string;
    patientName: string;
    patientPhone?: string;
    notes?: string;
  }): Promise<AppointmentResult> {
    const doctor = clinicManager.getDoctorBySpecialty(params.specialty) || clinicManager.getConfig().doctors[0];
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
        message: `El horario solicitado con ${doctor.name} ya no se encuentra disponible. Por favor elige otro horario.`,
      };
    }

    // Si tenemos Google Calendar en vivo
    if (this.isLiveGoogle && this.calendar) {
      try {
        const event = {
          summary: `🦷 Cita OdontoCare: ${params.patientName} - ${doctor.specialtyLabel}`,
          description: `Paciente: ${params.patientName}\nTeléfono: ${params.patientPhone || 'No registrado'}\nEspecialista: ${doctor.name}\nNotas: ${params.notes || 'Agendado vía OdontoCare IA'}`,
          start: { dateTime: startDate.toISOString() },
          end: { dateTime: endDate.toISOString() },
        };

        const res = await this.calendar.events.insert({
          calendarId: doctor.calendarId || env.GOOGLE_CALENDAR_ID,
          requestBody: event,
        });

        this.mockBookedSlots.add(slotKey);
        return {
          success: true,
          appointmentId: res.data.id || `gcal_${Date.now()}`,
          doctorName: doctor.name,
          specialty: doctor.specialty,
          dateTime: startDate.toLocaleString('es-EC'),
          patientName: params.patientName,
          message: `Cita confirmada con éxito en Google Calendar con ${doctor.name}.`,
        };
      } catch (err: any) {
        console.error('❌ [CalendarService] Error en Google Calendar API:', err?.message || err);
        return {
          success: false,
          appointmentId: '',
          doctorName: doctor.name,
          specialty: doctor.specialty,
          dateTime: params.startDateTime,
          patientName: params.patientName,
          message: `Hubo un inconveniente al registrar la cita en la agenda de Google Calendar de ${doctor.name}. Por favor intenta de nuevo o comunícate a recepción.`,
        };
      }
    }

    // Modo simulado persistente en sesión
    this.mockBookedSlots.add(slotKey);
    const appointmentId = `odonto_${Date.now()}`;

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
        minute: '2-digit' 
      }),
      patientName: params.patientName,
      message: `Cita reservada correctamente con ${doctor.name}.`,
    };
  }
}

export const calendarService = new CalendarService();
