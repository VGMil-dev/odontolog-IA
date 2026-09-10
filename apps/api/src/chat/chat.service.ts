import { Injectable } from '@nestjs/common';
import { agentCore } from '@repo/agent-core';

@Injectable()
export class ChatService {
  async send(message?: string, clinicId?: string): Promise<string> {
    if (!message || !message.trim()) {
      return 'Escribe un mensaje para comenzar.';
    }
    // Hardcoded test user ID for playground/API testing
    const userId = `web-${Date.now()}`;
    const response = await agentCore.processMessage(userId, message, clinicId);
    return response.text;
  }
}