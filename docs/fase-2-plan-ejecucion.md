# Plan de Ejecución — Fase 2 (Frontend Next.js + Endpoints Nest)

> **Proyecto:** OdontoCare IA Refactor (monorepo Turborepo: Nest.js + Next.js)
> **Objetivo de este documento:** entregable para que **otro agente** ejecute la Fase 2 sin re-investigar.
> **Contexto:** Fases 0 y 1 completas. Sub-fases 2.0–2.2 completas. Partes de 2.4 ya implementadas.
> **Fecha:** 2026-09-09

---

## 1. Estado actual (punto de partida)

### 1.1 Ya COMPLETO y verificado

| Sub-fase | Entregado | Ubicación |
|---|---|---|
| 2.0 Fundación | Tailwind v4 (`@import "tailwindcss"`), `postcss.config.mjs`, `tsconfig.json` (Next), `next.config.js` corregido, proxy `/api/*` → Nest vía `rewrites()`, `.env.local` | `apps/web/` |
| 2.1 Design System | Componentes hand-rolled beige: `button`, `card`, `input`, `label`, `textarea`, `badge`, `table`, `dialog`, `skeleton`, `tabs`, `select` + `cn()` | `apps/web/src/components/ui/` |
| 2.2 Auth BFF | Cookie httpOnly `session`; rutas `app/api/auth/login|logout`; `middleware.ts` (protege `/dashboard` y `/clinics`); `lib/api.ts` (inyecta `Bearer` en SSR); `lib/auth.ts` | `apps/web/` |

### 1.2 Backend ya implementado (accidentalmente durante planificación — DEJAR tal cual)

| Módulo/archivo | Contenido |
|---|---|
| `apps/api/src/doctors/` | CRUD + `toggle-status` (`GET/POST/PATCH/DELETE /api/clinics/:clinicId/doctors`, `POST .../toggle-status`) |
| `apps/api/src/treatments/` | CRUD (`/api/clinics/:clinicId/treatments`) |
| `apps/api/src/appointments/` | `GET/POST /api/appointments` |
| `apps/api/src/chat/` | `POST /api/chat` (stub — agente real en Fase 3) |
| `clinics.controller.ts` | `@UseGuards(JwtAuthGuard)` + `POST /:id/telegram` |
| `metrics.controller.ts` | `@UseGuards(JwtAuthGuard)` |
| `clinics.module.ts` / `metrics.module.ts` | importan `AuthModule` (provee `JwtService` al guard) |
| `schema.prisma` | añadido modelo `Treatment`; quitado `output` del generator |
| `clinics.service.ts` | quitado `include` (no había relaciones) |
| `metrics.service.ts` | counts reales via Prisma |
| `app.module.ts` | registrados todos los módulos |
| `auth.controller.ts` | DTOs con `!` + `req: any` |
| Cliente Prisma | regenerado en store pnpm |

---

## 2. Errores de build PENDIENTES en API (a resolver primero)

El API aún **no compila** por 2 motivos pre-existentes (no bloquean el frontend, pero deben cerrarse para `pnpm --filter api build` verde):

1. **`apps/api/src/auth/jwt.strategy.ts`** — importa `passport-jwt` y `@nestjs/passport` que **no están en `package.json`**.
   - **Solución recomendada:** `JwtStrategy` (PassportStrategy) es **código muerto**; la autenticación real usa `JwtAuthGuard` (guard custom con `JwtService`). **Eliminar** la clase `JwtStrategy` y su import, dejando solo `JwtAuthGuard`. **Retirar** `JwtStrategy` de `providers` y del import en `auth.module.ts`.
2. **`apps/api/src/main.ts` (línea 21)** — `app.get('/favicon.ico', handler)` es inválido (usa el `get` del contenedor DI, no una ruta HTTP).
   - **Solución recomendada:** eliminar el bloque favicon (líneas 20–24) o moverlo a un `@Get('favicon.ico')` en un controlador. El favicon lo maneja Next.js en el front.

> Comando de verificación: `pnpm --filter api exec tsc --noEmit` (o `npx tsc --noEmit` dentro de `apps/api`).

---

## 3. Decisión de arquitectura del data-fetching (aplicar en 2.3)

- **Server Components** (async) leen datos vía `lib/api.ts` (inyecta cookie `session` como `Bearer` en SSR).
- **Client Components** ("islands") manejan interactividad (dialogos, botones, búsqueda, charts), recibiendo datos por props.
- **Razón:** el browser no puede leer la cookie httpOnly; el fetch client-side a `/api/*` (rewrite) no envía el `Bearer`.

---

## 4. TASK LIST para el agente (lo que falta)

### Bloque A — Cerrar build del API
- [ ] A.1 Eliminar `JwtStrategy` (código muerto) de `jwt.strategy.ts` y de `auth.module.ts`.
- [ ] A.2 Quitar bloque favicon inválido de `main.ts`.
- [ ] A.3 Verificar `pnpm --filter api build` verde.

### Bloque B — Preparación de tipos frontend
- [ ] B.1 Mover `recharts` de `devDependencies` → `dependencies` en `apps/web/package.json` (lo requiere `output: standalone`).
- [ ] B.2 Crear `apps/web/src/lib/types.ts` con interfaces: `Metrics`, `Clinic`, `Doctor`, `Treatment`, `Appointment`, `UserSession` (campos según `schema.prisma`, ver sección 5).

### Bloque C — Pantallas (Sub-fase 2.3)

- [ ] C.1 **Dashboard** (`apps/web/app/dashboard/page.tsx`) → **async Server Component**:
  - `fetchApi("/api/metrics/real")`.
  - Bento grid con `Card` (KPIs: clínicas activas, MRR, doctores, citas totales/hoy, retención).
  - Gráfico Recharts de `channels` (island `"use client"` `<ChannelChart/>`).
  - `app/dashboard/loading.tsx` con `Skeleton`.
  - **Reemplazar la versión actual** (que usa `localStorage` obsoleto).

