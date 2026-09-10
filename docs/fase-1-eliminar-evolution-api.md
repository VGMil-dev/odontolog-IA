# Informe Ejecutivo — Fase 1: Eliminar Evolution API y desbloquear pnpm

> **Proyecto:** OdontoCare IA Refactor (Nest.js + Next.js, monorepo Turborepo)
> **Estado:** Fase 0 completa — Fase 1 en ejecución
> **Fecha:** 2026-09-09
> **Fuente:** `ROADMAP.md` + inspección del código legacy real

---

## 1. Resumen Ejecutivo

El objetivo de esta fase es **eliminar por completo la integración con Evolution API** (conector no oficial de WhatsApp) y **desbloquear el workspace pnpm** para poder instalar y compilar los pilares del monorepo (`apps/api` y `apps/web`).

Evolution API era el conector WhatsApp self-hosted (`evoapicloud/evolution-api:v2.1.2`) del monolito legacy Express. Ha quedado obsoleto al migrar a **Meta WhatsApp Cloud API** (Graph API v21.0, oficial de Meta, cero riesgo de baneo). Su eliminación implica tocar **6 archivos de código + 3 de infraestructura/documentación** y renombrar las credenciales PostgreSQL de `evolution` a `odontocare`.

**Decisión clave (confirmada por el usuario):** renombrar el usuario/BD PostgreSQL de `evolution`/`evolution_db` a `odontocare`/`odontocare_db`, y usar **store local de pnpm** (`.pnpm-store`) dentro del repo para esquivar el error `ERR_PNPM_EPERM` del store global protegido `D:\.pnpm-store`.

---

## 2. Problema Bloqueante Pre-existente

`pnpm install` falla con `ERR_PNPM_EPERM` al descargar `turbo` porque el store global `D:\.pnpm-store` está protegido por permisos de Windows.

