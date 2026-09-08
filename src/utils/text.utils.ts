/**
 * Utilidades de procesamiento de texto y sanitización para OdontoCare IA.
 * Garantiza que los mensajes hacia el paciente tengan un tono 100% natural y conversacional,
 * eliminando cualquier residuo de sintaxis robótica de Markdown.
 */

export function cleanChatFormatting(text: string): string {
  if (!text) return '';
  return text
    // Eliminar negritas y cursivas de markdown (**texto** o *texto* o __texto__)
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    // Eliminar encabezados markdown (### Título)
    .replace(/^#{1,6}\s+/gm, '')
    // Eliminar viñetas de guión o asterisco al inicio de línea (- elemento o * elemento)
    .replace(/^\s*[-*]\s+/gm, '')
    // Eliminar backticks de código
    .replace(/`([^`]+)`/g, '$1')
    // Limpiar saltos de línea excesivos
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
