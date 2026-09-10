# Plan Maestro — OdontoCare IA Refactor (Fases 2–5)

> **Objetivo:** documento de referencia único para que un **ejército de subagentes** ejecute el resto del refactor (Fases 2, 3, 4 y 5) sin re-investigar.
> **Repositorio:** monorepo Turborepo (`apps/api` Nest+Prisma, `apps/web` Next.js, `packages/*`).
> **Estado:** Fases 0 y 1 completas. Sub-fases 2.0–2.2 completas. Partes de 2.4 ya implementadas.
> **Fecha:** 2026-09-09

---

## 0. Visión general del estado

| Bloque | Estado |
|---|---|
| Monorepo (turbo, pnpm, tsconfig) | ✅ |
| API Nest (auth, clinics, metrics) | ✅ (+ módulos doctors/treatments/appointments/chat ya creados, sin verificar build) |
| Evolution API eliminada | ✅ |
| Frontend fundación + design system + auth BFF | ✅ |
| Frontend pantallas (2.3) | ⏳ |
| Agent-core + canales (Fase 3) | ⏳ |
| Tests (Fase 4) | ⏳ |
| Limpieza legacy (Fase 5) | ⏳ |

---

# FASE 2 — Frontend Next.js (cerrar)

## 2.x Errores de build pendientes en `apps/api` (bloquean `build`)

1. **`apps/api/src/auth/jwt.strategy.ts`** importa `passport-jwt` y `@nestjs/passport` que **no están en dependencias**. `JwtStrategy` (PassportStrategy) es **código muerto** (la auth real usa `JwtAuthGuard`, guard custom con `JwtService`). **Acción:** eliminar clase `JwtStrategy` y su import; retirar de `providers` en `auth.module.ts`.
2. **`apps/api/src/main.ts:21`** — `app.get('/favicon.ico', handler)` usa el `get()` del contenedor DI, no una ruta HTTP. **Acción:** eliminar el bloque favicon (líneas 20–24); el favicon lo sirve Next.js.

Verificación: `pnpm --filter api exec tsc --noEmit` debe quedar limpio.

## 2.3 Pantallas UI (restante)

**Decisión de arquitectura (aplicar):** Server Components (async) leen datos vía `lib/api.ts` (inyecta cookie `session` como `Bearer` en SSR); Client Components ("islands") manejan interactividad. Razón: el browser no puede leer la cookie httpOnly.

| Task | Archivo | Detalle |
|---|---|---|
| B.1 | `apps/web/package.json` | mover `recharts` de `devDependencies` → `dependencies` |
| B.2 | `apps/web/src/lib/types.ts` | interfaces `Metrics`, `Clinic`, `Doctor`, `Treatment`, `Appointment`, `UserSession` (según `schema.prisma`) |
| C.1 | `apps/web/app/dashboard/page.tsx` | **Reescribir** como async Server Component: `fetchApi("/api/metrics/real")`, bento grid con `Card`, gráfico Recharts de `channels` (island `<ChannelChart/>`), `loading.tsx` con `Skeleton`. Reemplaza la versión huidiza que usa `localStorage`. |
| C.2 | `apps/web/app/clinics/page.tsx` | **Reescribir**: Server Component + islands, tabla `Table`/`Badge`, CRUD (`POST/PATCH/DELETE /api/clinics`), botón "Ver como clínica" → `POST /api/auth/impersonate` (solo SUPER_ADMIN), token en cookie **`session-impersonated`**. |
| C.3 | `apps/web/app/clinics/[id]/page.tsx` | Workspace por clínica: KPIs + toggle doctores (`POST /api/clinics/:id/doctors/:doctorId/toggle-status`). |
| C.4 | `apps/web/app/clinics/[id]/catalog/page.tsx` | Catálogo tratamientos/doctores CRUD + búsqueda. |
| C.5 | modal credenciales | Meta Cloud (`POST /api/clinics/:id/meta-whatsapp`) + Telegram (`POST /api/clinics/:id/telegram`). |
| C.6 | `apps/web/app/chat/page.tsx` | Playground chat → `POST /api/chat`. |
| C.7 | todas las vistas | `loading.tsx` + `Skeleton` en cargas async. |

### Contratos API (Fase 2)

| Método | Ruta | Guard |
|---|---|---|
| POST | `/api/auth/login` | — |
| GET | `/api/auth/verify` | JWT |
| POST | `/api/auth/impersonate` | JWT (SUPER_ADMIN) |
| GET/POST/PATCH/DELETE | `/api/clinics`(+`/:id`) | JWT |
| POST | `/api/clinics/:id/meta-whatsapp` y `/api/clinics/:id/telegram` | JWT |
| GET/POST/PATCH/DELETE | `/api/clinics/:clinicId/doctors` (+ `/toggle-status`) | JWT |
| GET/POST/PATCH/DELETE | `/api/clinics/:clinicId/treatments` | JWT |
| GET/POST | `/api/appointments` | JWT |
| POST | `/api/chat` | JWT |
| GET | `/api/metrics/real` | JWT |

