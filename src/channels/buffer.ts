import { env } from '../config/env.js';
import { redisService } from '../services/redis.service.js';

interface TimerSession {
  timer: NodeJS.Timeout | null;
  lastActivity: number;
}

export class MessageBufferQueue {
  private timers: Map<string, TimerSession> = new Map();
  private pendingCounts: Map<string, number> = new Map();
  private debounceMs: number;

  constructor(debounceMs?: number) {
    this.debounceMs = debounceMs || env.DEBOUNCE_DELAY_MS || 5000;
  }

  /**
   * Agrega un mensaje a la cola del usuario y reprograma el disparo.
   */
  public async enqueue(
    userId: string,
    text: string,
    onReady: (combinedText: string) => Promise<void>
  ): Promise<void> {
    // Incrementar síncronamente para lecturas inmediatas
    this.pendingCounts.set(userId, (this.pendingCounts.get(userId) || 0) + 1);

    // Almacenar mensaje en Redis o memoria local
    await redisService.pushToBuffer(userId, text);

    let session = this.timers.get(userId);
    if (!session) {
      session = {
        timer: null,
        lastActivity: Date.now(),
      };
      this.timers.set(userId, session);
    }

    session.lastActivity = Date.now();

    // Cancelar temporizador previo si el paciente sigue enviando mensajes
    if (session.timer) {
      clearTimeout(session.timer);
    }

    // Programar ejecución tras periodo de silencio (debounce)
    session.timer = setTimeout(async () => {
      this.timers.delete(userId);
      this.pendingCounts.delete(userId);
      const messages = await redisService.flushBuffer(userId);
      if (!messages || messages.length === 0) return;

      const combinedText = messages.join(' \n ');
      try {
        await onReady(combinedText);
      } catch (err) {
        console.error(`❌ [MessageBufferQueue] Error procesando ráfaga para ${userId}:`, err);
      }
    }, this.debounceMs);
  }

  public getPendingCount(userId: string): number {
    return this.pendingCounts.get(userId) || 0;
  }
}

export const messageBuffer = new MessageBufferQueue();
