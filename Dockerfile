# Image untuk Google Cloud Run.
#
# Dibangun bertahap supaya image akhir hanya berisi hasil build dan dependensi
# produksi. Basisnya Debian slim, bukan Alpine: Prisma butuh OpenSSL dan
# engine-nya jauh lebih rewel di musl.
#
# Cloud Run menyuntikkan PORT sendiri (8080). `src/env.ts` sudah membacanya,
# jadi tidak ada yang perlu di-hardcode di sini.

FROM node:22-slim AS base
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# --- Dependensi produksi saja, untuk disalin ke image akhir ------------------
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# --- Build TypeScript + Prisma Client ---------------------------------------
FROM base AS build
COPY package.json package-lock.json ./
RUN npm ci
COPY prisma ./prisma
RUN npx prisma generate
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# --- Image akhir ------------------------------------------------------------
FROM base AS run
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
# Prisma Client hasil generate; `prisma` CLI-nya sendiri tidak ikut karena
# hanya dibutuhkan saat build dan saat migrasi (dijalankan terpisah).
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package.json ./

USER node
EXPOSE 8080
CMD ["node", "dist/server.js"]