**Shape JWT:** `{ email, role, clinicId }` (roles `SUPER_ADMIN | CLINIC_ADMIN | DOCTOR`).
**Credenciales seed:** `superadmin@odontocare.com/odontocare2026`, `admin@clinica1.com/clinica2026`, `doctor@clinica1.com/doctor2026`.

### Skills Fase 2
`frontend-design`, `vercel-react-best-practices`, `vercel-composition-patterns`, `nestjs-expert`.

---

# FASE 3 — Agent-core a Nest + canales (la más grande)

## 3.1 Diagnóstico clave para el port

- El legacy `src/` **no tiene dependencias declaradas** en el workspace actual (el `package.json` raíz solo trae turbo/prisma). Por lo tanto cada dependencia legacy debe **declararse** en su nuevo paquete destino.
- Dependencias legacy a distribuir:
  - **`packages/agent-core`**: `ai`, `@ai-sdk/openai`, `@ai-sdk/google`, `zod`.
  - **`apps/api`**: `telegraf`, `ioredis`, `axios`, `googleapis`, `assemblyai`, `@nestjs/schedule` (cron recordatorios), `@nestjs/axios` (opcional).
- `packages/agent-core/src/index.ts` está **roto** (importa `../src/...` inexistentes). Hay que reescribir el barrel.

## 3.2 Mapa de port (legacy → nuevo)

| Legacy (clase/método) | Destino | Notas |
|---|---|---|
| `src/agent/core.ts` `OdontoAgentCore` → `processMessage`, `getRealMetrics`, `getRecentConversationsSummary`, `clearHistory`, `setDebugMode` | `packages/agent-core/src/agent/agent-core.ts` | Usa Vercel AI SDK + cascada primario→fallback. Convertir a **clase inyectable** (o servicio Nest). |
| `src/agent/guardrails.ts` `OdontoGuardrails` (`inspectInput`, `inspectOutput`, `FORBIDDEN_DRUGS`, `JAILBREAK_PATTERNS`) | `packages/agent-core/src/agent/guardrails.ts` | ⚠️ **NO TOCAR** la lógica de guardrails de Valeria IA (solo renombrar imports). |
| `src/agent/prompts.ts` `buildSystemPrompt` | `packages/agent-core/src/agent/prompts.ts` | Plantilla con identidad/idioma/markdown-cero/fechas. |
| `src/agent/tools.ts` `createOdontoTools` (7 tools: `consultarServiciosYPrecios`, `consultarPreciosYTratamientos`, `obtenerHorariosDisponibles`, `agendarCita`, `obtenerPerfilDoctor`, `evaluarTriajeSintomas`, `escalarUrgenciaMedica`, `gestionarConsentimientoLOPDP`) | `packages/agent-core/src/agent/tools.ts` | Reemplazar dependencias a `calendarService`→ puerto inyectable; `chatwootService`→ puerto; `clinicManager/clinicsRegistry`→ Prisma. |
| `src/utils/logger.ts` `SecureLogger` | `packages/agent-core/src/utils/secure-logger.ts` | `maskPhone/maskText/anonymizeUserId/info/warn/error/audit`. |
| `src/utils/text.utils.ts` `cleanChatFormatting` | `packages/shared/src/text.utils.ts` | |
| `src/utils/circuit-breaker.ts` `CircuitBreaker` | `packages/shared/src/circuit-breaker.ts` | Patrón de resiliencia (Google Calendar, Chatwoot, LLM). |
| `src/core/event-bus.ts` `TypedEventBus` + `AppEvents` | `packages/shared/src/event-bus.ts` | En Nest: `EventEmitter2` (de `@nestjs/event-emitter`) es alternativa más idiomática. |
| `src/channels/channel.adapter.ts` `ChannelAdapter`, `ChannelRegistry`, `UnifiedMessageContext` | `packages/agent-core/src/channels/channel.adapter.ts` | Puerto hexagonal. |
| `src/channels/buffer.ts` `MessageBufferQueue` | `packages/agent-core/src/channels/buffer.ts` | Debounce anti-ráfagas (Redis + memoria). |
| `src/config/clinic.ts` tipos `Doctor`, `Treatment`, `ClinicConfig` | `packages/shared/src/types.ts` | Tipos compartidos API↔agent. |
| `src/config/env.ts` | Nest `ConfigModule` + `class-validator` | |
| `src/config/clinics.registry.ts` | **Eliminar** → `apps/api/src/clinics/clinics.service.ts` (Prisma) ya lo sustituye | |

