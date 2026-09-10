// @ts-nocheck
import { clinicManager } from '../config/clinic.js';
import { eventBus } from '../core/event-bus.js';
import { channelRegistry } from '../channels/channel.adapter.js';
import { SecureLogger } from '../utils/logger.js';

export interface ScheduledAppointmentRecord {
  id: string;
  userId: string;
  patientName: string;
  patientPhone?: string;
  doctorName: string;
  specialty?: string;
  appointmentTimeIso: string;
  channel: string;
  reminderSent: boolean;
}

export class ReminderService {
  private appointments: Map<string, ScheduledAppointmentRecord> = new Map();
  private intervalTimer: NodeJS.Timeout | null = null;

  constructor() {
    // Escuchar automáticamente citas agendadas desde el EventBus
    eventBus.on('appointment:booked', (data) => {
      this.registerAppointment({
        id: data.appointmentId,
        userId: data.userId,
        patientName: data.patientName,
        patientPhone: data.patientPhone,
        doctorName: data.doctorName,
        specialty: data.specialty || 'Odontología',
        appointmentTimeIso: data.appointmentTimeIso,
        channel: data.channel || 'telegram',
        reminderSent: false,
      });
    });
  }

  /**
   * Registra una nueva cita para seguimiento de recordatorios
   */
  public registerAppointment(appt: ScheduledAppointmentRecord): void {
    this.appointments.set(appt.id, appt);
    SecureLogger.info('ReminderService', `Cita registrada para seguimiento de recordatorio: ${appt.doctorName} (${appt.appointmentTimeIso})`);
  }

  /**
   * Elimina todas las citas asociadas a un usuario (Requerido por LOPDP Art. 21 - Derecho al Olvido)
   */
  public removeAppointmentsByUser(userId: string): number {
    let deletedCount = 0;
    for (const [id, appt] of this.appointments.entries()) {
      if (appt.userId === userId) {
        this.appointments.delete(id);
        deletedCount++;
      }
    }
    SecureLogger.info('ReminderService', `Suprimidos ${deletedCount} recordatorios por derecho al olvido.`);
    return deletedCount;
  }

  /**
   * Inicia el ciclo de verificación periódica de citas próximas
   */
  public start(intervalMinutes: number = 30): void {
    if (this.intervalTimer) return;

    SecureLogger.info('ReminderService', `Servicio de recordatorios activo (revisión cada ${intervalMinutes} min).`);
    this.intervalTimer = setInterval(() => {
      this.checkUpcomingAppointments().catch(err => {
        SecureLogger.error('ReminderService', 'Error verificando recordatorios:', err);
      });
    }, intervalMinutes * 60 * 1000);
  }

  public stop(): void {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
  }

  /**
   * Revisa citas pendientes que ocurran en las próximas 24 horas y las despacha polimórficamente
   */
  public async checkUpcomingAppointments(): Promise<number> {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const windowStart = now + (23 * 60 * 60 * 1000); // 23h adelante
    const windowEnd = now + (25 * 60 * 60 * 1000);   // 25h adelante
    let sentCount = 0;

    for (const [id, appt] of this.appointments.entries()) {
      if (appt.reminderSent) continue;

      const apptTime = new Date(appt.appointmentTimeIso).getTime();
      if (apptTime >= windowStart && apptTime <= windowEnd) {
        const clinic = clinicManager.getConfig();
        const reminderText = `Hola ${appt.patientName}! Te saluda Valeria de ${clinic.name}. Te recordamos que tienes agendada tu cita mañana a las ${new Date(appt.appointmentTimeIso).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })} con ${appt.doctorName}. ¿Nos confirmas tu asistencia? ¡Te esperamos!`;

        try {
          const destination = (appt.channel === 'whatsapp' && appt.patientPhone) ? appt.patientPhone : appt.userId;
          const sent = await channelRegistry.dispatchMessage(appt.channel, destination, reminderText);

          if (sent) {
            appt.reminderSent = true;
            sentCount++;
            SecureLogger.info('ReminderService', `Recordatorio despachado vía ${appt.channel} exitosamente.`);
          }
        } catch (err: any) {
          SecureLogger.warn('ReminderService', `No se pudo enviar recordatorio:`, err);
        }
      }

      // Purgar citas cuya fecha ya pasó hace más de 24 horas para evitar fugas de memoria
      if (apptTime < (now - oneDayMs)) {
        this.appointments.delete(id);
      }
    }

    return sentCount;
  }

  public getPendingCount(): number {
    return Array.from(this.appointments.values()).filter(a => !a.reminderSent).length;
  }
}

export const reminderService = new ReminderService();
