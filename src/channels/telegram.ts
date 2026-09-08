import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { env } from '../config/env.js';
import { voiceService } from '../services/voice.service.js';
import { agentCore } from '../agent/core.js';
import { adminConsole } from '../admin/console.js';
import { messageBuffer } from './buffer.js';
import { chatwootService } from '../services/chatwoot.service.js';

export class TelegramChannel {
  public bot: Telegraf;

  constructor() {
    this.bot = new Telegraf(env.TELEGRAM_BOT_TOKEN);
    this.setupHandlers();
  }

  private setupHandlers() {
    // Comando /start
    this.bot.start(async (ctx) => {
      const chatId = ctx.chat.id;
      const userName = ctx.from?.first_name || 'Paciente';

      if (adminConsole.isAdmin(chatId)) {
        await ctx.reply(`👋 ¡Hola Administrador! Has iniciado sesión en la Torre de Control de OdontoCare.\nEscribe /help para ver los comandos de diagnóstico y auto-corrección.`);
        return;
      }

      await ctx.reply(
        `¡Hola ${userName}! 🦷 Bienvenido a Clínica Dental OdontoCare en Cuenca.\n\nSoy Valeria, tu asistente y coordinadora de atención. ¿En qué te puedo colaborar hoy? Puedes escribirme o enviarme un audio si prefieres.`
      );
    });

    // Manejo de notas de voz
    this.bot.on(message('voice'), async (ctx) => {
      const chatId = ctx.chat.id;
      const userId = String(chatId);

      // Si el bot está pausado para este paciente por atención humana
      if (await chatwootService.isBotPausedForUser(userId)) {
        console.log(`ℹ️ [Telegram] Mensaje de voz ignorado para ${userId} (bot en pausa humana).`);
        return;
      }

      try {
        await ctx.sendChatAction('typing');
        const fileId = ctx.message.voice.file_id;
        const fileUrl = await ctx.telegram.getFileLink(fileId);

        console.log(`🎙️ [Telegram] Nota de voz recibida de ${userId}, transcribiendo...`);
        let transcribedText = '';

        if (voiceService.isAvailable()) {
          transcribedText = await voiceService.transcribeFromUrl(fileUrl.href);
        } else {
          transcribedText = '[Nota de voz recibida: no se pudo transcribir porque ASSEMBLYAI_API_KEY no está configurada]';
        }

        if (!transcribedText.trim()) {
          await ctx.reply('No pude escuchar con claridad el audio. ¿Podrías repetirlo o escribirlo por favor?');
          return;
        }

        // Enviar al buffer de mensajes para procesar con debounce
        this.processBufferedInput(ctx, userId, transcribedText);
      } catch (err: any) {
        console.error('❌ [Telegram] Error procesando nota de voz:', err?.message || err);
        await ctx.reply('Tuvimos un pequeño inconveniente al escuchar tu nota de voz. Por favor envíanos tu consulta en texto.');
      }
    });

    // Manejo de mensajes de texto
    this.bot.on(message('text'), async (ctx) => {
      const chatId = ctx.chat.id;
      const userId = String(chatId);
      const text = ctx.message.text;

      // 1. Verificar si es comando del Administrador
      if (adminConsole.isAdmin(chatId) && text.startsWith('/')) {
        const adminResponse = await adminConsole.handleAdminCommand(chatId, text);
        if (adminResponse) {
          await ctx.reply(adminResponse, { parse_mode: 'Markdown' });
          return;
        }
      }

      // 2. Si el bot está pausado para este paciente por atención humana
      if (await chatwootService.isBotPausedForUser(userId)) {
        console.log(`ℹ️ [Telegram] Mensaje ignorado para ${userId} (bot en pausa humana).`);
        return;
      }

      // 3. Enviar a la cola anti-ráfagas
      this.processBufferedInput(ctx, userId, text);
    });
  }

  private processBufferedInput(ctx: any, userId: string, text: string) {
    messageBuffer.enqueue(userId, text, async (combinedText: string) => {
      try {
        await ctx.sendChatAction('typing');
        console.log(`🤖 [Telegram] Procesando mensaje consolidado para ${userId}: "${combinedText}"`);

        const userName = ctx.from?.first_name ? `${ctx.from.first_name} ${ctx.from.last_name || ''}`.trim() : 'Paciente Telegram';
        chatwootService.syncIncomingMessage({
          userId,
          userName,
          text: combinedText,
        }).catch(() => {});

        const response = await agentCore.processMessage(userId, combinedText);

        const rawText = response.text;
        const cleanText = cleanChatFormatting(rawText);

        console.log(`\n=============================================================`);
        console.log(`🤖 [Respuesta IA enviada a ${userId}]:`);
        console.log(cleanText);
        console.log(`⏱️ Latencia: ${response.durationMs}ms | Modelo: ${response.modelUsed}`);
        console.log(`=============================================================\n`);

        // Si está en modo debug y el admin está escuchando
        if (agentCore.isDebugMode() && env.TELEGRAM_ADMIN_CHAT_ID) {
          const debugMsg = `🔍 [DEBUG TRACE - Paciente ${userId}]\nLatencia: ${response.durationMs}ms | Modelo: ${response.modelUsed}\nTools: ${response.toolCallsCount}\nPasos:\n${response.reasoningSteps.join('\n')}`;
          this.bot.telegram.sendMessage(env.TELEGRAM_ADMIN_CHAT_ID, debugMsg).catch(() => {});
        }

        await ctx.reply(cleanText).catch(async () => {
          await ctx.reply(cleanText);
        });
        console.log(`📤 [Telegram] Respuesta enviada con éxito a ${userId}`);

        // Sincronizar respuesta del bot hacia Chatwoot
        chatwootService.syncBotOutgoingMessage(userId, cleanText).catch(() => {});
      } catch (err: any) {
        console.error(`❌ [Telegram] Error al procesar respuesta del agente:`, err?.message || err);
        await ctx.reply(
          'Disculpa, tuvimos una interrupción momentánea. Si es una urgencia dental, por favor contáctanos de inmediato a nuestra línea de atención.'
        );
      }
    });
  }

  public async start() {
    console.log('🚀 [TelegramChannel] Conectando bot de Telegram...');
    try {
      const me = await this.bot.telegram.getMe();
      console.log(`🤖 [TelegramChannel] Conectado exitosamente como @${me.username} (${me.first_name})`);
      this.bot.launch().catch(err => {
        console.error('❌ [TelegramChannel] Error en polling:', err?.message || err);
      });
      console.log('✅ [TelegramChannel] Bot de Telegram activo y escuchando mensajes.');
    } catch (err: any) {
      console.error('❌ [TelegramChannel] Error al verificar credenciales con Telegram:', err?.message || err);
      throw err;
    }
  }

  public stop() {
    this.bot.stop('SIGINT');
  }
}

export const telegramChannel = new TelegramChannel();

/**
 * Limpia cualquier residuo de sintaxis Markdown o listas robóticas para asegurar
 * que el mensaje luzca 100% como un texto humano y natural en WhatsApp/Telegram.
 */
export function cleanChatFormatting(text: string): string {
  if (!text) return '';
  return text
    // Eliminar negritas y cursivas de markdown (**texto** o *texto* o __texto__)
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    // Eliminar encabezados markdown (### Título)
    .replace(/^#{1,6}\s+/gm, '')
    // Eliminar viñetas de guión o asterisco al inicio de línea (- elemento o * elemento)
    .replace(/^\s*[-*]\s+/gm, '')
    // Eliminar backticks de código
    .replace(/`([^`]+)`/g, '$1')
    // Limpiar saltos de línea excesivos
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
