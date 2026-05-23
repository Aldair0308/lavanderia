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
COPY apps/client/package*.json apps/client/
RUN npm ci

COPY tsconfig.base.json ./
COPY apps/client/ apps/client/
WORKDIR /app/apps/client
RUN npm run build

FROM node:22-alpine AS production
RUN apk add --no-cache tini

WORKDIR /app
COPY --from=builder /app/apps/client/dist ./dist

RUN npm i -g serve

EXPOSE 3000
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["sh", "-c", "serve dist -p ${PORT:-3000}"]
