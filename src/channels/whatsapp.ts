import axios from 'axios';
import { env } from '../config/env.js';
import { agentCore } from '../agent/core.js';
import { messageBuffer } from './buffer.js';
import { voiceService } from '../services/voice.service.js';
import { chatwootService } from '../services/chatwoot.service.js';
import { cleanChatFormatting } from './telegram.js';

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
   * Envía un mensaje mediante Meta Cloud API oficial
   */
  public async sendMetaCloudMessage(phoneNumber: string, text: string): Promise<boolean> {
    if (!env.META_WA_ACCESS_TOKEN || !env.META_WA_PHONE_NUMBER_ID) {
      return false;
    }

    try {
      const url = `https://graph.facebook.com/v18.0/${env.META_WA_PHONE_NUMBER_ID}/messages`;
      await axios.post(
        url,
        {
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'text',
          text: { body: text },
        },
        {
          headers: {
            Authorization: `Bearer ${env.META_WA_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return true;
    } catch (err: any) {
      console.error('❌ [WhatsApp] Error al enviar mensaje vía Meta Cloud API:', err?.message || err);
      return false;
    }
  }
}

export const whatsappChannel = new WhatsAppChannel();
