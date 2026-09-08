import { describe, it, expect } from 'vitest';
import { redisService } from '../src/services/redis.service.js';

describe('RedisService (Modo Híbrido / Fallback)', () => {
  it('debe almacenar y vaciar el buffer de mensajes', async () => {
    const userId = 'test_user_buffer';
    await redisService.pushToBuffer(userId, 'Hola');
    await redisService.pushToBuffer(userId, 'quiero cita');

    const flushed = await redisService.flushBuffer(userId);
    expect(flushed).toEqual(['Hola', 'quiero cita']);

    const empty = await redisService.flushBuffer(userId);
    expect(empty).toEqual([]);
  });

  it('debe gestionar el estado de pausa del bot (Human Handoff)', async () => {
    const userId = 'test_user_pause';
    expect(await redisService.isBotPaused(userId)).toBe(false);

    await redisService.setBotPaused(userId, true);
    expect(await redisService.isBotPaused(userId)).toBe(true);

    await redisService.setBotPaused(userId, false);
    expect(await redisService.isBotPaused(userId)).toBe(false);
  });

  it('debe adquirir y liberar bloqueos atómicos contra colisiones', async () => {
    const key = 'slot_2026-09-14T15:00:00Z';
    const lock1 = await redisService.acquireLock(key, 1000);
    expect(lock1).toBe(true);

    // Segundo intento inmediato debe ser rechazado
    const lock2 = await redisService.acquireLock(key, 1000);
    expect(lock2).toBe(false);

    await redisService.releaseLock(key);
    const lock3 = await redisService.acquireLock(key, 1000);
    expect(lock3).toBe(true);
    await redisService.releaseLock(key);
  });
});
