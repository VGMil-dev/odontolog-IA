// @ts-nocheck
/**
 * Guardrails Deterministas Anti-Jailbreak y Anti-Prescripción Farmacológica
 * Cumple con ISO/IEC 42001:2026 (A.8.5 Robustez) y Código de Ética Odontológica.
 */

export interface GuardrailCheckResult {
  passed: boolean;
  blockedReason?: string;
  sanitizedResponse?: string;
}

export class OdontoGuardrails {
  // Principios activos y marcas comerciales comunes en Ecuador prohibidos para prescripción por IA
  private static FORBIDDEN_DRUGS = [
    // Principios activos
    'amoxicilina', 'ibuprofeno', 'paracetamol', 'ketorolaco', 'clindamicina',
    'azitromicina', 'acido clavulanico', 'ácido clavulánico', 'tramadol', 'diclofenaco',
    'naproxeno', 'dexametasona', 'prednisona', 'metronidazol', 'amoxicilina/clavulanato',
    'clorhexidina', 'ketoprofeno', 'meloxicam', 'ampicilina', 'cefalexina', 'ciprofloxacino',
    'eritromicina', 'gentamicina',
    // Marcas comerciales populares en Ecuador
    'buprex', 'finalin', 'flanax', 'panadol', 'dolostop', 'aprion', 'amoxil', 'clavinex'
  ];

  private static JAILBREAK_PATTERNS = [
    /ignore\s+(all\s+)?previous\s+instructions/i,
    /olvida\s+(todas\s+las\s+)?instrucciones\s+previas/i,
    /act(ua)?\s+como\s+(un\s+)?(medico|médico|doctor|farmaceutico|farmacéutico)/i,
    /simula\s+que\s+eres\s+un\s+doctor/i,
    /system\s+override/i,
    /jailbreak/i,
    /dan\s+mode/i,
    /dame\s+tu\s+prompt\s+del\s+sistema/i,
    /reveal\s+(your\s+)?system\s+prompt/i,
    /revela\s+(tu\s+)?system\s+prompt/i
  ];

  /**
   * Valida la entrada del usuario antes de pasarla al LLM (filtro de entrada)
   */
  public static inspectInput(userInput: string): GuardrailCheckResult {
    if (!userInput) return { passed: true };

    for (const pattern of this.JAILBREAK_PATTERNS) {
      if (pattern.test(userInput)) {
        return {
          passed: false,
          blockedReason: 'JAILBREAK_ATTEMPT',
          sanitizedResponse: 'Lo siento, no puedo procesar esa solicitud. Como asistente de inteligencia artificial de OdontoCare, estoy programada exclusivamente para coordinar citas odontológicas e información de la clínica.'
        };
      }
    }

    return { passed: true };
  }

  /**
   * Valida la respuesta del LLM antes de enviarla al paciente (filtro de salida determinista)
   * Si detecta mención de fármacos para ingestión o dosificación, intercepta con aviso médico seguro.
   */
  public static inspectOutput(assistantOutput: string): GuardrailCheckResult {
    if (!assistantOutput) return { passed: true };
    const lower = assistantOutput.toLowerCase();

    // Comprobar si el texto contiene recomendaciones o dosificaciones de fármacos
    for (const drug of this.FORBIDDEN_DRUGS) {
      const regex = new RegExp(`\\b${drug}\\b`, 'i');
      if (regex.test(lower)) {
        // Verificar si la respuesta ya estaba diciendo explícitamente que no puede recetarlo
        const isRefusal = lower.includes('no puedo recetar') || 
                          lower.includes('no puedo prescribir') || 
                          lower.includes('no estoy autorizada para recetar') ||
                          lower.includes('no tengo permitido prescribir') ||
                          lower.includes('no tengo permitido recomendar ni recetar') ||
                          lower.includes('no debes automedicarte') ||
                          lower.includes('no te puedo recetar');

        if (!isRefusal) {
          return {
            passed: false,
            blockedReason: 'DRUG_PRESCRIPTION_INTERCEPTED',
            sanitizedResponse: 'Por tu seguridad y conforme a las normas médicas de salud en Ecuador, como asistente de IA no tengo permitido recomendar ni recetar medicamentos. Si presentas dolor o hinchazón te aconsejo colocarte una compresa fría en la mejilla externa y acudir a una valoración clínica presencial con nuestros especialistas.'
          };
        }
      }
    }

    return { passed: true };
  }
}
