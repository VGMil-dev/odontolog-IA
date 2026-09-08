import axios from 'axios';
import { env } from '../config/env.js';
import { SecureLogger } from '../utils/logger.js';

export interface QrCodeResult {
  instanceName: string;
  state: 'connecting' | 'open' | 'close';
  base64?: string;
  pairingCode?: string;
  code?: string;
}

export class EvolutionService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = env.EVOLUTION_API_URL || 'http://localhost:8080';
    this.apiKey = env.EVOLUTION_API_KEY || 'odonto_evolution_secret_2026';
  }

  private getHeaders() {
    return {
      'apikey': this.apiKey,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Crea una instancia de WhatsApp o recupera una existente.
   */
  public async ensureInstance(instanceName: string): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/instance/create`;
      const payload = {
        instanceName,
        token: this.apiKey,
        qrcode: true,
        integration: 'WHATSAPP-BAILEYS',
        webhookUrl: 'http://odontocare-ai:3000/webhooks/whatsapp',
        webhookByEvents: false,
        webhookBase64: false,
        events: ['MESSAGES_UPSERT', 'CONNECTION_UPDATE'],
      };

      await axios.post(url, payload, {
        headers: this.getHeaders(),
        timeout: 8000,
      });

      SecureLogger.info('EvolutionService', `Instancia WhatsApp "${instanceName}" creada o asegurada.`);
      return true;
    } catch (err: any) {
      if (err?.response?.data?.response?.message?.includes('already exists') || err?.response?.status === 403) {
        return true;
      }
      SecureLogger.warn('EvolutionService', `Nota al asegurar instancia ${instanceName}: ${err?.message}`);
      return false;
    }
  }

  /**
   * Obtiene el código QR o estado de conexión para una instancia específica.
   */
  public async getConnectQr(instanceName: string): Promise<QrCodeResult> {
    await this.ensureInstance(instanceName);

    try {
      const url = `${this.baseUrl}/instance/connect/${instanceName}`;
      const res = await axios.get(url, {
        headers: this.getHeaders(),
        timeout: 10000,
      });

      const data = res.data;
      if (data.instance?.state === 'open') {
        return {
          instanceName,
          state: 'open',
        };
      }

      return {
        instanceName,
        state: 'connecting',
        base64: data.base64,
        code: data.code,
        pairingCode: data.pairingCode,
      };
    } catch (err: any) {
      SecureLogger.warn('EvolutionService', `Error al obtener QR para ${instanceName}: ${err?.message}`);
      return {
        instanceName,
        state: 'close',
      };
    }
  }

  /**
   * Obtiene el estado de conexión de la instancia (open, connecting, close).
   */
  public async getConnectionState(instanceName: string): Promise<'open' | 'connecting' | 'close'> {
    try {
      const url = `${this.baseUrl}/instance/connectionState/${instanceName}`;
      const res = await axios.get(url, {
        headers: this.getHeaders(),
        timeout: 5000,
      });
      return res.data?.instance?.state || 'close';
    } catch {
      return 'close';
    }
  }
}

export const evolutionService = new EvolutionService();
