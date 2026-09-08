import { SecureLogger } from './logger.js';

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerOptions {
  name: string;
  failureThreshold?: number;   // Número de fallos seguidos para abrir circuito (default: 3)
  recoveryTimeMs?: number;     // Tiempo en ms que permanece abierto antes de probar (default: 30000)
  requestTimeoutMs?: number;   // Timeout por ejecución individual (default: 8000)
}

/**
 * Patrón Circuit Breaker reutilizable para resiliencia ante caídas de servicios externos
 * (Google Calendar, Chatwoot, APIs de LLM).
 */
export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failureCount: number = 0;
  private nextAttempt: number = Date.now();
  private readonly options: Required<CircuitBreakerOptions>;

  constructor(options: CircuitBreakerOptions) {
    this.options = {
      name: options.name,
      failureThreshold: options.failureThreshold ?? 3,
      recoveryTimeMs: options.recoveryTimeMs ?? 30000,
      requestTimeoutMs: options.requestTimeoutMs ?? 8000,
    };
  }

  public getState(): CircuitState {
    if (this.state === 'OPEN' && Date.now() >= this.nextAttempt) {
      this.state = 'HALF_OPEN';
      SecureLogger.info('CircuitBreaker', `Circuito [${this.options.name}] en estado HALF_OPEN. Probando recuperación...`);
    }
    return this.state;
  }

  public async execute<T>(action: () => Promise<T>, fallback?: () => Promise<T>): Promise<T> {
    const currentState = this.getState();

    if (currentState === 'OPEN') {
      SecureLogger.warn('CircuitBreaker', `Circuito [${this.options.name}] ABIERTO. Desviando a fallback inmediato.`);
      if (fallback) return fallback();
      throw new Error(`CircuitBreaker [${this.options.name}] is OPEN. Action rejected.`);
    }

    try {
      let timeoutId: NodeJS.Timeout | undefined;
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(`Timeout de ${this.options.requestTimeoutMs}ms superado en ${this.options.name}`)), this.options.requestTimeoutMs);
      });

      const result = await Promise.race([
        action().finally(() => {
          if (timeoutId) clearTimeout(timeoutId);
        }),
        timeoutPromise
      ]);

      this.onSuccess();
      return result;
    } catch (err: any) {
      this.onFailure(err);
      if (fallback) {
        SecureLogger.info('CircuitBreaker', `Ejecutando fallback para [${this.options.name}] tras error:`, err?.message || err);
        return fallback();
      }
      throw err;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      SecureLogger.info('CircuitBreaker', `Circuito [${this.options.name}] restablecido a CLOSED con éxito.`);
    }
  }

  private onFailure(err: any): void {
    this.failureCount++;
    SecureLogger.warn('CircuitBreaker', `Fallo registrado en [${this.options.name}] (${this.failureCount}/${this.options.failureThreshold}):`, err);

    if (this.failureCount >= this.options.failureThreshold || this.state === 'HALF_OPEN') {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.options.recoveryTimeMs;
      SecureLogger.error('CircuitBreaker', `CIRCUITO [${this.options.name}] ABIERTO por ${this.options.recoveryTimeMs / 1000}s.`);
    }
  }
}
