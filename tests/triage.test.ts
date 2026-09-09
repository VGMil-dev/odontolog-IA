import { describe, it, expect } from 'vitest';
import { buildSystemPrompt } from '../src/agent/prompts.js';
import { clinicManager } from '../src/config/clinic.js';
import { messageBuffer } from '../src/channels/buffer.js';
import { adminConsole } from '../src/admin/console.js';

describe('Triage & Guardrails Verification', () => {
  it('el prompt del sistema debe contener guardrail estricto contra fármacos', async () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain('PROHIBICIÓN ESTRICTA DE PRESCRIBIR FÁRMACOS');
    expect(prompt).toContain('BAJO NINGUNA CIRCUNSTANCIA');
    expect(prompt).toContain('compresa fría');
  });

  it('el prompt del sistema debe incluir soporte para expats en Cuenca', async () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain('DETECCIÓN BILINGÜE AUTOMÁTICA (EXPATS EN CUENCA)');
    expect(prompt).toContain('Cuenca');
  });

  it('clinicManager debe permitir recarga en caliente (hot reload)', async () => {
    const res = clinicManager.reload();
    expect(res.success).toBe(true);
    expect(res.doctorCount).toBeGreaterThan(0);
  });

  it('messageBuffer debe acumular mensajes seguidos antes de disparar', async () => {
    const testUserId = 'test_patient_burst';

    messageBuffer.enqueue(testUserId, 'Hola', async () => {});
    messageBuffer.enqueue(testUserId, '¿Tienen cita para hoy?', async () => {});
    messageBuffer.enqueue(testUserId, 'Y cuánto cuesta?', async () => {});

    expect(messageBuffer.getPendingCount(testUserId)).toBe(3);
  });

  it('adminConsole debe reconocer comandos de administración', async () => {
    const helpText = await adminConsole.handleAdminCommand('12345', '/help');
    expect(helpText).toContain('Torre de Control OdontoCare');
    expect(helpText).toContain('/status');
    expect(helpText).toContain('/reload');
  });
});
