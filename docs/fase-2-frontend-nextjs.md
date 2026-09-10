# Informe Técnico — Fase 2: Frontend Next.js (Dashboard Rico)

> **Proyecto:** OdontoCare IA Refactor (Nest.js + Next.js, monorepo Turborepo)
> **Estado:** Fases 0 y 1 completas — Fase 2 en ejecución
> **Fecha:** 2026-09-09 (actualizado)
> **Fuente:** `ROADMAP.md` + inspección real de `apps/web` y `apps/api`

---

## 1. Resumen Ejecutivo

La Fase 2 construye el **Frontend Web** (Next.js App Router) sobre el backend Nest establecido. La primera mitad (sub-fases **2.0, 2.1 y 2.2**) ya está **completa y verificada**: la fundación compila, el design system beige está construido y la autenticación BFF con cookie httpOnly funciona.

La segunda mitad (**2.3 pantallas UI + 2.4 endpoints Nest**) es el trabajo pendiente documentado en este plan, junto con las **skills a usar** para maximizar la calidad del resultado.

---

## 2. Estado por sub-fase

| Sub-fase | Estado |
|---|---|
| 2.0 Fundación (Tailwind v4, tsconfig, proxy, build verde) | ✅ COMPLETA |
| 2.1 Design System (hand-rolled: button/card/dialog/table/skeleton/badge/input/select/tabs/textarea) | ✅ COMPLETA |
| 2.2 Auth BFF (cookie httpOnly + middleware + api.ts/auth.ts) | ✅ COMPLETA |
| 2.3 Pantallas UI | ⏳ PENDIENTE |
| 2.4 Endpoints Nest faltantes | ⏳ PENDIENTE |

---

## 3. Gaps detectados (los resuelve este plan)

| # | Gap | Evidencia | Resolución |
|---|---|---|---|
| G1 | `dashboard/page.tsx` y `clinics/page.tsx` son las versiones viejas `"use client"` con `localStorage` (token ya no existe) | `dashboard/page.tsx:16`, `clinics/page.tsx:21` | Reescribir como **Server Components** usando `fetchApi` |
| G2 | Cliente no lee cookie httpOnly → no envía `Bearer` | `api.ts:23-31` | Patrón **RSC para data + Client Islands** para interactividad |
| G3 | `metrics`/`clinics` controllers sin guard JWT | `metrics.controller.ts`, `clinics.controller.ts` | Añadir `@UseGuards(JwtAuthGuard)` (2.4.0) |
| G4 | `metrics.service` hardcodea KPIs (42/8/85) | `metrics.service.ts:16-22` | Real counts (2.4.6) |
| G5 | `recharts` y `zod` están en `devDependencies` | `package.json` | `recharts` → `dependencies` (lo necesita el standalone) |

---

## 4. Arquitectura de data-fetching (decisión tomada)

**Server Components leen datos; Client Components ("islands") manejan interactividad.**

- Rutas de página (`dashboard`, `clinics`, `clinics/[id]`) → `async` Server Components que llaman `fetchApi()` (inyecta `Bearer` desde la cookie en SSR).
- Dialogs, botones, búsqueda, charts → componentes `"use client"` que reciben datos como props.

**Impersonation** (decisión tomada): el token impersonado se guarda en una **cookie separada `session-impersonated`** para poder "volver" al rol real con un botón; `api.ts` usa primero `session-impersonated` si existe.

---

## 5. Skills a usar (para el mejor resultado)

### 5.1 Skills ya instaladas y aplicadas
- **`nestjs-expert`** — arquitectura de módulos, DI, guards, JWT. Clave para 2.4 (evitar `forwardRef`, resolver `JwtService` vía import de `AuthModule`).
- **`frontend-design`** — dirección visual deliberada, tipografía, evitar el "SaaS-card kit" genérico, copywriting en active voice/sentence case.
- **`vercel-react-best-practices`** — patrones de rendimiento React/Next (server vs client components, evitar N+1, memoización).
- **`vercel-composition-patterns`** — composición de componentes (compound components, evitar proliferación de props booleanas).

### 5.2 Skills recomendadas para buscar/instalar en sesiones futuras
- **`web-design-guidelines`** (ya instalada) — auditar accesibilidad/UX del dashboard al final.
- **`web-perf`** — medir Core Web Vitals del dashboard (LCP/INP/CLS) tras 2.3.
- **`playwright-best-practices`** / **`playwright-cli`** — E2E del flujo 3 roles (Fase 4).
- Posibles a buscar vía `find-skills`: un skill de **Recharts/visualización** o **shadcn/ui** si se decide migrar de hand-rolled a componentes Radix más adelante.

> Nota: el loader de skills falló con `Expand-Archive` (PowerShell `Microsoft.PowerShell.Archive` no cargado). Workaround: leer el `SKILL.md` directamente (`Read` sobre `.agents/skills/<name>/SKILL.md`).

---

