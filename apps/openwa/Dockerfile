FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY openwa-native/package*.json openwa-native/
RUN npm ci

COPY openwa-native/ openwa-native/
WORKDIR /app/openwa-native
RUN npm prune --omit=dev

FROM node:22-alpine AS production
RUN apk add --no-cache tini

WORKDIR /app
COPY --from=builder /app/openwa-native/node_modules ./node_modules
COPY openwa-native/server.js ./server.js
COPY openwa-native/package.json ./package.json

EXPOSE 8081
ENV OPENWA_PORT=8081
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]
