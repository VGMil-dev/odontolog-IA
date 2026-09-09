import { describe, it, expect } from 'vitest';
import { cleanChatFormatting } from '../src/channels/telegram.js';

describe('cleanChatFormatting', () => {
  it('should remove bold asterisks and maintain clean text', async () => {
    const input = '¡Listo, Milton! 😊 Tu cita con el **Dr. Carlos Delgado** para **brackets** está agendada para el **lunes 14 de septiembre a las 3:00 p. m.**.';
    const output = cleanChatFormatting(input);
    expect(output).not.toContain('**');
    expect(output).toBe('¡Listo, Milton! 😊 Tu cita con el Dr. Carlos Delgado para brackets está agendada para el lunes 14 de septiembre a las 3:00 p. m..');
  });

  it('should strip markdown headers and bullet prefixes', async () => {
    const input = '### Horarios disponibles:\n- 2:00 pm\n- 3:00 pm\n- 4:00 pm';
    const output = cleanChatFormatting(input);
    expect(output).not.toContain('###');
    expect(output).not.toContain('- ');
    expect(output).toBe('Horarios disponibles:\n2:00 pm\n3:00 pm\n4:00 pm');
  });

  it('should handle empty safely', async () => {
    expect(cleanChatFormatting('')).toBe('');
  });
});
