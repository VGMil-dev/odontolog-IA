import path from 'path';
import { generateText, CoreMessage } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { env } from '../config/env.js';
import { buildSystemPrompt } from './prompts.js';
import { createOdontoTools } from './tools.js';
import { SessionCryptoService } from '../services/session-crypto.js';
import { OdontoGuardrails } from './guardrails.js';
import { PrivacyService } from '../services/privacy.service.js';
import { SecureLogger } from '../utils/logger.js';
import { cleanChatFormatting } from '../utils/text.utils.js';

export interface AgentResponse {
  text: string;
  toolCallsCount: number;
  modelUsed: string;
  durationMs: number;
  reasoningSteps: string[];
}

export class OdontoAgentCore {
  private userHistories: Map<string, CoreMessage[]> = new Map();
  private processingUsers: Set<string> = new Set();
  private sessionsFile: string;
  private debugMode: boolean = false;
  private openaiProvider: any;
  private googleProvider: any;
  private isGateway = false;

  constructor() {
    this.sessionsFile = path.resolve(process.cwd(), '.sessions.json');
    this.initProviders();
    this.loadSessions();
  }

  private loadSessions() {
    try {
      const data = SessionCryptoService.decryptFromFile(this.sessionsFile);
      for (const [userId, history] of Object.entries(data)) {
        this.userHistories.set(userId, history as CoreMessage[]);
      }
      SecureLogger.info('OdontoAgentCore', `Sesiones previas cargadas cifradas (${this.userHistories.size} usuarios).`);
    } catch (err) {
      SecureLogger.warn('OdontoAgentCore', 'No se pudieron cargar sesiones previas:', err);
    }
  }

  private saveSessions() {
    try {
      const obj: Record<string, CoreMessage[]> = {};
      for (const [k, v] of this.userHistories.entries()) {
        obj[k] = v;
      }
      SessionCryptoService.encryptToFile(this.sessionsFile, obj);
    } catch (err) {
      SecureLogger.warn('OdontoAgentCore', 'No se pudieron persistir sesiones:', err);
    }
  }

  private initProviders() {
    const gatewayKey = env.VERCEL_AI_GATEWAY_KEY || env.AI_GATEWAY_API_KEY;
    const directKey = env.OPENAI_API_KEY && !env.OPENAI_API_KEY.startsWith('sk-...') ? env.OPENAI_API_KEY : undefined;

    if (gatewayKey && gatewayKey.startsWith('vck_')) {
      this.isGateway = true;
      SecureLogger.info('OdontoAgentCore', 'Conectado a Vercel AI Gateway.');
      this.openaiProvider = createOpenAI({
        apiKey: gatewayKey,
        baseURL: 'https://ai-gateway.vercel.sh/v1',
      });
    } else {
      this.isGateway = false;
      this.openaiProvider = createOpenAI({
        apiKey: directKey || 'dummy_key',
      });
    }

    // Proveedor Google Gemini para Fallback
    const googleApiKey = env.GOOGLE_GENERATIVE_AI_API_KEY && !env.GOOGLE_GENERATIVE_AI_API_KEY.startsWith('AIzaSy...') 
      ? env.GOOGLE_GENERATIVE_AI_API_KEY 
      : 'dummy_key';

    this.googleProvider = createGoogleGenerativeAI({
      apiKey: googleApiKey,
    });
  }

  public setDebugMode(active: boolean) {
    this.debugMode = active;
  }

  public isDebugMode(): boolean {
    return this.debugMode;
  }

  public clearHistory(userId: string) {
    this.userHistories.delete(userId);
    this.saveSessions();
  }