- [ ] C.2 **Clínicas CRUD** (`apps/web/app/clinics/page.tsx`) → **Server Component** + islands:
  - `fetchApi("/api/clinics")`, tabla con `Table`/`Badge` (nombre, ciudad, sillas, estado).
  - `NewClinicDialog` / editar / eliminar (`POST/PATCH/DELETE /api/clinics`).
  - Botón "Ver como clínica" → `POST /api/auth/impersonate` (solo `role === SUPER_ADMIN`) → guardar token en cookie **`session-impersonated`** (separada, para "volver" al rol real).
  - **Reemplazar la versión actual** (localStorage).

- [ ] C.3 **Workspace por clínica** (`apps/web/app/clinics/[id]/page.tsx`):
  - `fetchApi("/api/clinics/:id")` + doctores; toggle activo/ausente (`POST /api/clinics/:id/doctors/:doctorId/toggle-status`).

- [ ] C.4 **Catálogo** (`apps/web/app/clinics/[id]/catalog/page.tsx`):
  - Tratamientos/doctores CRUD (`/api/clinics/:id/treatments`, `/doctors`) + búsqueda en vivo.

- [ ] C.5 **Modal credenciales**: Meta Cloud (`POST /api/clinics/:id/meta-whatsapp`) + Telegram (`POST /api/clinics/:id/telegram`).

- [ ] C.6 **Playground chat** (`apps/web/app/chat/page.tsx`): `POST /api/chat`.

- [ ] C.7 **Skeleton loaders** en todas las vistas async (via `loading.tsx` de Next).

### Bloque D — Verificación final
- [ ] D.1 `pnpm --filter api build` verde.
- [ ] D.2 `pnpm --filter web build` verde.
- [ ] D.3 `pnpm typecheck` verde en ambos.
- [ ] D.4 Flujo 3 roles (credenciales en §6): login → dashboard → clínicas CRUD → impersonate → logout.

---

## 5. Contratos API (lo que el frontend consume)

| Método | Ruta | Guard | Respuesta |
|---|---|---|---|
| POST | `/api/auth/login` | — | `{ ok, token, user, role, clinicId }` |
| GET | `/api/auth/verify` | JWT | `{ ok, user }` |
| POST | `/api/auth/impersonate` | JWT (SUPER_ADMIN) | `{ ok, token, impersonatedClinicId }` |
| GET/POST | `/api/clinics`, `/api/clinics/:id` (PATCH/DELETE) | JWT | `{ ok, clinic(s) }` |
| POST | `/api/clinics/:id/meta-whatsapp` | JWT | `{ ok, clinic }` |
| POST | `/api/clinics/:id/telegram` | JWT | `{ ok, clinic }` |
| GET/POST/PATCH/DELETE | `/api/clinics/:clinicId/doctors` (+ `/toggle-status`) | JWT | `{ ok, doctor(s) }` |
| GET/POST/PATCH/DELETE | `/api/clinics/:clinicId/treatments` | JWT | `{ ok, treatment(s) }` |
| GET/POST | `/api/appointments` | JWT | `{ ok, appointment(s) }` |
| POST | `/api/chat` | JWT | `{ ok, reply }` |
| GET | `/api/metrics/real` | JWT | `{ ok, metrics }` |

**Campos del modelo `Clinic`:** `id, name, city, address, phone, emergencyPhone, contactPerson, chairsCount, telegramBotToken, metaPhoneNumberId, metaWabaId, metaAccessToken, calendarId, config`.
**`Doctor`:** `id, clinicId, name, specialty, specialtyLabel, calendarId, slotDurationMin, isActive, availableDays`.
**`Treatment`:** `id, clinicId, name, specialty, priceRange, assignedDoctorId, description`.
**`Metrics`:** `activeClinics, mrr, totalDoctors, totalUsers, totalAppointments, todayAppointments, retentionRate, channels{telegramPercent, whatsappPercent}`.

**Shape del JWT:** `{ email, role, clinicId }` (roles `SUPER_ADMIN | CLINIC_ADMIN | DOCTOR`).

---

## 6. Credenciales de prueba (seed.ts)

| Usuario | Password | Rol |
|---|---|---|
| `superadmin@odontocare.com` | `odontocare2026` | SUPER_ADMIN |
| `admin@clinica1.com` | `clinica2026` | CLINIC_ADMIN |
| `doctor@clinica1.com` | `doctor2026` | DOCTOR |

---

## 7. Skills a usar (mejor resultado)

- **`nestjs-expert`** — DI/modulos/guards JWT (Bloque A, 2.4). Clave: `JwtAuthGuard` necesita `JwtService` (importar `AuthModule`).
- **`frontend-design`** — dirección visual deliberada; evitar "SaaS-card kit"; sentence case, active voice; tipografía intencional.
- **`vercel-react-best-practices`** — server vs client components, evitar N+1, memoización.
- **`vercel-composition-patterns`** — compound components (dialogs/tabs).
- **`web-design-guidelines`** — audit accesibilidad/UX al final.
- **`playwright-cli` / `playwright-best-practices`** — E2E del flujo 3 roles (Fase 4).

---

## 8. Fuera de alcance (fases posteriores)

- `src/` legacy → Fase 5
- `agent-core`, guardrails, Redis, Chatwoot, calendario, multi-bot → Fase 3
- `channels`/`retentionRate` reales en metrics → Fase 3
- Tests Vitest/Playwright → Fase 4
- `scripts/migrate-to-pg.ts` → Fase 5