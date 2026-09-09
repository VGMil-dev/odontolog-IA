import axios from 'axios';
import { env } from '../config/env.js';
import { agentCore } from '../agent/core.js';
import { messageBuffer } from './buffer.js';
import { voiceService } from '../services/voice.service.js';
import { chatwootService } from '../services/chatwoot.service.js';
import { cleanChatFormatting } from './telegram.js';
import { clinicsRegistry, ClinicEntity } from '../config/clinics.registry.js';
import { SecureLogger } from '../utils/logger.js';

export class WhatsAppChannel {
  /**
   * Procesa un webhook recibido desde Evolution API (Docker)
   */
  public async handleEvolutionWebhook(payload: any): Promise<{ success: boolean; reason?: string }> {
    const event = payload?.event;
    const data = payload?.data;

    if (!data || event !== 'messages.upsert') {
      return { success: true, reason: 'ignored_event' };
    }

    const key = data.key;
    if (key?.fromMe) {
      return { success: true, reason: 'from_me' };
    }

    const senderJid = key?.remoteJid || '';
    const userId = senderJid.replace('@s.whatsapp.net', '');
    const pushName = data.pushName || 'Paciente WhatsApp';

    // Verificar si el bot está en pausa por atención humana en Chatwoot
    if (await chatwootService.isBotPausedForUser(userId)) {
      console.log(`ℹ️ [WhatsApp] Mensaje ignorado para ${userId} (bot en pausa humana).`);
      return { success: true, reason: 'bot_paused' };
    }

    // Extraer texto o audio
    let userText = '';
    const message = data.message;

    if (message?.conversation) {
      userText = message.conversation;
    } else if (message?.extendedTextMessage?.text) {
      userText = message.extendedTextMessage.text;
    } else if (message?.audioMessage) {
      console.log(`🎙️ [WhatsApp] Audio recibido de ${userId} vía Evolution API, transcribiendo...`);
      const audioUrl = data.message?.audioMessage?.url;
      if (audioUrl && voiceService.isAvailable()) {
        try {
          userText = await voiceService.transcribeFromUrl(audioUrl);
        } catch (err: any) {
          console.error('❌ [WhatsApp] Error transcribiendo audio:', err?.message || err);
        }
      }
    }

    if (!userText.trim()) {
      return { success: true, reason: 'no_text_or_unsupported' };
    }

    // Enviar a la cola anti-ráfagas (debounce con Redis/Memoria)
    await messageBuffer.enqueue(userId, userText, async (combinedText: string) => {
      try {
        console.log(`🤖 [WhatsApp] Procesando mensaje consolidado para ${userId}: "${combinedText}"`);
        
        // Sincronizar con Chatwoot
        chatwootService.syncIncomingMessage({
          userId,
          userName: pushName,
          userPhone: userId,
          text: combinedText,
        }).catch(() => {});

        const response = await agentCore.processMessage(userId, combinedText);
        const cleanText = cleanChatFormatting(response.text);

        console.log(`\n=============================================================`);
        console.log(`🤖 [WhatsApp - Respuesta enviada a ${userId}]:`);
        console.log(cleanText);
        console.log(`⏱️ Latencia: ${response.durationMs}ms | Modelo: ${response.modelUsed}`);
        console.log(`=============================================================\n`);

        // Enviar respuesta a través de Evolution API
        await this.sendEvolutionMessage(userId, cleanText);

        // Sincronizar respuesta en Chatwoot
        chatwootService.syncBotOutgoingMessage(userId, cleanText).catch(() => {});
      } catch (err: any) {
        console.error('❌ [WhatsApp] Error procesando respuesta:', err?.message || err);
      }
    });

    return { success: true };
  }

  /**
   * Envía un mensaje de texto saliente mediante Evolution API
   */
  public async sendEvolutionMessage(phoneNumber: string, text: string): Promise<boolean> {
    if (!env.EVOLUTION_API_URL || !env.EVOLUTION_API_KEY) {
      console.log(`ℹ️ [WhatsApp] EVOLUTION_API_URL no configurada. Mensaje simulado a ${phoneNumber}: "${text}"`);
      return true;
    }

    try {
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      const url = `${env.EVOLUTION_API_URL}/message/sendText/${env.EVOLUTION_INSTANCE_NAME}`;
      await axios.post(
        url,
        {
          number: cleanPhone,
          text,
          options: {
            delay: 1200,
            presence: 'composing',
          },
        },
        {
          headers: {
            apikey: env.EVOLUTION_API_KEY,
            'Content-Type': 'application/json',
          },
          timeout: 8000,
        }
      );
      return true;
    } catch (err: any) {
      console.error('❌ [WhatsApp] Error al enviar mensaje vía Evolution API:', err?.message || err);
      return false;
    }
  }

  /**
   * Procesa un webhook oficial recibido directamente desde Meta WhatsApp Cloud API (Graph API v21.0)
   */
  public async handleMetaCloudWebhook(payload: any): Promise<{ success: boolean; reason?: string }> {
    const entry = payload?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

    if (!value || value.messaging_product !== 'whatsapp') {
      return { success: true, reason: 'ignored_non_whatsapp' };
    }

    // Notificaciones de entrega o lectura (no requieren respuesta)
    if (value.statuses && !value.messages) {
      return { success: true, reason: 'status_update' };
    }

    const messages = value.messages;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return { success: true, reason: 'no_messages' };
    }