## 6. Decisiones adoptadas (respondidas)

| # | Decisión | Valor |
|---|---|---|
| 1 | Componentes | Hand-rolled beige (sin CLI shadcn) |
| 2 | Data-fetching | Server Components + client islands |
| 3 | Auth | Cookie httpOnly BFF (`session`) |
| 4 | Impersonation | Cookie separada `session-impersonated` |
| 5 | Puerto web | `3001` (CORS Nest en `main.ts:16`) |

---

## 7. TASK LIST (segunda mitad)

### Sub-fase 2.4 — Backend Nest

- [ ] **2.4.0** Añadir `@UseGuards(JwtAuthGuard)` a `ClinicsController` y `MetricsController`. Importar `AuthModule` en `clinics.module.ts` y `metrics.module.ts` (AuthModule exporta `JwtModule`, lo que provee `JwtService` al guard). Sin esto el guard lanza "can't resolve JwtService".
- [ ] **2.4.1** Módulo `doctors` (`doctors.controller/service/module.ts`):
  - `GET /api/clinics/:clinicId/doctors`, `POST`, `PATCH /:doctorId`, `DELETE /:doctorId`
  - `POST /api/clinics/:clinicId/doctors/:doctorId/toggle-status` (flip `isActive`)
- [ ] **2.4.2/3** Módulo `treatments` (`treatments.controller/service/module.ts`):
  - `GET /api/clinics/:clinicId/treatments`, `POST`, `PATCH /:id`, `DELETE /:id`
- [ ] **2.4.4** `POST /api/clinics/:id/telegram` (guarda `telegramBotToken`) en `ClinicsController`.
- [ ] **2.4.5** Módulo `chat` (`chat.controller.ts`): `POST /api/chat` stub (devuelve eco; agente real en Fase 3).
- [ ] **2.4.6** Módulo `appointments` + `metrics.service.ts` con counts reales (`clinic.count`, `doctor.count`, `appointment.count`, citas de hoy). `channels`/`retentionRate` quedan placeholder hasta Fase 3.
- [ ] Registrar todos los módulos en `app.module.ts`.

### Sub-fase 2.3 — Frontend Next.js

- [ ] **2.3.0** Mover `recharts` a `dependencies`. Crear `src/lib/types.ts` (interfaces `Metrics`, `Clinic`, `Doctor`, `Treatment`, `Appointment`, `UserSession`).
- [ ] **2.3.1 Dashboard** (`app/dashboard/page.tsx`) → async Server Component:
  - `fetchApi("/api/metrics/real")`, bento grid con `Card`.
  - Gráfico Recharts (`ChannelChart` client island) para canales.
  - `loading.tsx` con `Skeleton`.
- [ ] **2.3.2 Clínicas CRUD** (`app/clinics/page.tsx`) → Server Component + islands:
  - Tabla (`Table`/`Badge`), `NewClinicDialog`/edit/delete.
  - Botón "Ver como clínica" → `POST /api/auth/impersonate` (solo SUPER_ADMIN), cookie `session-impersonated`.
- [ ] **2.3.3 Workspace** (`app/clinics/[id]/page.tsx`): KPIs + toggle doctores.
- [ ] **2.3.4 Catálogo** (`app/clinics/[id]/catalog/page.tsx`): tratamientos/doctores CRUD + búsqueda.
- [ ] **2.3.5 Modal credenciales**: Meta Cloud (`POST /api/clinics/:id/meta-whatsapp`) + Telegram (`POST /api/clinics/:id/telegram`).
- [ ] **2.3.6 Playground chat** (`app/chat/page.tsx`).
- [ ] **2.3.7 Skeleton loaders** en todas las vistas async.

### Verificación (cierre)

- [ ] `pnpm --filter api build` verde.
- [ ] `pnpm --filter web build` verde.
- [ ] `pnpm typecheck` verde en ambos.
- [ ] Flujo 3 roles: login → dashboard → clínicas CRUD → impersonate → logout.

---

## 8. Endpoints Nest (contrato final)

| Método | Ruta | Guard | Notas |
|---|---|---|---|
| POST | `/api/auth/login` | público | → `{ok, token, user, role, clinicId}` |
| GET | `/api/auth/verify` | JWT | |
| POST | `/api/auth/impersonate` | JWT (SUPER_ADMIN) | → `{ok, token, impersonatedClinicId}` |
| GET/POST/PATCH/DELETE | `/api/clinics...` | JWT | incluye doctores/treatments |
| GET | `/api/metrics/real` | JWT | |
| POST | `/api/chat` | JWT | stub (Fase 3) |

---

## 9. Fuera de alcance

- `src/` legacy → Fase 5
- `agent-core`, guardrails, Redis, Chatwoot, calendario, multi-bot → Fase 3
- `channels`/`retentionRate` reales en metrics → Fase 3
- Tests Vitest/Playwright → Fase 4
- `scripts/migrate-to-pg.ts` → Fase 5