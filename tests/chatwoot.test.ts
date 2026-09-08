import { describe, it, expect } from 'vitest';
import { chatwootService } from '../src/services/chatwoot.service.js';

describe('ChatwootService (Human Handoff & Webhooks)', () => {
  it('debe pausar al bot cuando un asesor humano escribe en Chatwoot', async () => {
    const userId = 'patient_9988';
    
    // Simular evento message_created de agente
    const webhookPayload = {
      event: 'message_created',
      message_type: 'outgoing',
      private: false,
      sender: {
        id: 12,
        name: 'Dra. Recepcionista',
        type: 'user',
      },
      conversation: {
        id: 456,
        status: 'open',
        meta: {
          sender: {
            id: 789,
            name: 'Paciente Test',
            identifier: userId,
          },
        },
      },
    };

    const result = await chatwootService.handleWebhookEvent(webhookPayload);
    expect(result.handled).toBe(true);
    expect(result.action).toBe(`bot_paused_for_${userId}`);
    expect(await chatwootService.isBotPausedForUser(userId)).toBe(true);
  });

  it('debe reactivar al bot cuando la conversación se marca como resolved', async () => {
    const userId = 'patient_9988';

    const webhookPayload = {
      event: 'conversation_status_changed',
      conversation: {
        id: 456,
        status: 'resolved',
        meta: {
          sender: {
            id: 789,
            name: 'Paciente Test',
            identifier: userId,
          },
        },
      },
    };

    const result = await chatwootService.handleWebhookEvent(webhookPayload);
    expect(result.handled).toBe(true);
    expect(result.action).toBe(`bot_resumed_for_${userId}`);
    expect(await chatwootService.isBotPausedForUser(userId)).toBe(false);
  });
});
