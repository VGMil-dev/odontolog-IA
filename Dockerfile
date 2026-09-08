# =============================================================
# Multi-stage Dockerfile para OdontoCare IA (Producción)
# Optimizado para Node.js 22 Alpine y pnpm 11
# =============================================================

# --- Etapa 1: Dependencias y Compilación ---
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copiar manifiestos de dependencias
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc tsconfig.json ./

# Instalar dependencias completas
RUN pnpm install --frozen-lockfile

# Copiar código fuente y configuración clínica
COPY src/ ./src/
COPY clinic.config.json ./

# Compilar TypeScript a dist/
RUN pnpm run build

# Podar dependencias de desarrollo para dejar solo producción
RUN pnpm prune --prod

# --- Etapa 2: Imagen de Ejecución Ligera ---
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
ENV TZ=America/Guayaquil

# Instalar tzdata para garantizar precisión de zona horaria America/Guayaquil
RUN apk add --no-cache tzdata

# Copiar artefactos compilados y dependencias de producción
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/clinic.config.json ./clinic.config.json

# Crear archivo de persistencia de sesiones inicial con permisos
RUN touch .sessions.json && chown -R node:node /app

USER node

EXPOSE 3000

CMD ["node", "dist/index.js"]
