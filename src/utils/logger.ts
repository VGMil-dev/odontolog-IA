import crypto from 'crypto';

/**
 * Logger seguro con anonimización y enmascaramiento de PII/PHI
 * Cumple con ISO 27001 (A.8.15 Logging), ISO 27799 y LOPDP Ecuador.
 */
export class SecureLogger {
  public static maskPhone(phone: string): string {
    if (!phone || phone.length < 6) return '***';
    return phone.slice(0, 3) + '****' + phone.slice(-3);
  }

  public static maskText(text: string): string {
    if (!text) return '';
    // Enmascarar números telefónicos (Ecuador: 09XXXXXXXX o +593XXXXXXXXX)
    let sanitized = text.replace(/(\+?593|0)9\d{8}/g, '[TELÉFONO_PROTEGIDO]');
    // Enmascarar cédulas de identidad (10 dígitos)
    sanitized = sanitized.replace(/\b\d{10}\b/g, '[ID_PROTEGIDA]');
    // Enmascarar correos electrónicos
    sanitized = sanitized.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_PROTEGIDO]');
    return sanitized;
  }

  public static anonymizeUserId(userId: string): string {
    if (!userId) return 'anon';
    return crypto.createHash('sha256').update(userId).digest('hex').slice(0, 10);
  }

  public static info(tag: string, message: string, data?: any): void {
    const cleanMsg = this.maskText(message);
    if (data !== undefined) {
      const sanitizedData = typeof data === 'string' ? this.maskText(data) : '[DATOS_SANITIZADOS]';
      console.log(`ℹ️ [INFO] [${tag}] ${cleanMsg}`, sanitizedData);
    } else {
      console.log(`ℹ️ [INFO] [${tag}] ${cleanMsg}`);
    }
  }

  public static warn(tag: string, message: string, err?: any): void {
    console.warn(`⚠️ [WARN] [${tag}] ${this.maskText(message)}`, err?.message || err || '');
  }

  public static error(tag: string, message: string, err?: any): void {
    console.error(`❌ [ERROR] [${tag}] ${this.maskText(message)}`, err?.message || err || '');
  }

  public static audit(event: string, meta: { userIdHash: string; action: string; details?: string }): void {
    const timestamp = new Date().toISOString();
    console.log(JSON.stringify({
      logType: 'CLINICAL_AI_AUDIT',
      timestamp,
      event,
      userHash: meta.userIdHash,
      action: meta.action,
      details: meta.details ? this.maskText(meta.details) : undefined,
    }));
  }
}