    const msg = messages[0];
    const fromNumber = msg.from;
    const userId = fromNumber;
    const contactProfile = value.contacts?.[0]?.profile?.name || 'Paciente WhatsApp';
    const metadataPhoneNumberId = value.metadata?.phone_number_id || '';

    // Enrutamiento multitenant por Phone Number ID
    const clinic = await clinicsRegistry.findByPhoneNumberId(metadataPhoneNumberId) || await clinicsRegistry.getDefault();
    SecureLogger.info('WhatsApp', `Mensaje Meta Cloud para clínica "${clinic.name}" (${clinic.clinicId}) desde ${SecureLogger.maskPhone(fromNumber)}`);

    // Verificar si el bot está en pausa por atención médica humana en Chatwoot
    if (await chatwootService.isBotPausedForUser(userId)) {
      SecureLogger.info('WhatsApp', `Mensaje ignorado para ${SecureLogger.maskPhone(userId)} (atención humana activa en Chatwoot).`);
      return { success: true, reason: 'bot_paused' };
    }

    let userText = '';
    if (msg.type === 'text' && msg.text?.body) {
      userText = msg.text.body;
    } else if (msg.type === 'audio' && msg.audio?.id) {
      SecureLogger.info('WhatsApp', `🎙️ Audio recibido vía Meta Cloud API (ID: ${msg.audio.id}), transcribiendo...`);
      if (voiceService.isAvailable()) {
        try {
          const token = clinic.metaAccessToken || env.META_WA_ACCESS_TOKEN;
          if (token) {
            const mediaRes = await axios.get(`https://graph.facebook.com/v21.0/${msg.audio.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const directUrl = mediaRes.data?.url;
            if (directUrl) {
              userText = await voiceService.transcribeFromUrl(directUrl);
            }
          }
        } catch (err: any) {
          SecureLogger.error('WhatsApp', 'Error descargando/transcribiendo audio de Meta:', err?.message || err);
        }
      }
    } else if (msg.type === 'interactive') {
      userText = msg.interactive?.button_reply?.title || msg.interactive?.list_reply?.title || '';
    }

    if (!userText.trim()) {
      return { success: true, reason: 'unsupported_message_type' };
    }

    // Enviar a la cola anti-ráfagas (debounce con Redis/Memoria)
    await messageBuffer.enqueue(userId, userText, async (combinedText: string) => {
      try {
        SecureLogger.info('WhatsApp', `Procesando mensaje Meta Cloud consolidado para ${SecureLogger.maskPhone(userId)}: "${combinedText}"`);

        // Sincronizar en Chatwoot
        chatwootService.syncIncomingMessage({
          userId,
          userName: contactProfile,
          userPhone: userId,
          text: combinedText,
        }).catch(() => {});

        // Inferencia del agente contextualizada al tenant específico
        const response = await agentCore.processMessage(userId, combinedText, clinic.clinicId);
        const cleanText = cleanChatFormatting(response.text);

        console.log(`\n=============================================================`);
        console.log(`🤖 [Meta Cloud WhatsApp - Respuesta enviada a ${userId} en ${clinic.name}]:`);
        console.log(cleanText);
        console.log(`⏱️ Latencia: ${response.durationMs}ms | Modelo: ${response.modelUsed} | Clínica: ${clinic.clinicId}`);
        console.log(`=============================================================\n`);

        // Enviar respuesta a través de Meta Cloud API Oficial
        await this.sendMetaCloudMessage(userId, cleanText, clinic);

        // Sincronizar respuesta en Chatwoot
        chatwootService.syncBotOutgoingMessage(userId, cleanText).catch(() => {});
      } catch (err: any) {
        SecureLogger.error('WhatsApp', 'Error procesando respuesta Meta Cloud:', err?.message || err);
      }
    });

    return { success: true };
  }

  /**
   * Envía un mensaje mediante Meta Cloud API oficial (Graph API v21.0)
   * 100% Oficial de Meta - Cero riesgo de baneo
   */
  public async sendMetaCloudMessage(phoneNumber: string, text: string, clinic?: ClinicEntity): Promise<boolean> {
    const phoneNumberId = clinic?.metaPhoneNumberId || env.META_WA_PHONE_NUMBER_ID;
    const accessToken = clinic?.metaAccessToken || env.META_WA_ACCESS_TOKEN;

    if (!accessToken || !phoneNumberId) {
      SecureLogger.info('WhatsApp', `[Simulación Meta Cloud API] Sin credenciales para clínica "${clinic?.clinicId || 'default'}". Mensaje a ${SecureLogger.maskPhone(phoneNumber)}: "${text}"`);
      return true;
    }

    try {
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;
      await axios.post(
        url,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanPhone,
          type: 'text',
          text: { preview_url: false, body: text },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );
      SecureLogger.info('WhatsApp', `Mensaje enviado con éxito vía Meta Cloud API a ${SecureLogger.maskPhone(phoneNumber)}`);
      return true;
    } catch (err: any) {
      SecureLogger.error('WhatsApp', 'Error al enviar mensaje vía Meta Cloud API:', err?.response?.data || err?.message || err);
      return false;
    }
  }
}

export const whatsappChannel = new WhatsAppChannel();
