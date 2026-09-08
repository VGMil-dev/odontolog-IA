import { env } from './config/env.js';
import { clinicManager } from './config/clinic.js';
import { telegramChannel } from './channels/telegram.js';
import { voiceService } from './services/voice.service.js';
import { createServer } from './server.js';
import { reminderService } from './services/reminder.service.js';

async function bootstrap() {
  const clinic = clinicManager.getConfig();

  console.log('\n=============================================================');
  console.log(`🦷 OdontoCare IA — Sistema Conversacional Odontológico`);
  console.log(`📍 Clínica: ${clinic.name} (${clinic.city})`);
  console.log(`👨‍⚕️ Especialistas cargados: ${clinic.doctors.length}`);
  console.log(`🎙️ AssemblyAI: ${voiceService.isAvailable() ? 'Conectado' : 'Sin clave (modo texto)'}`);
  console.log(`🤖 Modelo Primario: ${env.PRIMARY_MODEL}`);
  console.log(`🛡️ Modelo Fallback: ${env.FALLBACK_MODEL}`);
  console.log(`📡 Proveedor Activo: ${env.ACTIVE_PROVIDER.toUpperCase()}`);
  console.log('=============================================================\n');

  // 1. Iniciar Servidor HTTP para Webhooks y Monitoreo
  const app = createServer();
  const server = app.listen(env.PORT, env.HOST, () => {
    console.log(`🌐 [HTTP Server] Escuchando en http://${env.HOST}:${env.PORT}`);
    console.log(`   └─ Debug Chat UI: http://localhost:${env.PORT}/chat`);
    console.log(`   └─ Debug Chat API: POST http://localhost:${env.PORT}/api/chat`);
    console.log(`   └─ Health Check: http://localhost:${env.PORT}/health`);
    console.log(`   └─ Webhook Chatwoot: POST http://localhost:${env.PORT}/webhooks/chatwoot`);
    console.log(`   └─ Webhook WhatsApp: POST http://localhost:${env.PORT}/webhooks/whatsapp`);
  });

  // 2. Iniciar Cron de Recordatorios de Citas
  reminderService.start(30);

  // 3. Iniciar Canales según configuración
  if (env.ACTIVE_PROVIDER === 'telegram') {
    try {
      await telegramChannel.start();
    } catch (err: any) {
      console.error('❌ Error al iniciar el bot de Telegram:', err?.message || err);
      process.exit(1);
    }
  } else {
    console.log(`ℹ️ Proveedor [${env.ACTIVE_PROVIDER}] activo vía Webhook en /webhooks/whatsapp.`);
  }

  // Cierre ordenado
  const shutdown = (signal: string) => {
    console.log(`\n🛑 Recibida señal ${signal}. Cerrando OdontoCare IA ordenadamente...`);
    reminderService.stop();
    telegramChannel.stop();
    server.close(() => {
      console.log('🔒 Servidor HTTP cerrado.');
      process.exit(0);
    });
  };

  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((err) => {
  console.error('❌ Error crítico en bootstrap:', err);
  process.exit(1);
});

