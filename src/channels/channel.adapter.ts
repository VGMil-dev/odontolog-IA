/**
 * Contexto unificado de mensaje independiente de la plataforma (Hexagonal Inbound Port)
 */
export interface UnifiedMessageContext {
  channel: 'telegram' | 'whatsapp' | 'web' | string;
  userId: string;
  userName: string;
  userPhone?: string;
  text: string;
  rawPayload?: any;
  metadata?: Record<string, any>;
}

/**
 * Contrato de Adaptador de Canal (Hexagonal Channel Port)
 */
export interface ChannelAdapter {
  readonly name: string;
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
  sendMessage(to: string, text: string): Promise<boolean>;
  sendTyping?(to: string): Promise<void>;
}

/**
 * Registro y Despachador Central Polimórfico de Canales
 */
export class ChannelRegistry {
  private static instance: ChannelRegistry;
  private adapters: Map<string, ChannelAdapter> = new Map();

  private constructor() {}

  public static getInstance(): ChannelRegistry {
    if (!ChannelRegistry.instance) {
      ChannelRegistry.instance = new ChannelRegistry();
    }
    return ChannelRegistry.instance;
  }

  public register(adapter: ChannelAdapter): void {
    this.adapters.set(adapter.name.toLowerCase(), adapter);
    console.log(`🔌 [ChannelRegistry] Adaptador registrado: [${adapter.name.toUpperCase()}]`);
  }

  public get(channelName: string): ChannelAdapter | undefined {
    return this.adapters.get(channelName.toLowerCase());
  }

  public async dispatchMessage(channelName: string, to: string, text: string): Promise<boolean> {
    const adapter = this.get(channelName);
    if (!adapter) {
      console.warn(`⚠️ [ChannelRegistry] No existe adaptador registrado para el canal: "${channelName}"`);
      return false;
    }
    return adapter.sendMessage(to, text);
  }

  public async shutdownAll(): Promise<void> {
    for (const [name, adapter] of this.adapters.entries()) {
      try {
        await adapter.shutdown();
        console.log(`🛑 [ChannelRegistry] Canal [${name}] cerrado ordenadamente.`);
      } catch (err) {
        console.error(`❌ [ChannelRegistry] Error cerrando canal [${name}]:`, err);
      }
    }
  }
}

export const channelRegistry = ChannelRegistry.getInstance();
