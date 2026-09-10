// @ts-nocheck
import { EventEmitter } from 'events';
import { UnifiedMessageContext } from '../channels/channel.adapter.js';

export interface AppEvents {
  'message:received': (context: UnifiedMessageContext) => void;
  'message:outgoing': (data: { channel: string; to: string; text: string }) => void;
  'appointment:booked': (data: {
    appointmentId: string;
    userId: string;
    channel: string;
    patientName: string;
    patientPhone?: string;
    doctorName: string;
    specialty?: string;
    appointmentTimeIso: string;
    clinicId?: string;
  }) => void;
  'appointment:reminder_due': (data: {
    channel: string;
    userId: string;
    patientName: string;
    patientPhone?: string;
    doctorName: string;
    appointmentTimeIso: string;
    reminderText: string;
  }) => void;
  'handoff:emergency': (data: {
    userId: string;
    channel: string;
    userName: string;
    userPhone?: string;
    painLevel: number;
    summary: string;
  }) => void;
  'privacy:erasure_requested': (data: { userId: string }) => void;
}

/**
 * Event Bus Interno Tipado (Pub/Sub)
 * Desacopla la orquestación de eventos clínicos de la infraestructura y transporte.
 */
export class TypedEventBus {
  private static instance: TypedEventBus;
  private emitter = new EventEmitter();

  private constructor() {
    this.emitter.setMaxListeners(40);
  }

  public static getInstance(): TypedEventBus {
    if (!TypedEventBus.instance) {
      TypedEventBus.instance = new TypedEventBus();
    }
    return TypedEventBus.instance;
  }

  public emit<K extends keyof AppEvents>(event: K, ...args: Parameters<AppEvents[K]>): boolean {
    return this.emitter.emit(event, ...args);
  }

  public on<K extends keyof AppEvents>(event: K, listener: AppEvents[K]): this {
    this.emitter.on(event, listener as (...args: any[]) => void);
    return this;
  }

  public off<K extends keyof AppEvents>(event: K, listener: AppEvents[K]): this {
    this.emitter.off(event, listener as (...args: any[]) => void);
    return this;
  }
}

export const eventBus = TypedEventBus.getInstance();