## 3.3 Servicios a migrar a `apps/api/src/` (Nest providers)

| Legacy | Destino | Métodos clave |
|---|---|---|
| `src/services/redis.service.ts` `RedisService` | `apps/api/src/infrastructure/redis.service.ts` | `get/set/del`, `pushToBuffer/flushBuffer`, `setBotPaused/isBotPaused`, `acquireLock/releaseLock`, fallback memoria local. |
| `src/services/calendar.service.ts` `CalendarService` | `apps/api/src/services/calendar.service.ts` | `getAvailableSlots`, `bookAppointment`, `getAppointmentsMetrics`, `getAllAppointments` (Google Calendar v3 + fallback local). |
| `src/services/reminder.service.ts` `ReminderService` | `apps/api/src/services/reminder.service.ts` | `registerAppointment`, `removeAppointmentsByUser`, `start/stop`, `checkUpcomingAppointments`. Usar `@nestjs/schedule` `@Cron`. |
| `src/services/chatwoot.service.ts` `ChatwootService` | `apps/api/src/services/chatwoot.service.ts` | `isBotPausedForUser`, `pauseBotForUser/resumeBotForUser`, `syncIncomingMessage`, `syncBotOutgoingMessage`, `handleWebhookEvent`, `notifyEmergencyHandoff`. |
| `src/services/voice.service.ts` `VoiceService` | `apps/api/src/services/voice.service.ts` | `transcribeFromUrl`, `transcribeBuffer`, `isAvailable`. |
| `src/services/privacy.service.ts` `PrivacyService` | `apps/api/src/services/privacy.service.ts` | `hasConsent`, `grantConsent`, `getConsentPrompt`, `isErasureRequest`, `executeRightToErasure`. |
| `src/services/session-crypto.ts` `SessionCryptoService` | `apps/api/src/services/session-crypto.service.ts` | `encryptToFile`, `decryptFromFile` (AES-256-GCM). Considerar migrar a tienda Redis/Prisma en vez de archivo. |
| `src/services/auth.service.ts` | **Eliminar** → `apps/api/src/auth/auth.service.ts` (JWT Nest) ya lo sustituye | |

## 3.4 Canales (WhatsApp Meta + Multi-bot Telegram)

- **WhatsApp:** `src/channels/whatsapp.ts` → `apps/api/src/channels/whatsapp.channel.ts`. Conservar **solo** `handleMetaCloudWebhook` y `sendMetaCloudMessage` (Evolution ya eliminado). Enrutamiento multitenant por `phone_number_id` usando `ClinicsService`.
- **Multi-bot Telegram por clínica (requisito):** `src/channels/telegram.ts` (monobot) → `apps/api/src/channels/telegram-manager.service.ts`:
  - Clase `TelegramManager` que registra **N bots Telegraf**, uno por `Clinic.telegramBotToken`.
  - Al iniciar (`OnModuleInit`) carga todas las clínicas con token y lanza cada bot (long-polling).
  - API para añadir/arrancar/detener bots dinámicamente (al crear/editar clínica).
  - Cada bot comparte `MessageBufferQueue` + `AgentCore`, con `clinicId` en el contexto.
  - Reutilizar handlers de `src/channels/telegram.ts` (`/start`, `message('voice')`, `message('text')`) parametrizados por clínica.

## 3.5 Cambios en `schema.prisma` (Prisma)

- Añadir a `Doctor`: `credentials String?`, `languages Json?` (usados por `obtenerPerfilDoctor`).
- Añadir relación `Appointment.doctorId String?` + `clinic` relation opcional si se quiere N+1 limpio.
- `Clinic.config Json` ya cubre `workingHours`, `telegramToken`, `inventoryStatus`.
- Verificar que `Clinic.telegramBotToken` (ya existe) es el que alimenta el multi-bot.

## 3.6 Módulo Nest nuevo `AgentModule`

Agrupar: `AgentController` (POST `/api/chat` real), servicios del agente + tools, `ChannelsModule` (telegram manager + whatsapp + webhooks). `WebhooksController` con `POST /webhooks/whatsapp` y `GET` (verify challenge de Meta) y `POST /webhooks/chatwoot`.

## 3.7 Hitos y verificación Fase 3

- [ ] `pnpm --filter agent-core build` verde.
- [ ] `pnpm --filter api build` verde.
- [ ] `POST /api/chat` responde vía IA real (no stub).
- [ ] Un bot Telegram arranca por clínica con token en PG.
- [ ] Webhook WhatsApp Meta Cloud enruta por clínica.
- ⚠️ Guardrails de Valeria intactos (sin modificar).

