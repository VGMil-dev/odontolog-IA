import express, { Request, Response } from 'express';
import crypto from 'crypto';
import { env } from './config/env.js';
import { redisService } from './services/redis.service.js';
import { chatwootService } from './services/chatwoot.service.js';
import { whatsappChannel } from './channels/whatsapp.js';
import { clinicManager } from './config/clinic.js';
import { clinicsRegistry } from './config/clinics.registry.js';
import { calendarService } from './services/calendar.service.js';
import { agentCore } from './agent/core.js';
import { cleanChatFormatting } from './channels/telegram.js';
import { getChatUiHtml } from './server/chat-ui.js';
import { getAdminDashboardHtml } from './server/admin-dashboard-ui.js';
import { authService } from './services/auth.service.js';
import { evolutionService } from './services/evolution.service.js';
import { PrivacyService } from './services/privacy.service.js';
import { SecureLogger } from './utils/logger.js';

export function createServer() {
  const app = express();

  // Parse JSON and urlencoded payloads
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // 1. Health Check Endpoint
  app.get('/health', (_req: Request, res: Response) => {
    const mem = process.memoryUsage();
    res.json({
      status: 'healthy',
      service: 'OdontoCare IA Core',
      compliance: ['ISO/IEC 42001:2026', 'LOPDP Ecuador', 'ISO 27001'],
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      memoryMb: {
        rss: (mem.rss / 1024 / 1024).toFixed(1),
        heapUsed: (mem.heapUsed / 1024 / 1024).toFixed(1),
      },
      redis: {
        connected: redisService.isReady(),
        mode: redisService.isReady() ? 'distributed' : 'local_fallback',
      },
      clinic: {
        name: clinicManager.getConfig().name,
        doctorsCount: clinicManager.getConfig().doctors.length,
      },
      activeProvider: env.ACTIVE_PROVIDER,
    });
  });

  // 2. Chat Playground Web UI (Testing / Debugging sin Telegram/WhatsApp)
  app.get('/chat', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(getChatUiHtml());
  });

  // 3. Torre de Control & Dashboard Multi-Agente (Gestor de Clínicas y Flujos)
  app.get(['/dashboard', '/admin'], (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(getAdminDashboardHtml());
  });

  // 4. Autenticación Administrativa (BuilderBot Style)
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ ok: false, error: 'Usuario y contraseña requeridos.' });
    }

    const isValid = authService.validateCredentials(username, password);
    if (!isValid) {
      return res.status(401).json({ ok: false, error: 'Credenciales inválidas.' });
    }

    const token = authService.createSessionToken(username);
    return res.status(200).json({
      ok: true,
      token,
      user: username,
      expiresIn: '7d',
    });
  });

  app.get('/api/auth/verify', (req: Request, res: Response) => {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : '';
    const { valid, user } = authService.verifyToken(token);
    return res.status(200).json({ ok: valid, user });
  });

  // 5. WhatsApp Instance & QR Code Provider (Evolution API)
  app.get('/api/whatsapp/qr/:instanceName', async (req: Request, res: Response) => {
    try {
      const instanceName = Array.isArray(req.params.instanceName) ? req.params.instanceName[0] : req.params.instanceName;
      const qrData = await evolutionService.getConnectQr(instanceName);
      return res.status(200).json({ ok: true, ...qrData });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: err?.message });
    }
  });

  app.get('/api/whatsapp/status/:instanceName', async (req: Request, res: Response) => {
    try {
      const instanceName = Array.isArray(req.params.instanceName) ? req.params.instanceName[0] : req.params.instanceName;
      const state = await evolutionService.getConnectionState(instanceName);
      return res.status(200).json({ ok: true, state });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: err?.message });
    }
  });

  // 6. API Multi-Tenant: Gestión de Clínicas Odontológicas
  app.get('/api/clinics', (_req: Request, res: Response) => {
    return res.status(200).json({
      ok: true,
      clinics: clinicsRegistry.getAll(),
    });
  });

  app.post('/api/clinics', authService.requireAdminAuth, (req: Request, res: Response) => {
    try {
      const data = req.body;
      if (!data?.clinicId || !data?.name) {
        return res.status(400).json({ ok: false, error: 'clinicId y name son requeridos.' });
      }
      const saved = clinicsRegistry.save(data);
      return res.status(201).json({ ok: true, clinic: saved });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: err?.message });
    }
  });

  app.delete('/api/clinics/:id', authService.requireAdminAuth, (req: Request, res: Response) => {
    const clinicId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const success = clinicsRegistry.delete(clinicId);
    return res.status(200).json({ ok: success });
  });

  // Configuración de Credenciales Oficiales de Meta Cloud API para una Clínica
  app.post('/api/clinics/:id/meta-whatsapp', authService.requireAdminAuth, (req: Request, res: Response) => {
    const clinicId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const clinic = clinicsRegistry.getById(clinicId);
    if (!clinic) {
      return res.status(404).json({ ok: false, error: 'Clínica no encontrada.' });
    }

    const { metaPhoneNumberId, metaWabaId, metaAccessToken } = req.body;
    clinic.metaPhoneNumberId = metaPhoneNumberId !== undefined ? metaPhoneNumberId : clinic.metaPhoneNumberId;
    clinic.metaWabaId = metaWabaId !== undefined ? metaWabaId : clinic.metaWabaId;
    clinic.metaAccessToken = metaAccessToken !== undefined ? metaAccessToken : clinic.metaAccessToken;

    clinicsRegistry.save(clinic);
    return res.status(200).json({ ok: true, clinic });
  });

  // Envío de Prueba de Meta Cloud API
  app.post('/api/clinics/:id/meta-whatsapp/test', authService.requireAdminAuth, async (req: Request, res: Response) => {
    const clinicId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const clinic = clinicsRegistry.getById(clinicId);
    if (!clinic) {
      return res.status(404).json({ ok: false, error: 'Clínica no encontrada.' });
    }

    const targetPhone = req.body?.phone || clinic.emergencyPhone;
    const success = await whatsappChannel.sendMetaCloudMessage(
      targetPhone,
      `🦷 *OdontoCare IA*: Verificación oficial de Meta WhatsApp Cloud API para ${clinic.name}. Conexión 100% oficial y protegida contra baneos.`,
      clinic
    );

    return res.status(200).json({ ok: success, targetPhone });
  });

  // 7. API Multi-Tenant: Gestión de Doctores & Especialistas
  app.get('/api/clinics/:id/doctors', (req: Request, res: Response) => {
    const clinicId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const clinic = clinicsRegistry.getById(clinicId);
    if (!clinic) return res.status(404).json({ ok: false, error: 'Clínica no encontrada' });
    return res.status(200).json({ ok: true, doctors: clinic.doctors || [] });
  });

  app.post('/api/clinics/:id/doctors', authService.requireAdminAuth, (req: Request, res: Response) => {
    const clinicId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const doctor = req.body;
    if (!doctor?.id || !doctor?.name || !doctor?.specialty) {
      return res.status(400).json({ ok: false, error: 'id, name y specialty son requeridos' });
    }
    const success = clinicsRegistry.addDoctor(clinicId, doctor);
    return res.status(200).json({ ok: success });
  });

  app.delete('/api/clinics/:id/doctors/:doctorId', authService.requireAdminAuth, (req: Request, res: Response) => {
    const clinicId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const doctorId = Array.isArray(req.params.doctorId) ? req.params.doctorId[0] : req.params.doctorId;
    const success = clinicsRegistry.deleteDoctor(clinicId, doctorId);
    return res.status(200).json({ ok: success });
  });

  // 8. API Multi-Tenant: Gestión de Catálogo de Tratamientos & Precios Oficiales
  app.get('/api/clinics/:id/treatments', (req: Request, res: Response) => {
    const clinicId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const clinic = clinicsRegistry.getById(clinicId);
    if (!clinic) return res.status(404).json({ ok: false, error: 'Clínica no encontrada' });
    return res.status(200).json({ ok: true, treatments: clinic.treatments || [] });
  });

  app.post('/api/clinics/:id/treatments', authService.requireAdminAuth, (req: Request, res: Response) => {
    const clinicId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const treatment = req.body;
    if (!treatment?.name || !treatment?.priceRange) {
      return res.status(400).json({ ok: false, error: 'name y priceRange son requeridos' });
    }
    const success = clinicsRegistry.addTreatment(clinicId, treatment);
    return res.status(200).json({ ok: success });
  });

  app.put('/api/clinics/:id/treatments/:index', authService.requireAdminAuth, (req: Request, res: Response) => {
    const clinicId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const index = parseInt(Array.isArray(req.params.index) ? req.params.index[0] : req.params.index, 10);
    const treatment = req.body;
    const success = clinicsRegistry.updateTreatment(clinicId, index, treatment);
    return res.status(200).json({ ok: success });
  });

  app.delete('/api/clinics/:id/treatments/:index', authService.requireAdminAuth, (req: Request, res: Response) => {
    const clinicId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const index = parseInt(Array.isArray(req.params.index) ? req.params.index[0] : req.params.index, 10);
    const success = clinicsRegistry.deleteTreatment(clinicId, index);
    return res.status(200).json({ ok: success });
  });

  app.post('/api/clinics/:id/treatments/seed-suggested', authService.requireAdminAuth, (req: Request, res: Response) => {
    const clinicId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const treatments = clinicsRegistry.seedSuggestedTreatments(clinicId);
    return res.status(200).json({ ok: true, count: treatments.length, treatments });
  });

  // 7. API Multi-Tenant: Citas Agendadas en Tiempo Real
  app.get('/api/appointments', (_req: Request, res: Response) => {
    const clinicId = _req.query.clinicId as string | undefined;
    const appointments = calendarService.getAllAppointments(clinicId);
    return res.status(200).json({ ok: true, appointments });
  });

  // 6. Direct Chat API Endpoint (Testing / REST Integration Multi-Agente)
  app.post('/api/chat', async (req: Request, res: Response) => {
    try {
      const message = req.body?.message;
      if (!message || typeof message !== 'string' || !message.trim()) {
        return res.status(400).json({
          ok: false,
          error: 'El campo "message" es obligatorio y no puede estar vacío.',
        });
      }

      const userId = (req.body?.userId && typeof req.body.userId === 'string' && req.body.userId.trim())
        ? req.body.userId.trim()
        : 'debug-web-user';

      const clinicId = (req.body?.clinicId && typeof req.body.clinicId === 'string')
        ? req.body.clinicId.trim()
        : undefined;

      const agentResponse = await agentCore.processMessage(userId, message.trim(), clinicId);
      const cleanReply = cleanChatFormatting(agentResponse.text);

      return res.status(200).json({
        ok: true,
        userId,
        clinicId: agentResponse.clinicId,
        reply: cleanReply,
        rawReply: agentResponse.text,
        modelUsed: agentResponse.modelUsed,
        durationMs: agentResponse.durationMs,
        toolCallsCount: agentResponse.toolCallsCount,
        reasoningSteps: agentResponse.reasoningSteps,
      });
    } catch (err: any) {
      SecureLogger.error('Server', 'Error en /api/chat:', err);
      return res.status(500).json({
        ok: false,
        error: err?.message || 'Error interno procesando mensaje de chat',
      });
    }
  });

  // 4. Endpoint de Derecho al Olvido / Supresión de Datos Personales (LOPDP Art. 21)
  app.post('/api/privacy/erasure', async (req: Request, res: Response) => {
    try {
      const userId = req.body?.userId;
      if (!userId || typeof userId !== 'string' || !userId.trim()) {
        return res.status(400).json({ ok: false, error: 'El campo "userId" es requerido para supresión.' });
      }

      const result = await PrivacyService.executeRightToErasure(userId.trim());
      return res.status(200).json(result);
    } catch (err: any) {
      SecureLogger.error('Server', 'Error en /api/privacy/erasure:', err);
      return res.status(500).json({ ok: false, error: 'Error procesando solicitud de supresión.' });
    }
  });

  // 5. Endpoint para limpiar historial de conversación (Reset de pruebas)
  app.post('/api/chat/clear', (req: Request, res: Response) => {
    const userId = (req.body?.userId && typeof req.body.userId === 'string' && req.body.userId.trim())
      ? req.body.userId.trim()
      : 'debug-web-user';

    agentCore.clearHistory(userId);
    return res.status(200).json({
      ok: true,
      message: `Historial de conversación eliminado para el usuario "${userId}".`,
    });
  });

  // 6. Chatwoot Webhooks (Human Handoff)
  app.post('/webhooks/chatwoot', async (req: Request, res: Response) => {
    try {
      const result = await chatwootService.handleWebhookEvent(req.body);
      res.status(200).json({ status: 'ok', result });
    } catch (err: any) {
      SecureLogger.error('Server', 'Error en webhook de Chatwoot:', err);
      res.status(500).json({ error: 'Internal webhook error' });
    }
  });

  // 7. WhatsApp Webhook (Meta Cloud API Oficial / Evolution API fallback)
  app.post('/webhooks/whatsapp', async (req: Request, res: Response) => {
    try {
      // 1. Si viene de Meta WhatsApp Cloud API (Graph API Oficial v21.0)
      if (req.body?.object === 'whatsapp_business_account' || req.body?.entry?.[0]?.changes) {
        // Meta exige confirmación HTTP 200 de inmediato
        res.status(200).json({ status: 'received' });
        // Procesamiento en segundo plano de mensaje y enrutamiento a la clínica
        whatsappChannel.handleMetaCloudWebhook(req.body).catch((err) => {
          SecureLogger.error('Server', 'Error en procesamiento asíncrono de Meta Cloud:', err);
        });
        return;
      }

      // 2. Si es un evento legado de Evolution API
      if (req.body?.event) {
        const configuredApiKey = env.EVOLUTION_API_KEY;
        const headerKey = (req.headers['apikey'] || req.headers['x-api-key'] || '') as string;
        if (configuredApiKey && configuredApiKey.length > 0) {
          const expected = Buffer.from(configuredApiKey);
          const received = Buffer.from(headerKey);
          if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
            SecureLogger.warn('Server', 'Intento de llamada no autorizada al webhook de Evolution API.');
            return res.status(401).json({ error: 'Unauthorized webhook call' });
          }
        }

        const result = await whatsappChannel.handleEvolutionWebhook(req.body);
        return res.status(200).json(result);
      }

      return res.status(200).json({ status: 'ignored' });
    } catch (err: any) {
      SecureLogger.error('Server', 'Error en webhook de WhatsApp:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Webhook processing failed' });
      }
    }
  });

  // 8. Meta Webhook Verification Challenge
  app.get('/webhooks/whatsapp', (req: Request, res: Response) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === env.META_WA_VERIFY_TOKEN) {
      SecureLogger.info('Server', 'Webhook de Meta verificado con éxito.');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  });

  return app;
}
