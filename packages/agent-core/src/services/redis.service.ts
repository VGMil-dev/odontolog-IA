// @ts-nocheck
import Redis from 'ioredis';
import { env } from '../config/env.js';

export class RedisService {
  private client: Redis | null = null;
  private isConnected: boolean = false;
  private memoryStore = new Map<string, any>();

  constructor() {
    if (env.REDIS_URL) {
      try {
        this.client = new Redis(env.REDIS_URL, {
          maxRetriesPerRequest: 2,
          retryStrategy(times) {
            if (times > 3) {
              console.warn('⚠️ [RedisService] No se pudo conectar a Redis. Continuando en modo memoria local.');
              return null;
            }
            return Math.min(times * 200, 1000);
          },
        });

        this.client.on('connect', () => {
          this.isConnected = true;
          console.log('⚡ [RedisService] Conectado exitosamente a Redis distribuido.');
        });

        this.client.on('error', (_err) => {
          this.isConnected = false;
        });
      } catch (err: any) {
        console.warn('⚠️ [RedisService] Excepción al instanciar Redis:', err?.message || err);
      }
    } else {
      console.log('ℹ️ [RedisService] REDIS_URL no definida. Operando con almacén de memoria local.');
    }
  }

  public isReady(): boolean {
    return this.isConnected && this.client !== null;
  }

  /**
   * Obtiene un valor clave/valor genérico con fallback local
   */
  public async get(key: string): Promise<string | null> {
    if (this.isReady() && this.client) {
      try {
        return await this.client.get(key);
      } catch (err) {
        console.warn('⚠️ [RedisService] Error en get distribuido, usando fallback:', err);
      }
    }
    return this.memoryStore.get(key) || null;
  }

  /**
   * Almacena un valor clave/valor con TTL opcional y fallback local
   */
  public async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (this.isReady() && this.client) {
      try {
        if (ttlSeconds) {
          await this.client.setex(key, ttlSeconds, value);
        } else {
          await this.client.set(key, value);
        }
        return;
      } catch (err) {
        console.warn('⚠️ [RedisService] Error en set distribuido, usando fallback:', err);
      }
    }
    this.memoryStore.set(key, value);
    if (ttlSeconds) {
      setTimeout(() => this.memoryStore.delete(key), ttlSeconds * 1000);
    }
  }

  /**
   * Elimina una clave con fallback local
   */
  public async del(key: string): Promise<void> {
    if (this.isReady() && this.client) {
      try {
        await this.client.del(key);
        return;
      } catch (err) {
        console.warn('⚠️ [RedisService] Error en del distribuido:', err);
      }
    }
    this.memoryStore.delete(key);
  }

  /**
   * Agrega un mensaje a la cola buffer del usuario
   */
  public async pushToBuffer(userId: string, text: string): Promise<string[]> {
    if (this.isReady() && this.client) {
      const key = `buffer:${userId}`;
      await this.client.rpush(key, text);
      await this.client.expire(key, 60); // 1 minuto de vida máxima
      return this.client.lrange(key, 0, -1);
    }

    const current = this.memoryStore.get(`buffer:${userId}`) || [];
    current.push(text);
    this.memoryStore.set(`buffer:${userId}`, current);
    return current;
  }

  /**
   * Obtiene y vacía el buffer acumulado para procesamiento
   */
  public async flushBuffer(userId: string): Promise<string[]> {
    if (this.isReady() && this.client) {
      const key = `buffer:${userId}`;
      const items = await this.client.lrange(key, 0, -1);
      await this.client.del(key);
      return items;
    }

    const key = `buffer:${userId}`;
    const items = this.memoryStore.get(key) || [];
    this.memoryStore.delete(key);
    return items;
  }

  /**
   * Marca al bot como pausado para un usuario (Human Handoff)
   */
  public async setBotPaused(userId: string, paused: boolean, ttlSeconds: number = 3600): Promise<void> {
    const key = `paused:${userId}`;
    if (this.isReady() && this.client) {
      if (paused) {
        await this.client.setex(key, ttlSeconds, 'true');
      } else {
        await this.client.del(key);
      }
      return;
    }

    if (paused) {
      this.memoryStore.set(key, true);
    } else {
      this.memoryStore.delete(key);
    }
  }

  /**
   * Verifica si el bot está pausado para el usuario
   */
  public async isBotPaused(userId: string): Promise<boolean> {
    const key = `paused:${userId}`;
    if (this.isReady() && this.client) {
      const val = await this.client.get(key);
      return val === 'true';
    }

    return this.memoryStore.has(key);
  }

  /**
   * Bloqueo atómico distribuido (para evitar doble reserva de turnos en paralelo)
   */
  public async acquireLock(resourceKey: string, ttlMs: number = 5000): Promise<boolean> {
    const key = `lock:${resourceKey}`;
    if (this.isReady() && this.client) {
      const result = await this.client.set(key, 'locked', 'PX', ttlMs, 'NX');
      return result === 'OK';
    }

    if (this.memoryStore.has(key)) {
      return false;
    }
    this.memoryStore.set(key, true);
    setTimeout(() => this.memoryStore.delete(key), ttlMs);
    return true;
  }

  public async releaseLock(resourceKey: string): Promise<void> {
    const key = `lock:${resourceKey}`;
    if (this.isReady() && this.client) {
      await this.client.del(key);
      return;
    }
    this.memoryStore.delete(key);
  }
}

export const redisService = new RedisService();