**Solución aplicada:** fijar un store local dentro del workspace vía `.npmrc` con `store-dir=.pnpm-store`, para no depender de permisos de administrador sobre `D:\`.

---

## 3. Decisiones adoptadas (confirmadas)

| # | Decisión | Valor |
|---|---|---|
| 1 | Renombrar credenciales PG | `evolution` / `evolution_secret_pass` / `evolution_db` → `odontocare` / `odontocare_secret_pass` / `odontocare_db` |
| 2 | pnpm store | Local en repo: `.pnpm-store` |
| 3 | Limpieza de referencias Evolution en docs/scripts | Sí, hacer ahora (GEMINI.md, migrate-to-pg.ts) |
| 4 | Hash para `migrate-to-pg.ts` | Solo renombrar credenciales; el resto es candela a Fase 5 |

---

## 4. Discrepancias detectadas vs. ROADMAP (importante)

1. **`.env` ya no contiene variables `EVOLUTION_*`.** Las referencias Evolution reales están en `.env.example` (37–40) y `docker-compose.yml` (32–34). El ROADMAP apuntaba a `.env`.
2. **`src/services/pg.service.ts`** ya usa `odontocare_db` como base por defecto (línea 13); lo que queda por corregir es usuario/clave (líneas 11–12) y el `docker-compose.yml` (postgres inicializado con `evolution_db`).
3. **Números de línea en `whatsapp.ts`** difieren levemente: `sendEvolutionMessage` ocupa 100–132 (con JSDoc en 97–99), no 97–132 exactos.
4. **`crypto`** (`server.ts` línea 2) se usa únicamente en la rama Evolution (`timingSafeEqual`, línea 674); eliminarlo es seguro.
5. **Artifacts no trackeados**: directorio `chef-client;api/` en la raíz (probable `cd` accidental). No es parte de esta fase; conviene borrarlo manualmente.

---

## 5. Archivos afectados — resumen

| Tipo | Archivo | Acción |
|---|---|---|
| BORRAR | `src/services/evolution.service.ts` | Archivo completo |
| MODIFICAR | `src/channels/whatsapp.ts` | Quitar 2 métodos Evolution |
| MODIFICAR | `src/server.ts` | Quitar imports, 2 rutas y rama webhook |
| MODIFICAR | `src/config/env.ts` | Quitar bloque `EVOLUTION_*` |
| MODIFICAR | `docker-compose.yml` | Quitar servicio/volumen + renombrar PG |
| MODIFICAR | `.env.example` | Quitar bloque `EVOLUTION_*` |
| MODIFICAR | `.env` | Renombrar `DATABASE_URL` |
| MODIFICAR | `src/services/pg.service.ts` | Renombrar credenciales PG |
| MODIFICAR | `scripts/migrate-to-pg.ts` | Renombrar credenciales PG |
| MODIFICAR | `GEMINI.md` | Quitar menciones Evolution |
| MODIFICAR | `.npmrc` | Añadir `store-dir` local |

---

## 6. TASK LIST (checklist detallado para continuar en nueva sesión)

> Orden recomendado: hacer primero los cambios de código, luego la infra y por último verificar. Borrar bloques de **abajo-arriba** en archivos donde los números de línea se desplazan.

### Bloque A — Eliminar el servicio Evolution (backend)

- [ ] **A1. BORRAR `src/services/evolution.service.ts`** (116 líneas)
  - Por qué: conector a `evoapicloud/evolution-api`; muere con todos sus consumidores.
  - Contiene: `EvolutionService`, `QrCodeResult`, `ensureInstance`, `getConnectQr`, `getConnectionState`.

- [ ] **A2. `src/channels/whatsapp.ts`** — quitar métodos Evolution
  - [ ] Borrar método `handleEvolutionWebhook` (JSDoc líneas 12–14 + método 15–95).
    - Para qué: parsea payload Evolution (`messages.upsert`, `@s.whatsapp.net`); reemplazado por `handleMetaCloudWebhook`.
  - [ ] Borrar método `sendEvolutionMessage` (JSDoc 97–99 + método 100–132).
    - Para qué: envía vía `${EVOLUTION_API_URL}/message/sendText`; reemplazado por `sendMetaCloudMessage`.
  - [ ] Conservar intactos `handleMetaCloudWebhook` (134–235) y `sendMetaCloudMessage` (237–276).
  - CUÁNDO: primero borrar 97–132, luego 12–95 (para no perder numeración).

- [ ] **A3. `src/server.ts`**
  - [ ] Línea 2: borrar `import crypto from 'crypto';` (único uso en rama Evolution, línea 674).
  - [ ] Línea 17: borrar `import { evolutionService } from './services/evolution.service.js';`.
  - [ ] Líneas 111–120: borrar ruta `GET /api/whatsapp/qr/:instanceName` (incluye comentario 111).
  - [ ] Líneas 122–130: borrar ruta `GET /api/whatsapp/status/:instanceName`.
  - [ ] `POST /webhooks/whatsapp` (653–691): dejar solo rama Meta Cloud (657–665) + `ignored` (684); borrar rama Evolution (667–682) que usa `env.EVOLUTION_API_KEY`, `crypto.timingSafeEqual` y `handleEvolutionWebhook`.
  - [ ] Actualizar comentario línea 653 (menciona "Evolution API fallback").

- [ ] **A4. `src/config/env.ts`**
  - [ ] Líneas 48–51 + línea en blanco 52: borrar bloque `// Evolution API (WhatsApp)` + `EVOLUTION_API_URL`, `EVOLUTION_API_KEY`, `EVOLUTION_INSTANCE_NAME`.

### Bloque B — Renombrar credenciales PostgreSQL (evolution → odontocare)

- [ ] **B1. `docker-compose.yml`**
  - [ ] Remover `EVOLUTION_API_URL/KEY/INSTANCE_NAME` del bloque `environment` de `odontocare-ai` (líneas 32–34).
  - [ ] **BORRAR servicio `evolution-api` completo** (líneas 93–124; perfil `legacy-evolution`).
  - [ ] **BORRAR volumen `evolution_instances`** (línea 133; la ref. interna 117 desaparece con el servicio).
  - [ ] Renombrar PG: `POSTGRES_USER=odontocare` (79), `POSTGRES_PASSWORD=odontocare_secret_pass` (80), `POSTGRES_DB=odontocare_db` (81), healthcheck `pg_isready -U odontocare -d odontocare_db` (86).

