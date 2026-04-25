FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./
COPY apps/server/package.json apps/server/package.json
COPY apps/web/package.json apps/web/package.json

RUN yarn install --frozen-lockfile

COPY apps/server apps/server

RUN yarn workspace @ninejuan/cv-server build

FROM node:22-alpine AS production

ENV NODE_ENV=production
ENV APP_PORT=3000

WORKDIR /app

RUN addgroup -S nodejs && adduser -S nodejs -G nodejs

COPY package.json yarn.lock ./
COPY apps/server/package.json apps/server/package.json
COPY apps/web/package.json apps/web/package.json

RUN yarn install --frozen-lockfile --production=true && yarn cache clean

COPY --from=builder --chown=nodejs:nodejs /app/apps/server/dist apps/server/dist

COPY --chown=nodejs:nodejs apps/server/package.json apps/server/package.json

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "apps/server/dist/main.js"]
