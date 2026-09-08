import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),
  ACTIVE_PROVIDER: z.enum(['telegram', 'meta', 'console']).default('telegram'),

  // Admin Dashboard Security (BuilderBot style)
  ADMIN_USER: z.string().default('admin'),
  ADMIN_PASSWORD: z.string().default('odontocare2026'),
  ADMIN_SESSION_SECRET: z.string().default('odonto_admin_secret_key_2026'),
  
  // AI Keys
  AI_GATEWAY_API_KEY: z.string().optional(),
  VERCEL_AI_GATEWAY_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().optional(),
  PRIMARY_MODEL: z.string().default('openai/gpt-4o-mini'),
  FALLBACK_MODEL: z.string().default('google/gemini-2.5-flash'),

  // Speech to Text
  ASSEMBLYAI_API_KEY: z.string().optional(),

  // Telegram
  TELEGRAM_BOT_TOKEN: z.string().min(1, 'El TELEGRAM_BOT_TOKEN es requerido para el bot'),
  TELEGRAM_ADMIN_CHAT_ID: z.string().optional(),

  // Meta Cloud API
  META_WA_PHONE_NUMBER_ID: z.string().optional(),
  META_WA_BUSINESS_ACCOUNT_ID: z.string().optional(),
  META_WA_ACCESS_TOKEN: z.string().optional(),
  META_WA_VERIFY_TOKEN: z.string().default('odonto_care_secure_token_2026'),

  // Anti-burst Buffer & Redis
  DEBOUNCE_DELAY_MS: z.coerce.number().default(5000),
  REDIS_URL: z.string().optional(),

  // Chatwoot
  CHATWOOT_BASE_URL: z.string().default('http://localhost:3000'),
  CHATWOOT_API_ACCESS_TOKEN: z.string().optional(),
  CHATWOOT_ACCOUNT_ID: z.coerce.number().default(1),
  CHATWOOT_INBOX_ID: z.coerce.number().default(1),

  // Evolution API (WhatsApp)
  EVOLUTION_API_URL: z.string().optional(),
  EVOLUTION_API_KEY: z.string().optional(),
  EVOLUTION_INSTANCE_NAME: z.string().default('odontocare'),

  // Google Calendar
  GOOGLE_CALENDAR_ID: z.string().default('primary'),
  GOOGLE_SERVICE_ACCOUNT_EMAIL: z.string().optional(),
  GOOGLE_PRIVATE_KEY: z.string().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

function loadEnv(): EnvConfig {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Error de validación en variables de entorno (.env):');
    console.error(result.error.format());
    // No crasheamos de golpe en modo de prueba, pero emitimos advertencia clara
  }
  return result.success ? result.data : (process.env as unknown as EnvConfig);
}

export const env = loadEnv();