- [ ] **B2. `src/services/pg.service.ts`**
  - [ ] Línea 11: `user: 'evolution'` → `'odontocare'`.
  - [ ] Línea 12: `password: 'evolution_secret_pass'` → `'odontocare_secret_pass'`.
  - [ ] Línea 13 (`odontocare_db`): ya correcta, no tocar.

- [ ] **B3. `.env`**
  - [ ] Línea 101: `DATABASE_URL=postgresql://odontocare:odontocare_secret_pass@localhost:5432/odontocare_db?schema=public`.

- [ ] **B4. `scripts/migrate-to-pg.ts`**
  - [ ] Línea 9: `user: 'evolution'` → `'odontocare'`.
  - [ ] Línea 10: `password: 'evolution_secret_pass'` → `'odontocare_secret_pass'`.
  - Nota: este script aún inserta columna legada `whatsapp_instance` y hashea con SHA-256 (no bcrypt) → candidato a borrar en Fase 5.

### Bloque C — Limpieza de env y documentación

- [ ] **C1. `.env.example`**
  - [ ] Líneas 37–40: borrar bloque `# WhatsApp Evolution API (Docker Self-Hosted)` + `EVOLUTION_API_URL/KEY/INSTANCE_NAME`.

- [ ] **C2. `GEMINI.md`**
  - [ ] Línea 15: `"WhatsApp Evolution API / Meta Cloud API"` → `"WhatsApp Meta Cloud API"`.
  - [ ] Línea 115: nodo mermaid `WA["WhatsApp Evolution"]` → `WA["WhatsApp Meta Cloud"]`.
  - [ ] Línea 171: `(Redis + Evolution API + OdontoCare)` → `(Redis + PostgreSQL + OdontoCare)`.
  - [ ] Línea 180: registro v1.1.0: quitar mención "Evolution API WhatsApp".

### Bloque D — Desbloquear pnpm

- [ ] **D1. `.npmrc`**: añadir `store-dir=.pnpm-store`.

### Bloque E — Testing y verificación

- [ ] **E1. Sin referencias residuales**: grep de `evolutionService`, `EVOLUTION_`, `handleEvolutionWebhook`, `sendEvolutionMessage`, rutas `whatsapp/qr` y `whatsapp/status` en `src/`, `apps/`, `docker-compose.yml` → 0 resultados.
- [ ] **E2. `pnpm install`** → descarga `turbo` + deps de `apps/api` y `apps/web` sin `ERR_PNPM_EPERM`.
- [ ] **E3. `pnpm build`** → ambos apps compilan.
- [ ] **E4. `pnpm typecheck`** → sin errores de tipos.
- [ ] **E5. `pnpm test`** → verde. Asegurar que ningún test legacy referencie Evolution (rutas QR/status o `evolutionService`).
- [ ] **E6. Arranque API Nest**: `pnpm --filter api dev` + `prisma generate` OK, seed 3 usuarios (superadmin/admin/doctor) carga contra `odontocare_db`.

---

## 7. Credenciales de prueba (seed.ts — referencia)

| Usuario | Password | Rol |
|---|---|---|
| `superadmin@odontocare.com` | `odontocare2026` | SUPER_ADMIN |
| `admin@clinica1.com` | `clinica2026` | CLINIC_ADMIN |
| `doctor@clinica1.com` | `doctor2026` | DOCTOR |

---

## 8. Nota técnica

Se usa `bcryptjs` (API 100% compatible con `bcrypt`, sin binarios nativos) por confiabilidad en Windows/Docker. Si se prefiere `bcrypt` nativo, cambiar dependencia en `apps/api/package.json` y el import correspondiente.