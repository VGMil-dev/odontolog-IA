import axios from 'axios';
import { env } from '../config/env.js';
import { redisService } from './redis.service.js';

export interface ChatwootWebhookPayload {
  event: string;
  id?: number;
  content?: string;
  message_type?: string | number; // 'incoming' (0), 'outgoing' (1)
  private?: boolean;
  conversation?: {
    id: number;
    status: string;
    meta?: {
      sender?: {
        id: number;
        name: string;
        phone_number?: string;
        identifier?: string;
      };
    };
  };
  sender?: {
    id: number;
    name: string;
    type?: string; // 'user' (agent) vs 'contact' (patient)
  };
}

export class ChatwootService {
  private isConfigured = false;
  private client: any;

  constructor() {
    if (env.CHATWOOT_API_ACCESS_TOKEN && env.CHATWOOT_BASE_URL) {
      this.isConfigured = true;
      this.client = axios.create({
        baseURL: `${env.CHATWOOT_BASE_URL}/api/v1/accounts/${env.CHATWOOT_ACCOUNT_ID}`,
        headers: {
          api_access_token: env.CHATWOOT_API_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
        timeout: 6000,
      });
      console.log(`🌐 [ChatwootService] Conectado a Chatwoot en ${env.CHATWOOT_BASE_URL} (Cuenta: ${env.CHATWOOT_ACCOUNT_ID})`);
    } else {
      console.log('ℹ️ [ChatwootService] CHATWOOT_API_ACCESS_TOKEN no configurado. Operando con handoff local/simulado.');
    }
  }

  public async isBotPausedForUser(userId: string): Promise<boolean> {
    return redisService.isBotPaused(userId);
  }

  public async pauseBotForUser(userId: string, ttlSeconds: number = 3600): Promise<void> {
    await redisService.setBotPaused(userId, true, ttlSeconds);
    console.log(`⏸️ [ChatwootService] Bot pausado para el usuario ${userId} (atención humana activa).`);
  }

  public async resumeBotForUser(userId: string): Promise<void> {
    await redisService.setBotPaused(userId, false);
    console.log(`▶️ [ChatwootService] Bot reactivado para el usuario ${userId}.`);
  }

  /**
   * Sincroniza un mensaje recibido del paciente hacia la bandeja de Chatwoot
   */
  public async syncIncomingMessage(params: {
    userId: string;
    userName: string;
    userPhone?: string;
    text: string;
  }): Promise<void> {
    if (!this.isConfigured || !this.client) return;

    try {
      // 1. Buscar o crear contacto en Chatwoot
      const contactRes = await this.client.post('/contacts', {
        inbox_id: env.CHATWOOT_INBOX_ID,
        name: params.userName,
        phone_number: params.userPhone || undefined,
        identifier: params.userId,
      }).catch(async () => {
        // Si ya existe, buscar por identificador
        return this.client.get(`/contacts/search?q=${encodeURIComponent(params.userId)}`);
      });

      const contactId = contactRes?.data?.payload?.contact?.id || contactRes?.data?.payload?.[0]?.id;
      if (!contactId) return;

      // 2. Crear o reutilizar conversación abierta
      const convRes = await this.client.post('/conversations', {
        source_id: params.userId,
        inbox_id: env.CHATWOOT_INBOX_ID,
        contact_id: contactId,
        status: 'open',
      }).catch(() => null);

      const conversationId = convRes?.data?.id;
      if (!conversationId) return;

      // 3. Crear el mensaje del paciente
      await this.client.post(`/conversations/${conversationId}/messages`, {
        content: params.text,
        message_type: 'incoming',
      });
    } catch (err: any) {
      console.warn('⚠️ [ChatwootService] Error al sincronizar mensaje entrante:', err?.message || err);
    }
  }

  /**
   * Sincroniza la respuesta de la IA hacia la conversación en Chatwoot
   */
  public async syncBotOutgoingMessage(userId: string, text: string): Promise<void> {
    if (!this.isConfigured || !this.client) return;

    try {
      // Enviar mensaje como respuesta de bot
      await this.client.post(`/conversations/messages`, {
        source_id: userId,
        inbox_id: env.CHATWOOT_INBOX_ID,
        content: text,
        message_type: 'outgoing',
      });
    } catch {
      // No bloquear la experiencia de chat si Chatwoot tiene timeout
    }
  }

  /**
   * Procesa webhooks entrantes de Chatwoot para el Human Handoff automático
   */
  public async handleWebhookEvent(payload: ChatwootWebhookPayload): Promise<{ handled: boolean; action: string }> {
    const event = payload.event;
    console.log(`📩 [ChatwootService] Webhook recibido: ${event}`);

    // Evento 1: Un asesor humano escribe desde la bandeja de Chatwoot
    if (event === 'message_created') {
      const isAgent = payload.sender?.type === 'user';
      const isOutgoing = payload.message_type === 'outgoing' || payload.message_type === 1;
      const isPrivate = payload.private === true;

      if (isAgent && isOutgoing && !isPrivate) {
        const userId = payload.conversation?.meta?.sender?.identifier || String(payload.conversation?.id);
        if (userId) {
          // Pausar el bot para que el humano tenga el control exclusivo
          await this.pauseBotForUser(userId, 7200); // 2 horas de pausa
          return { handled: true, action: `bot_paused_for_${userId}` };
        }
      }
    }

    // Evento 2: El asesor resuelve o cierra la conversación en Chatwoot
    if (event === 'conversation_status_changed') {
      const status = payload.conversation?.status;
      if (status === 'resolved') {
        const userId = payload.conversation?.meta?.sender?.identifier || String(payload.conversation?.id);
        if (userId) {
          await this.resumeBotForUser(userId);
          return { handled: true, action: `bot_resumed_for_${userId}` };
        }
      }
    }

    return { handled: false, action: 'ignored' };
  }

  /**
   * Notifica a la recepción sobre una urgencia médica grave (dolor 8-10 o traumatismo)
   */
  public async notifyEmergencyHandoff(params: {
    userId: string;
    userName: string;
    userPhone?: string;
    painLevel: number;
    summary: string;
  }): Promise<void> {
    await this.pauseBotForUser(params.userId);
    console.log(`🚨 [ChatwootService] ALERTA DE TRIAJE GRAVE:`, params);

    if (!this.isConfigured || !this.client) {
      console.log(`ℹ️ [ChatwootService] Chatwoot no configurado en .env. Alerta registrada en logs.`);
      return;
    }

    try {
      await this.client.post('/conversations', {
        inbox_id: env.CHATWOOT_INBOX_ID,
        source_id: params.userId,
        custom_attributes: {
          urgencia: 'ALTA_PRIORIDAD_DOLOR',
          dolor: params.painLevel,
        },
        message: {
          content: `🚨 [URGENCIA ODONTOCARE]\nPaciente: ${params.userName} (${params.userPhone || 'Sin teléfono'})\nNivel de Dolor: ${params.painLevel}/10\nSíntomas: ${params.summary}\n⚠️ El bot ha sido pausado automáticamente. Requiere intervención inmediata del equipo médico.`,
          private: true,
        },
      });
    } catch (err: any) {
      console.warn(`⚠️ [ChatwootService] No se pudo crear ticket de urgencia en Chatwoot:`, err?.message || err);
    }
  }
}

export const chatwootService = new ChatwootService();