  /**
   * Procesa el mensaje del usuario utilizando la cascada de modelos con Vercel AI SDK,
   * guardrails pre/post y cumplimiento normativo ISO 42001 / LOPDP.
   */
  public async processMessage(userId: string, incomingText: string): Promise<AgentResponse> {
    const startTime = Date.now();
    const reasoningSteps: string[] = [];

    // 1. Guardrail de entrada: Detección de Jailbreak y desvío de rol
    const inputCheck = OdontoGuardrails.inspectInput(incomingText);
    if (!inputCheck.passed) {
      return {
        text: inputCheck.sanitizedResponse || 'Lo siento, no puedo procesar esa solicitud.',
        toolCallsCount: 0,
        modelUsed: 'guardrail/input-filter',
        durationMs: Date.now() - startTime,
        reasoningSteps: [`Guardrail de entrada activado: ${inputCheck.blockedReason}`],
      };
    }

    // 2. Cumplimiento LOPDP: Detección de solicitud de Derecho al Olvido (Art. 21)
    if (PrivacyService.isErasureRequest(incomingText)) {
      const erasureResult = await PrivacyService.executeRightToErasure(userId);
      return {
        text: erasureResult.message,
        toolCallsCount: 0,
        modelUsed: 'privacy/right-to-erasure',
        durationMs: Date.now() - startTime,
        reasoningSteps: ['Derecho al olvido ejecutado exitosamente conforme a LOPDP Ecuador.'],
      };
    }

    // 3. Prevenir carreras de inferencia simultánea para el mismo usuario
    if (this.processingUsers.has(userId)) {
      SecureLogger.info('OdontoAgentCore', `Esperando finalización de inferencia previa para usuario protegido...`);
      let waitAttempts = 0;
      while (this.processingUsers.has(userId) && waitAttempts < 15) {
        await new Promise(res => setTimeout(res, 300));
        waitAttempts++;
      }
    }
    this.processingUsers.add(userId);

    try {
      // Obtener historial o inicializar
      let history = this.userHistories.get(userId) || [];
      history.push({ role: 'user', content: incomingText });

      // Limitar historial a últimos 16 turnos (sliding window) para evitar OOM y costos excesivos
      if (history.length > 16) {
        history = history.slice(-16);
      }

      const systemPrompt = buildSystemPrompt();
      const tools = createOdontoTools(userId);

      let modelUsed = env.PRIMARY_MODEL;
      let responseText = '';
      let toolCallsCount = 0;

      // Intento 1: Modelo Primario (GPT-4o-mini)
      try {
        reasoningSteps.push(`Iniciando inferencia con modelo primario: ${modelUsed}`);
        const modelId = this.isGateway ? modelUsed : modelUsed.replace('openai/', '');
        const primaryModel = this.openaiProvider(modelId);

        const result = await generateText({
          model: primaryModel,
          system: systemPrompt,
          messages: history,
          tools,
          maxSteps: 5,
          temperature: 0.2, // Baja temperatura para máxima precisión y fidelidad clínica
        });

        responseText = result.text;
        toolCallsCount = result.toolCalls?.length || 0;

        if (result.toolCalls && result.toolCalls.length > 0) {
          for (const tc of result.toolCalls) {
            reasoningSteps.push(`Herramienta ejecutada: [${tc.toolName}] con parámetros: ${JSON.stringify(tc.args)}`);
          }
        }
      } catch (primaryErr: any) {
        SecureLogger.warn('OdontoAgentCore', `Fallo en modelo primario (${modelUsed}):`, primaryErr);
        reasoningSteps.push(`⚠️ Fallo en ${modelUsed}: ${primaryErr?.message || 'Error de conexión'}. Activando Fallback...`);

        // Intento 2: Fallback a Gemini 2.5 Flash
        try {
          modelUsed = env.FALLBACK_MODEL;
          const geminiModelId = modelUsed.replace('google/', '');
          const fallbackModel = this.googleProvider(geminiModelId);

          reasoningSteps.push(`Conmutando a modelo de respaldo: ${modelUsed}`);

          const fallbackResult = await generateText({
            model: fallbackModel,
            system: systemPrompt,
            messages: history,
            tools,
            maxSteps: 5,
            temperature: 0.2,
          });

          responseText = fallbackResult.text;
          toolCallsCount = fallbackResult.toolCalls?.length || 0;

          if (fallbackResult.toolCalls && fallbackResult.toolCalls.length > 0) {
            for (const tc of fallbackResult.toolCalls) {
              reasoningSteps.push(`Herramienta ejecutada en fallback: [${tc.toolName}]`);
            }
          }
        } catch (fallbackErr: any) {
          SecureLogger.error('OdontoAgentCore', `Fallo en modelo de respaldo:`, fallbackErr);
          responseText = 'Disculpa la molestia, tuvimos una pequeña interrupción de conexión momentánea. Por favor intenta enviarme tu mensaje nuevamente o llámanos directamente.';
          reasoningSteps.push(`Error en modelos disponibles.`);
        }
      }

      // 4. Guardrail de salida determinista: Bloqueo absoluto de prescripción de fármacos
      const outputCheck = OdontoGuardrails.inspectOutput(responseText);
      if (!outputCheck.passed) {
        reasoningSteps.push(`Guardrail de salida activado: ${outputCheck.blockedReason}`);
        responseText = outputCheck.sanitizedResponse || responseText;
      }

      // 5. Sanitización Zero-Markdown defensiva
      responseText = cleanChatFormatting(responseText);

      // Guardar respuesta del asistente en el historial
      history.push({ role: 'assistant', content: responseText });
      this.userHistories.set(userId, history);
      this.saveSessions();

      const durationMs = Date.now() - startTime;
      return {
        text: responseText,
        toolCallsCount,
        modelUsed,
        durationMs,
        reasoningSteps,
      };
    } finally {
      this.processingUsers.delete(userId);
    }
  }
}

export const agentCore = new OdontoAgentCore();
