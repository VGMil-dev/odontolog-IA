// @ts-nocheck
import crypto from 'crypto';
import fs from 'fs';
import { SecureLogger } from '../utils/logger.js';

const ALGORITHM = 'aes-256-gcm';

/**
 * Servicio criptográfico para almacenamiento seguro de sesiones clínicas en reposo.
 * Cumple con ISO 27001 (A.8.24) y LOPDP Ecuador Art. 41.
 */
export class SessionCryptoService {
  private static getKey(): Buffer {
    const secret = process.env.SESSION_ENCRYPTION_KEY || 'odonto_care_secure_vault_aes256_key_2026';
    return crypto.createHash('sha256').update(secret).digest();
  }

  public static encryptToFile(filePath: string, data: any): void {
    try {
      const key = this.getKey();
      const iv = crypto.randomBytes(12);
      const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

      const plaintext = JSON.stringify(data);
      let ciphertext = cipher.update(plaintext, 'utf-8', 'hex');
      ciphertext += cipher.final('hex');
      const authTag = cipher.getAuthTag();

      const payload = JSON.stringify({
        encrypted: true,
        version: 'AES-256-GCM',
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex'),
        data: ciphertext,
      }, null, 2);

      const tmpPath = `${filePath}.tmp`;
      fs.writeFileSync(tmpPath, payload, 'utf-8');
      fs.renameSync(tmpPath, filePath);
    } catch (err: any) {
      SecureLogger.error('SessionCryptoService', 'Error al cifrar y guardar sesiones:', err);
    }
  }

  public static decryptFromFile(filePath: string): Record<string, any> {
    if (!fs.existsSync(filePath)) return {};

    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      if (!raw.trim()) return {};

      // Si el archivo ya es texto plano anterior, migrarlo cifrándolo inmediatamente
      if (raw.trim().startsWith('{') && !raw.includes('"authTag"')) {
        try {
          const parsed = JSON.parse(raw);
          SecureLogger.info('SessionCryptoService', 'Migrando sesiones existentes a formato cifrado AES-256-GCM...');
          this.encryptToFile(filePath, parsed);
          return parsed;
        } catch {
          return {};
        }
      }

      const parsed = JSON.parse(raw);
      if (!parsed.iv || !parsed.authTag || !parsed.data) {
        return {};
      }

      const key = this.getKey();
      const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(parsed.iv, 'hex'));
      decipher.setAuthTag(Buffer.from(parsed.authTag, 'hex'));

      let decrypted = decipher.update(parsed.data, 'hex', 'utf-8');
      decrypted += decipher.final('utf-8');
      return JSON.parse(decrypted);
    } catch (err: any) {
      SecureLogger.error('SessionCryptoService', 'Error al descifrar sesiones:', err);
      return {};
    }
  }
}
