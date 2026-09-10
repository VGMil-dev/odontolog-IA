# Roadmap — OdontoCare IA Refactor (Nest.js + Next.js)

## 🎯 Objetivo

Refactorizar OdontoCare IA de un monolito Express + Vanilla JS a un **monorepo Turborepo** con:

- **API**: Nest.js + Prisma → PostgreSQL `odontocare_db` (eliminar Evolution API por completo)
- **Front**: Next.js (App Router) — dashboard rico, sin hardcode, todos los botones funcionales
- **Auth**: bcrypt(12) + JWT, roles unificados `SUPER_ADMIN` / `CLINIC_ADMIN` / `DOCTOR`
- **Canales**: 1 bot Telegram + 1 WhatsApp (Meta Cloud API) por clínica, credenciales en PG
- **Deploy**: self-hosted VPS vía Docker Compose multi-contenedor (+ Turbo para dev/cache)

---

## 📐 Arquitectura final (decidida)

- **Monorepo Turborepo** (pnpm): `apps/api`, `apps/web`, `packages/agent-core`, `packages/shared`
- **API Nest** + **Prisma** conectando **directo a PostgreSQL** (`odontocare_db`)
- **3 roles** con pantalla propia cada uno
- **Credenciales por clínica**: `telegram_bot_token`, `meta_phone_number_id`, `meta_waba_id`, `meta_access_token`, `calendar_id`
- **Hashing**: bcrypt (via `bcryptjs`, cost=12) — nota: es compatible 100% con bcrypt; cambiar a `bcrypt` nativo si se requiere

---

## 🗺️ Fases

### Fase 0 — Setup + skills + investigación ✅ COMPLETA
- Instalar skills: `find-skills`, `vercel-labs/agent-skills` (react/next/design), `davila7/claude-code-templates@nestjs-expert`
- Investigación subagentes: Turborepo, Nest+Prisma+PG, Next SaaS multi-tenant
- Scaffold monorepo: `turbo.json`, `pnpm-workspace.yaml`, `.npmrc`, packages tsconfig

### Fase 1 — API Nest + deuda técnica ⏳ EN PROGRESO
- [x] Auth: login, verify, impersonate (bcrypt + JWT)
- [x] Metrics endpoint (`/api/metrics/real`)
- [x] Clinics CRUD endpoint
- [x] Favicon inline
- [x] Prisma schema + seed (3 usuarios de prueba)
- [ ] **Eliminar Evolution API** (legacy `src/`, ver sección siguiente)
- [ ] Fix DB name (`evolution_db` → `odontocare_db`) en docker-compose

### Fase 2 — Front Next.js (dashboard rico)
- [ ] Config Tailwind v4 + shadcn/ui (beige design system)
- [ ] Auth BFF (cookie httpOnly) + api client wrapper
- [ ] Overview bento grid (KPIs reales + charts Recharts)
- [ ] Directorio de clínicas (CRUD)
- [ ] Workspace por clínica (KPIs, toggle doctores)
- [ ] Catálogo tratamientos/doctores (CRUD, búsqueda en vivo)
- [ ] Modal credenciales por canal (Meta Cloud + Telegram)
- [ ] Playground chat
- [ ] Skeleton loaders (shimmer)

### Fase 3 — Agent-core a Nest
- [ ] Portar `agent/core.ts`, `guardrails.ts`, `prompts.ts`, `tools.ts` a `packages/agent-core`
- [ ] Portar channels (Telegram/WhatsApp), Redis/buffer, Chatwoot, calendario, recordatorios, privacy
- [ ] **Multi-bot Telegram por clínica** (registro/arranque dinámico de N bots)
- ⚠️ NO tocar guardrails de Valeria IA

### Fase 4 — Tests
- [ ] Reescribir tests unit (Vitest → Nest)
- [ ] Reescribir `tests/e2e/dashboard-ui.spec.ts` (Playwright)

### Fase 5 — Limpieza final
- [ ] Eliminar legacy `src/`, restos Evolution, `evolution_db`
- [ ] Actualizar `.env.example`, `docker-compose.yml`, `GEMINI.md`

---

## 🚧 Tarea inmediata: Eliminar Evolution API

Archivos y cambios precisos:

