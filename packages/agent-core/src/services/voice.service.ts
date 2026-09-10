// @ts-nocheck
import { AssemblyAI } from 'assemblyai';
import axios from 'axios';
import { env } from '../config/env.js';

export class VoiceService {
  private client: AssemblyAI | null = null;

  constructor() {
    if (env.ASSEMBLYAI_API_KEY && env.ASSEMBLYAI_API_KEY !== 'tu_assemblyai_api_key_aqui') {
      this.client = new AssemblyAI({
        apiKey: env.ASSEMBLYAI_API_KEY,
      });
    }
  }

  public isAvailable(): boolean {
    return this.client !== null;
  }

  /**
   * Transcribe un audio desde una URL directa (como la entregada por Telegram).
   */
  public async transcribeFromUrl(audioUrl: string): Promise<string> {
    if (!this.client) {
      throw new Error('AssemblyAI no está configurado. Revisa tu ASSEMBLYAI_API_KEY en el archivo .env');
    }

    try {
      console.log(`🎙️ [VoiceService] Descargando audio para transcribir: ${audioUrl.slice(0, 45)}...`);
      const response = await axios.get(audioUrl, { 
        responseType: 'arraybuffer',
        timeout: 12000,
      });
      const audioBuffer = Buffer.from(response.data);

      console.log(`🎙️ [VoiceService] Enviando audio (${audioBuffer.length} bytes) a AssemblyAI...`);
      const transcript = await this.client.transcripts.transcribe({
        audio: audioBuffer,
        language_code: 'es', // Español preferente
        punctuate: true,
        format_text: true,
      });

      if (transcript.status === 'error') {
        throw new Error(`AssemblyAI Error: ${transcript.error}`);
      }

      const text = transcript.text || '';
      console.log(`✅ [VoiceService] Transcripción exitosa: "${text}"`);
      return text;
    } catch (error: any) {
      console.error('❌ [VoiceService] Error al transcribir audio:', error?.message || error);
      throw error;
    }
  }

  /**
   * Transcribe directamente desde un Buffer binario.
   */
  public async transcribeBuffer(audioBuffer: Buffer): Promise<string> {
    if (!this.client) {
      throw new Error('AssemblyAI no está configurado.');
    }

    const transcript = await this.client.transcripts.transcribe({
      audio: audioBuffer,
      language_code: 'es',
      punctuate: true,
      format_text: true,
    });

    return transcript.text || '';
  }
}

export const voiceService = new VoiceService();
