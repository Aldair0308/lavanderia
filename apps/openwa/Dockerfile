FROM node:22-alpine AS builder
WORKDIR /app

COPY native/package*.json ./
RUN npm ci

COPY native/ ./
RUN npm prune --omit=dev

FROM node:22-alpine AS production
RUN apk add --no-cache tini

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/package.json ./package.json

EXPOSE 8081
ENV OPENWA_PORT=8081
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]
