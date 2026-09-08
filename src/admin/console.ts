import { clinicManager } from '../config/clinic.js';
import { voiceService } from '../services/voice.service.js';
import { agentCore } from '../agent/core.js';
import { env } from '../config/env.js';

export class AdminConsole {
  public isAdmin(chatId: string | number): boolean {
    if (!env.TELEGRAM_ADMIN_CHAT_ID) return false;
    return String(chatId) === String(env.TELEGRAM_ADMIN_CHAT_ID);
  }

  public async handleAdminCommand(chatId: string | number, text: string): Promise<string | null> {
    const trimmed = text.trim();

    if (trimmed === '/help' || trimmed === '/ayuda') {
      return `
🛠️ **Torre de Control OdontoCare (Modo Administrador)**
Comandos disponibles para auto-corrección y monitoreo:

• \`/status\` — Diagnóstico del sistema, APIs y memoria.
• \`/reload\` — Recarga en caliente \`clinic.config.json\` (doctores/precios).
• \`/debug on\` | \`/debug off\` — Activa o desactiva trazas en tiempo real.
• \`/simular <mensaje>\` — Ejecuta un paciente de prueba y muestra el razonamiento.
• \`/reset\` — Borra tu historial de conversación para empezar de cero.
      `.trim();
    }

    if (trimmed === '/status') {
      const mem = process.memoryUsage();
      const memMb = Math.round(mem.rss / 1024 / 1024);
      const cfg = clinicManager.getConfig();
      const uptimeMin = Math.round(process.uptime() / 60);

      return `
📊 **Estado del Sistema OdontoCare IA:**
• **Uptime:** ${uptimeMin} minutos
• **Memoria RSS:** ${memMb} MB
• **Clínica Activa:** ${cfg.name} (${cfg.city})
• **Especialistas Configurados:** ${cfg.doctors.length} doctores
• **AssemblyAI (Voz):** ${voiceService.isAvailable() ? '🟢 Conectado' : '🟡 Sin clave configurada'}
• **Modelo Primario:** \`${env.PRIMARY_MODEL}\`
• **Modelo Fallback:** \`${env.FALLBACK_MODEL}\`
• **Modo Debug:** ${agentCore.isDebugMode() ? '🟢 ACTIVO' : '⚪ INACTIVO'}
      `.trim();
    }

    if (trimmed === '/reload') {
      const res = clinicManager.reload();
      return `🔄 **Configuración recargada con éxito.**\nSe actualizaron ${res.doctorCount} especialistas desde \`clinic.config.json\` sin reiniciar el servidor.`;
    }

    if (trimmed.startsWith('/debug')) {
      const state = trimmed.split(' ')[1];
      if (state === 'on') {
        agentCore.setDebugMode(true);
        return '🟢 **Modo Debug ACTIVADO.** Recibirás las trazas técnicas y llamadas a herramientas de cada paciente.';
      } else {
        agentCore.setDebugMode(false);
        return '⚪ **Modo Debug DESACTIVADO.**';
      }
    }

    if (trimmed.startsWith('/simular')) {
      const prompt = trimmed.replace('/simular', '').trim();
      if (!prompt) {
        return '⚠️ Debes escribir el texto a simular. Ejemplo:\n`/simular tengo dolor 9/10 en una muela`';
      }

      const res = await agentCore.processMessage('simulated_user_test', prompt);
      const stepsFormatted = res.reasoningSteps.length > 0
        ? `\n\n🔍 **Pasos del Agente:**\n` + res.reasoningSteps.map(s => `• ${s}`).join('\n')
        : '';

      return `
🧪 **Resultado de Simulación:**
⏱️ Latencia: ${res.durationMs}ms | Modelo: \`${res.modelUsed}\` | Tools ejecutadas: ${res.toolCallsCount}
${stepsFormatted}

💬 **Respuesta enviada al paciente:**
${res.text}
      `.trim();
    }

    if (trimmed === '/reset') {
      agentCore.clearHistory(String(chatId));
      return '🧹 Historial de conversación reseteado.';
    }

    // No es un comando especial de admin
    return null;
  }
}

export const adminConsole = new AdminConsole();
