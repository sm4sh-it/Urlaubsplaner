FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat openssl
ENV NPM_CONFIG_UPDATE_NOTIFIER=false

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Initialize Prisma client and create a temporary DB for Next.js build prerendering
ENV DATABASE_URL="file:./dev.db"
RUN npx prisma generate
RUN npx prisma db push --accept-data-loss

# Next.js telemetry is disabled
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV DATABASE_URL="file:/app/data/dev.db"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Install dotenv for Prisma CLI config loading
RUN npm install dotenv && \
    chown -R nextjs:nodejs /app/node_modules /app/package.json /app/package-lock.json

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache and data folder
RUN mkdir -p .next /app/data
RUN chown -R nextjs:nodejs .next /app/data

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# We need the prisma schema and config for runtime db push
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./

# Copy docker-entrypoint
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

USER nextjs

EXPOSE 8666

ENV PORT 8666
ENV HOSTNAME "0.0.0.0"

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
