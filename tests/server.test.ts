import { describe, it, expect } from 'vitest';
import { createServer } from '../src/server.js';
import { env } from '../src/config/env.js';

describe('HTTP Webhooks & Health Server', () => {
  const app = createServer();

  it('el endpoint /health debe responder con status healthy y datos de la clínica', async () => {
    const res = await new Promise<any>((resolve) => {
      const server = app.listen(0, async () => {
        const addr = server.address() as any;
        const resp = await fetch(`http://127.0.0.1:${addr.port}/health`).then(r => r.json());
        server.close(() => resolve(resp));
      });
    });

    expect(res.status).toBe('healthy');
    expect(res.service).toBe('OdontoCare IA Core');
    expect(res.clinic.doctorsCount).toBe(4);
    expect(res.redis).toBeDefined();
  });

  it('el webhook de WhatsApp debe validar el challenge de Meta', async () => {
    const res = await new Promise<any>((resolve) => {
      const server = app.listen(0, async () => {
        const addr = server.address() as any;
        const challenge = 'test_challenge_123';
        const url = `http://127.0.0.1:${addr.port}/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=${env.META_WA_VERIFY_TOKEN}&hub.challenge=${challenge}`;
        const resp = await fetch(url).then(r => r.text());
        server.close(() => resolve(resp));
      });
    });

    expect(res).toBe('test_challenge_123');
  });

  it('el endpoint GET /chat debe servir la interfaz HTML del playground de depuración', async () => {
    const html = await new Promise<string>((resolve) => {
      const server = app.listen(0, async () => {
        const addr = server.address() as any;
        const resp = await fetch(`http://127.0.0.1:${addr.port}/chat`).then(r => r.text());
        server.close(() => resolve(resp));
      });
    });

    expect(html).toContain('OdontoCare IA');
    expect(html).toContain('Playground de Chat y Depuración');
    expect(html).toContain('/api/chat');
    expect(html).toContain('Valeria');
  });

  it('el endpoint POST /api/chat debe rechazar peticiones con mensaje vacío (400)', async () => {
    const res = await new Promise<any>((resolve) => {
      const server = app.listen(0, async () => {
        const addr = server.address() as any;
        const resp = await fetch(`http://127.0.0.1:${addr.port}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: '' }),
        }).then(r => r.json());
        server.close(() => resolve(resp));
      });
    });

    expect(res.ok).toBe(false);
    expect(res.error).toBeDefined();
  });

  it('el endpoint POST /api/chat/clear debe limpiar el historial del usuario correctamente', async () => {
    const res = await new Promise<any>((resolve) => {
      const server = app.listen(0, async () => {
        const addr = server.address() as any;
        const resp = await fetch(`http://127.0.0.1:${addr.port}/api/chat/clear`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: 'test-user-to-clear' }),
        }).then(r => r.json());
        server.close(() => resolve(resp));
      });
    });

    expect(res.ok).toBe(true);
    expect(res.message).toContain('test-user-to-clear');
  });
});
