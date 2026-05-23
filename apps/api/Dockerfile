FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY apps/api/package*.json apps/api/
RUN npm ci

COPY tsconfig.base.json ./
COPY apps/api/ apps/api/
WORKDIR /app/apps/api
RUN npm run build

FROM node:22-alpine AS production
WORKDIR /app/apps/api
RUN apk add --no-cache tini

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/node_modules ./node_modules
COPY --from=builder /app/apps/api/package.json ./

RUN npm prune --omit=dev

EXPOSE 3100
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/main.js"]
