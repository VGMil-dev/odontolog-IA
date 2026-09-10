// @ts-nocheck
import { redisService } from './redis.service.js';
import { agentCore } from '../agent/core.js';
import { reminderService } from './reminder.service.js';
import { SecureLogger } from '../utils/logger.js';

export interface ConsentStatus {
  hasConsent: boolean;
  version: string;
}

/**
 * Servicio de Privacidad, Consentimiento y Derecho al Olvido
 * Cumple con LOPDP Ecuador (Art. 8, 12, 15, 21, 26) e ISO/IEC 42001:2026.
 */
export class PrivacyService {
  public static readonly CONSENT_VERSION = 'LOPDP-EC-2026-v1.0';

  /**
   * Verifica si el usuario ya otorgó su consentimiento expreso
   */
  public static async hasConsent(userId: string): Promise<boolean> {
    const key = `consent:${userId}`;
    const val = await redisService.get(key);
    return val === 'true';
  }

  /**
   * Registra el consentimiento informado expreso del paciente
   */
  public static async grantConsent(userId: string, channel: string): Promise<void> {
    const key = `consent:${userId}`;
    await redisService.set(key, 'true');
    SecureLogger.audit('CONSENT_GRANTED', {
      userIdHash: SecureLogger.anonymizeUserId(userId),
      action: 'ACCEPT_LOPDP_TERMS',
      details: `Canal: ${channel}, Versión: ${this.CONSENT_VERSION}`,
    });
  }

  /**
   * Genera el mensaje de transparencia y solicitud de consentimiento
   */
  public static getConsentPrompt(userName: string): string {
    return `¡Hola ${userName}! 🦷 Bienvenido a Clínica Dental OdontoCare en Cuenca.\n\n` +
      `🤖 Aviso de Transparencia (ISO/IEC 42001:2026): Soy Valeria, asistente virtual basada en Inteligencia Artificial. Mis respuestas son orientativas para coordinar citas y no constituyen un diagnóstico médico definitivo.\n\n` +
      `📋 Protección de Datos (LOPDP Ecuador): Para gestionar tus turnos y orientarte en tus citas, requerimos tu consentimiento para tratar tus datos de contacto y motivos de consulta dental conforme a nuestra Política de Privacidad.\n\n` +
      `¿Aceptas el tratamiento de tus datos para la atención odontológica? Por favor responde "Acepto" para continuar.`;
  }

  /**
   * Detecta si un mensaje del paciente solicita la supresión de sus datos (Derecho al Olvido)
   */
  public static isErasureRequest(text: string): boolean {
    const lower = text.toLowerCase().trim();
    return (
      lower === '/olvido' ||
      lower === 'olvido' ||
      lower.includes('eliminar mis datos') ||
      lower.includes('borrar mis datos') ||
      lower.includes('suprimir mis datos') ||
      lower.includes('derecho al olvido') ||
      lower.includes('delete my data')
    );
  }

  /**
   * Ejecuta el Derecho de Supresión / Supresión de Datos Personales (LOPDP Art. 21)
   */
  public static async executeRightToErasure(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const userHash = SecureLogger.anonymizeUserId(userId);

      // 1. Limpiar historial en AgentCore (.sessions.json y memoria)
      agentCore.clearHistory(userId);

      // 2. Limpiar estados y colas en Redis
      await redisService.del(`consent:${userId}`);
      await redisService.del(`buffer:${userId}`);
      await redisService.del(`paused:${userId}`);

      // 3. Eliminar recordatorios de citas del paciente
      reminderService.removeAppointmentsByUser(userId);

      SecureLogger.audit('RIGHT_TO_ERASURE_EXECUTED', {
        userIdHash: userHash,
        action: 'DATA_DELETION',
        details: 'Historial, sesiones cifradas, consentimiento y buffers suprimidos.',
      });

      return {
        success: true,
        message: 'Tus datos personales, historial de conversación y recordatorios han sido completamente eliminados de nuestros sistemas conforme a la Ley Orgánica de Protección de Datos Personales (LOPDP).',
      };
    } catch (err: any) {
      SecureLogger.error('PrivacyService', 'Fallo al ejecutar supresión de datos:', err);
      return {
        success: false,
        message: 'Ocurrió un inconveniente al procesar la supresión de datos. Por favor intenta nuevamente o contacta a la administración de la clínica.',
      };
    }
  }
}