1. **`src/services/evolution.service.ts`** → BORRAR archivo completo
2. **`src/channels/whatsapp.ts`** → eliminar `handleEvolutionWebhook` (líneas 15-95) y `sendEvolutionMessage` (97-132); conservar `handleMetaCloudWebhook` y `sendMetaCloudMessage`
3. **`src/server.ts`**:
   - Quitar `import { evolutionService }` (línea 17) y `import crypto` (línea 2)
   - Borrar rutas `/api/whatsapp/qr/:instanceName` (111-120) y `/api/whatsapp/status/:instanceName` (122-130)
   - En `/webhooks/whatsapp` (654-691): eliminar rama Evolution (`req.body?.event`), dejar solo Meta Cloud
4. **`src/config/env.ts`** → quitar bloque `EVOLUTION_*` (líneas 48-51)
5. **`.env`** → quitar vars `EVOLUTION_*`
6. **`docker-compose.yml`** → quitar service `evolution-api` y volumen `evolution_instances`

---

## 🚧 Bloqueante conocido: pnpm install

`pnpm install` falla con `ERR_PNPM_EPERM` al descargar `turbo` (store global `D:\.pnpm-store` protegido en Windows). 

Workaround aplicado: `npm install` individual dentro de `apps/api`. 

Pendiente resolver: fijar `PNPM_STORE_PATH` local o corregir permisos del store para poder `pnpm install` completo y verificar `pnpm test` / compilación de ambos apps.

---

## 🔑 Credenciales de prueba (seed.ts)

| Usuario | Password | Rol |
|---|---|---|
| `superadmin@odontocare.com` | `odontocare2026` | SUPER_ADMIN |
| `admin@clinica1.com` | `clinica2026` | CLINIC_ADMIN |
| `doctor@clinica1.com` | `doctor2026` | DOCTOR |

---

## 📌 Decisiones bloqueadas (confirmadas con usuario)

- Stack: refactor completo a Nest.js + Next.js (no Express/vanilla)
- Monorepo: Turborepo (hibrido: dev con Turbo, prod con Docker Compose) — VPS self-hosted
- ORM: Prisma sobre PostgreSQL (no `pg` crudo)
- Roles: 3 (SUPER_ADMIN/CLINIC_ADMIN/DOCTOR), cada uno con pantalla propia
- Canales: multi-bot por clínica (Telegram token + Meta credenciales en PG)
- Hashing: bcryptjs (cost 12)

---

## 🗂️ Estructura de archivos actual

```
odontolog-IA/
├── apps/
│   ├── api/
│   │   ├── prisma/{schema.prisma, seed.ts}
│   │   ├── src/
│   │   │   ├── main.ts (bootstrap, favicon, CORS, shutdown)
│   │   │   ├── app.module.ts
│   │   │   ├── prisma.service.ts
│   │   │   ├── auth/{auth.controller.ts, auth.service.ts, auth.module.ts, jwt.strategy.ts}
│   │   │   ├── clinics/{clinics.controller.ts, clinics.service.ts, clinics.module.ts}
│   │   │   └── metrics/{metrics.controller.ts, metrics.service.ts, metrics.module.ts}
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web/
│       ├── app/{layout.tsx, login/page.tsx, dashboard/page.tsx, clinics/page.tsx}
│       ├── src/styles/globals.css (beige tokens Tailwind v4)
│       ├── next.config.js
│       └── package.json
├── packages/
│   ├── tsconfig/{base.json, node.json, package.json}
│   ├── shared/ (stub)
│   └── agent-core/ (stub)
├── src/ (LEGACY — Express, a eliminar en Fase 5)
├── turbo.json
├── pnpm-workspace.yaml
├── .npmrc
└── package.json (raíz Turbo)
```

---

## ✅ Qué funciona hoy

1. **Prisma Client generado** (`npx prisma generate` OK)
2. **Nest API compila** en estructura (auth, clinics, metrics, favicon)
3. **Skills instalados**: find-skills, vercel-labs (react/next/design), nestjs-expert
4. **Monorepo config**: turbo.json, pnpm-workspace, tsconfig base

---

## 🔜 Siguiente paso exacto

1. Eliminar Evolution API (sección "Tarea inmediata")
2. Resolver permisos de pnpm store
3. `pnpm install` completo + `pnpm test` verde
4. Arrancar Fase 2 (frontend Next.js dashboard rico)