ARG VITE_API_URL
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

FROM node:22-alpine AS builder
ARG VITE_API_URL
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

WORKDIR /app

COPY package*.json ./
COPY apps/admin/package*.json apps/admin/
RUN npm ci

COPY tsconfig.base.json ./
COPY apps/admin/ apps/admin/
WORKDIR /app/apps/admin
RUN npm run build

FROM node:22-alpine AS production
RUN apk add --no-cache tini

WORKDIR /app
COPY --from=builder /app/apps/admin/dist ./dist
COPY apps/admin/server.mjs ./

EXPOSE 3001
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.mjs"]