### Skills Fase 3
`nestjs-expert` (DI/módulos/guards), `vercel-react-best-practices` (n/a, backend), `find-skills` (buscar skill de Vercel AI SDK si se requiere).

---

# FASE 4 — Tests

- **Framework recomendado:** Jest + Supertest (idiomático Nest) para unit/integration; `@nestjs/testing`. (Legacy usaba Vitest; se puede conservar Vitest si se prefiere, pero Nest por defecto es Jest.)
- **Reescribir tests unit legacy → Nest:**
  | Legacy | Nuevo |
  |---|---|
  | `tests/triage.test.ts` | `apps/api/src/agent/__tests__/triage.spec.ts` (tools triage) |
  | `tests/calendar.test.ts` | `apps/api/src/services/__tests__/calendar.service.spec.ts` |
  | `tests/redis.test.ts` | `apps/api/src/infrastructure/__tests__/redis.service.spec.ts` |
  | `tests/chatwoot.test.ts` | `apps/api/src/services/__tests__/chatwoot.service.spec.ts` |
  | `tests/clinics.registry.test.ts` | `apps/api/src/clinics/__tests__/clinics.service.spec.ts` |
  | `tests/server.test.ts` | `apps/api/test/app.e2e-spec.ts` (Supertest) |
  | `tests/clean.test.ts` | `packages/shared/__tests__/text.utils.spec.ts` |
- **E2E Playwright:** reescribir `tests/e2e/dashboard-ui.spec.ts` contra el frontend Next (puerto 3001). Referencia visual: los 15 screenshots en `tests/e2e/screenshots/` (login, bento, clínicas, modales, catálogo, workspace, mobile) describen el flujo esperado del dashboard.
- **Cobertura de flujos Playwright (Fase 2 ya planeó):** login 3 roles → dashboard → clínicas CRUD → impersonate → logout.

### Skills Fase 4
`playwright-best-practices`, `playwright-cli`, `playwright-generate-test`, `nestjs-expert` (testing).

---

# FASE 5 — Limpieza final

- [ ] Delete `src/` completo (tras port de Fase 3).
- [ ] Delete `tests/` legacy, `scripts/fix_*.py`, `scripts/migrate-to-pg.ts`, `scripts/test-personas.ts`, `src/admin/`, `src/server/` (UI HTML legacy).
- [ ] Eliminar restos Evolution en `docker-compose.yml`, `GEMINI.md`, `.env.example`, `ROADMAP.md`.
- [ ] Alinear `docker-compose.yml`: solo `odontocare-ai` (Nest), `postgres` (`odontocare`/`odontocare_db`), `redis`; añadir `web` (Next standalone) y `evolution-api` ya fuera.
- [ ] Actualizar `GEMINI.md` (arquitectura final Nest+Next), `README`, `.env.example`.
- [ ] Verificar `pnpm install`, `pnpm build`, `pnpm test`, `pnpm typecheck`, `pnpm lint` todo verde.
- [ ] `docker compose up` levanta API + web + PG + Redis.

---

## 9. Skills globales (resumen por fase)

| Fase | Skills instaladas | Skills a buscar (vía `find-skills`) |
|---|---|---|
| 2 | frontend-design, vercel-react-best-practices, vercel-composition-patterns, nestjs-expert | web-design-guidelines, web-perf |
| 3 | nestjs-expert, workers-best-practices (n/a) | skill Vercel AI SDK / LLM orchestration |
| 4 | playwright-best-practices, playwright-cli, playwright-generate-test | — |
| 5 | — | — |

> Nota tooling: el loader de skills falla con `Expand-Archive` (módulo `Microsoft.PowerShell.Archive` no cargado en PowerShell). Workaround: leer el `SKILL.md` directamente (`Read` sobre `.agents/skills/<name>/SKILL.md`).

---

## 10. Decisiones globales bloqueadas (confirmadas con usuario)

1. Stack: Nest + Prisma (PG `odontocare_db`) + Next App Router. Sin Express/vanilla ni Evolution.
2. Auth: bcryptjs(12) + JWT, roles `SUPER_ADMIN/CLINIC_ADMIN/DOCTOR`.
3. Canales: 1 Telegram bot + 1 WhatsApp (Meta Cloud) por clínica; credenciales en PG.
4. pnpm store local (`.pnpm-store`) por EPERM en Windows.
5. Impersonation con cookie separada `session-impersonated`.
6. Data-fetching: RSC (data) + client islands (interactividad).
7. Hashing sesiones: AES-256-GCM (SessionCryptoService) — evaluar migrar a Redis/Prisma en Fase 3.