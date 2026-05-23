# OPENCODE.md — LavanderiaOS

> Este archivo es la fuente de verdad para el agente opencode. Léelo completo antes de tocar cualquier archivo del proyecto. El README.md contiene la documentación orientada al usuario; este archivo contiene las reglas, decisiones técnicas y contexto de implementación para el desarrollo.

---

## ¿Qué es este proyecto?

**LavanderiaOS** es un sistema full-stack de administración para una lavandería real. Tiene tres partes:

1. **Portal público del cliente** (`apps/client`) — React. Sin login. El cliente solicita recolección de ropa, da seguimiento a su pedido en tiempo real.
2. **Panel de administración** (`apps/admin`) — React. Con login. El negocio gestiona pedidos, clientes, mensajes de WhatsApp y campañas de reactivación.
3. **API Backend** (`apps/api`) — NestJS. Conecta todo. Expone REST, recibe webhooks de WhatsApp, orquesta el agente IA.

Adicionalmente corre **OpenWA** como servicio separado: es el gateway de WhatsApp que recibe y envía mensajes.

---

## Stack — decisiones ya tomadas, no cambiar

| Qué | Tecnología | Notas |
|-----|-----------|-------|
| Backend | NestJS 10+ con TypeScript estricto | Arquitectura modular, un folder por módulo |
| Frontend | React 18 + Vite + TypeScript | Mismo setup para client y admin |
| Base de datos | Supabase (PostgreSQL) | También provee Auth y Realtime |
| ORM | TypeORM | Entidades decoradas, migraciones en código |
| WhatsApp gateway | OpenWA (repo: rmyndharis/OpenWA) | Self-hosted, corre como servicio Docker |
| Agente IA | DeepSeek API — modelo `deepseek-chat` | Barato y suficiente para atención al cliente |
| Cache / Colas | Redis | Plugin de Railway en producción |
| Despliegue | Railway | Un Service por app, deploy desde GitHub |
| Dev local | Docker Compose | Todos los servicios en `docker-compose.dev.yml` |
| Grafo de código | CodeGraph (`@colbymchenry/codegraph`) | Actualizar con `codegraph update` tras cambios estructurales |

**No proponer alternativas a estas tecnologías.** Si hay un problema técnico con alguna, resolverlo dentro del stack definido.

---

## Estructura del monorepo — respetar siempre

```
lavanderia-os/
├── apps/
│   ├── api/          # NestJS — puerto 3100
│   ├── client/       # React público — puerto 3000
│   └── admin/        # React admin — puerto 3001
├── openwa/           # Config OpenWA — puerto 2785 (API) / 2886 (dashboard)
├── docker-compose.dev.yml
├── .env.example
├── README.md
└── OPENCODE.md       ← este archivo
```

Cada app tiene su propio `package.json`, `tsconfig.json`, `Dockerfile` y `railway.json`.
El `package.json` raíz solo maneja workspaces y scripts globales.

---

## Módulos NestJS — `apps/api/src/modules/`

Cada módulo tiene exactamente esta estructura interna:

```
orders/
├── orders.module.ts
├── orders.controller.ts
├── orders.service.ts
├── entities/
│   └── order.entity.ts
├── dto/
│   ├── create-order.dto.ts
│   └── update-order.dto.ts
└── orders.controller.spec.ts
```

### Módulos existentes (en orden de dependencia):

**`auth`**
- Integra Supabase Auth
- Expone guard `SupabaseAuthGuard` que verifica JWT de Supabase
- Decorador `@CurrentUser()` para obtener el usuario en controllers
- Solo el admin panel usa autenticación; el portal cliente es público

**`customers`**
- Entidad: `id, name, phone_whatsapp, address, email, tags, created_at, last_order_at`
- `last_order_at` se actualiza automáticamente vía evento cuando se crea/completa un pedido
- Endpoint especial: `GET /customers/inactive?days=30` — devuelve clientes sin pedido en X días
- Segmentación: `frecuente` (>4 pedidos/mes), `ocasional` (1-4/mes), `inactivo` (sin pedido en >14 días)

**`orders`**
- Estados como enum: `PENDIENTE | RECOLECTANDO | EN_PROCESO | LISTO | COMPLETADO | CANCELADO`
- Cada cambio de estado se loguea en tabla `order_status_history` con timestamp y usuario que lo hizo
- Al cambiar estado → disparar evento que el módulo `whatsapp` escucha para notificar al cliente
- Entidad principal: `id, customer_id, status, service_type, quantity_kg, notes, pickup_address, pickup_scheduled_at, delivered_at, total_price, created_at`
- Entidad items: `id, order_id, item_type, quantity, price_per_unit`

**`whatsapp`**
- Dos responsabilidades: recibir (webhook) y enviar (servicio)
- `POST /whatsapp/webhook` — endpoint público que OpenWA llama cuando llega un mensaje
- `WhatsappSenderService` — wrapper sobre la API REST de OpenWA para enviar mensajes
- Todo mensaje (entrante y saliente) se loguea en `whatsapp_messages`
- Si el agente devuelve `__ESCALAR__`: marcar conversación como `needs_human: true`, NO enviar respuesta automática, notificar en el dashboard via Supabase Realtime
- Toggle por conversación: `is_agent_active` en tabla `whatsapp_conversations`

**`agent`**
- Recibe el mensaje del cliente + historial de los últimos 10 mensajes + contexto del negocio (desde `settings`)
- Llama a DeepSeek API con el system prompt definido más abajo
- Parsea la respuesta: si es JSON con `action` → ejecutar acción; si es texto → enviar como mensaje
- Acciones disponibles: `create_order`, `get_order_status`, `get_prices`, `request_human`

**`campaigns`**
- Entidad: `id, name, message_template, target_segment, status, scheduled_at, sent_at`
- `message_template` soporta variables: `{nombre}`, `{ultimo_servicio}`, `{dias_inactivo}`
- Envío: itera sobre destinatarios y llama a `WhatsappSenderService` con delay entre mensajes (evitar spam ban)
- Delay entre mensajes: 3-8 segundos aleatorio

**`settings`**
- Tabla clave-valor simple
- Claves predefinidas: `business_name`, `business_hours`, `pickup_zones`, `services_catalog`, `agent_active`
- El portal cliente lee `services_catalog` para mostrar precios
- El agente lee `services_catalog` y `business_hours` para responder preguntas

---

## Base de datos — entidades completas

```typescript
// Todas las entidades en TypeORM con estos campos exactos

Customer {
  id: uuid (PK, generated)
  name: string
  phone_whatsapp: string (unique)  // formato: 521XXXXXXXXXX
  address: string (nullable)
  email: string (nullable)
  tags: string[] (default: [])
  created_at: timestamp
  last_order_at: timestamp (nullable)
}

Order {
  id: uuid (PK, generated)
  customer: ManyToOne → Customer
  status: enum OrderStatus
  service_type: string
  quantity_kg: decimal (nullable)
  notes: text (nullable)
  pickup_address: string
  pickup_scheduled_at: timestamp (nullable)
  delivered_at: timestamp (nullable)
  total_price: decimal (nullable)
  created_at: timestamp
  items: OneToMany → OrderItem
  status_history: OneToMany → OrderStatusHistory
}

OrderItem {
  id: uuid
  order: ManyToOne → Order
  item_type: string
  quantity: int
  price_per_unit: decimal
}

OrderStatusHistory {
  id: uuid
  order: ManyToOne → Order
  from_status: enum OrderStatus
  to_status: enum OrderStatus
  changed_by: string (user id o 'system')
  changed_at: timestamp
}

WhatsappConversation {
  id: uuid
  customer: ManyToOne → Customer
  is_agent_active: boolean (default: true)
  needs_human: boolean (default: false)
  last_message_at: timestamp
}

WhatsappMessage {
  id: uuid
  conversation: ManyToOne → WhatsappConversation
  direction: enum 'inbound' | 'outbound'
  content: text
  is_automated: boolean
  timestamp: timestamp
}

Campaign {
  id: uuid
  name: string
  message_template: text
  target_segment: string
  status: enum 'draft' | 'scheduled' | 'sending' | 'sent'
  scheduled_at: timestamp (nullable)
  sent_at: timestamp (nullable)
  created_at: timestamp
}

CampaignRecipient {
  id: uuid
  campaign: ManyToOne → Campaign
  customer: ManyToOne → Customer
  sent_at: timestamp (nullable)
  response_received: boolean (default: false)
}

Settings {
  key: string (PK)
  value: text
  updated_at: timestamp
}
```

---

## Agente DeepSeek — system prompt

Este es el system prompt base (provisional hasta tener datos reales del cliente):

```
Eres parte del equipo de una lavandería y atiendes el WhatsApp del negocio.

PERSONALIDAD:
- Respondes como una persona real, no como un bot
- Tono: directo, amable, informal pero respetuoso. Como alguien que conoce al cliente de confianza
- Español mexicano natural

REGLAS DE FORMATO — sin excepciones:
- Máximo 2 a 3 líneas por mensaje
- Sin listas numeradas ni bullets
- Sin asteriscos ni markdown de ningún tipo
- Emojis solo si el cliente los usó primero en este chat, máximo 1
- Nunca uses seguidas las palabras: "perfecto", "excelente", "con gusto", "claro que sí"
- Nunca menciones que eres automatizado, un bot, o una IA

CUANDO NO PUEDAS RESOLVER ALGO:
Responde únicamente con el texto exacto: __ESCALAR__
Úsalo cuando: el cliente esté molesto, la pregunta sea muy específica de un pedido que no encuentras, o cualquier situación donde necesites a una persona real.

CONTEXTO QUE RECIBIRÁS EN CADA MENSAJE:
- Datos del cliente (nombre, historial)
- Últimos 10 mensajes de la conversación
- Catálogo de servicios y precios actuales
- Horarios del negocio

ACCIONES DISPONIBLES:
Si necesitas ejecutar una acción, responde ÚNICAMENTE con este JSON (sin texto extra):
{"action": "create_order", "data": {"pickup_address": "", "service_type": "", "notes": "", "pickup_date": ""}}
{"action": "get_order_status", "data": {"customer_phone": ""}}
{"action": "get_prices", "data": {}}
{"action": "request_human", "data": {"reason": ""}}

Si solo vas a responder texto, responde solo el texto. Nunca mezcles JSON con texto.
```

---

## OpenWA — integración

- OpenWA corre como servicio separado (Docker)
- **Número de desarrollo:** `+52 720 753 8100` (provisional, escanear QR con este número)
- **Número de producción:** pendiente de confirmar con el cliente
- El webhook apunta a: `POST {API_URL}/whatsapp/webhook`
- Autenticar el webhook con header `x-openwa-signature` usando HMAC
- Formato del número en DB: siempre `52XXXXXXXXXX` (sin +, con código de país)

---

## Frontend — convenciones

### Compartido entre `client` y `admin`
- Estado global: Zustand (no Redux, no Context para estado global)
- Fetching: TanStack Query (React Query v5)
- Formularios: React Hook Form + Zod para validación
- Estilos: Tailwind CSS
- Componentes UI base: shadcn/ui
- Iconos: lucide-react

### Solo `admin`
- Autenticación: `@supabase/auth-helpers-react`
- Kanban: `@dnd-kit/core` para drag-and-drop
- Realtime: cliente Supabase para actualizaciones en vivo de pedidos y mensajes

### Solo `client`
- Sin autenticación
- Seguimiento de pedido en tiempo real via Supabase Realtime (suscripción al `order_id`)
- Optimizado para móvil primero

---

## Variables de entorno — referencia rápida

```env
# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=

# DeepSeek
DEEPSEEK_API_KEY=
DEEPSEEK_API_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat

# OpenWA
OPENWA_API_URL=
OPENWA_API_KEY=
OPENWA_SESSION_ID=lavanderia-bot
OPENWA_DEV_NUMBER=5207207538100

# Redis
REDIS_URL=

# App
PORT=3100
JWT_SECRET=
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001
```

---

## Railway — configuración de servicios

Cada app necesita un `railway.json` en su raíz:

```json
// apps/api/railway.json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": { "builder": "DOCKERFILE", "dockerfilePath": "Dockerfile" },
  "deploy": { "startCommand": "node dist/main.js", "healthcheckPath": "/api/health" }
}
```

```json
// apps/client/railway.json y apps/admin/railway.json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": { "builder": "DOCKERFILE", "dockerfilePath": "Dockerfile" },
  "deploy": { "startCommand": "npx serve dist -p $PORT" }
}
```

---

## Reglas de desarrollo — seguir siempre

1. **TypeScript estricto.** Sin `any`. Sin `as unknown`. Si TypeScript se queja, resolver bien.
2. **Variables de entorno.** Nunca hardcodear credenciales, URLs ni números de teléfono. Todo via `process.env`.
3. **Validación en DTOs.** Todo input del usuario pasa por `class-validator`. Sin excepción.
4. **Manejo de errores.** Todos los endpoints retornan errores con el formato `{ error: string, statusCode: number }`. Usar filtros de excepción de NestJS.
5. **Logs.** Usar el `Logger` de NestJS, no `console.log`. Nivel `debug` en dev, `warn`/`error` en prod.
6. **CodeGraph.** Después de crear o eliminar módulos/archivos relevantes, ejecutar `codegraph update` para mantener el grafo actualizado.
7. **Migraciones.** Nunca usar `synchronize: true` en producción. Generar migraciones con TypeORM CLI.
8. **Números de WhatsApp.** Siempre almacenar y comparar en formato `52XXXXXXXXXX` (10 dígitos + código de país, sin +).
9. **Delay entre mensajes masivos.** El servicio de campañas debe esperar entre 3000ms y 8000ms (aleatorio) entre cada mensaje para evitar bloqueos de WhatsApp.
10. **Historial del agente.** Siempre pasar los últimos 10 mensajes de la conversación al contexto de DeepSeek. Nunca llamar a DeepSeek sin contexto conversacional.

---

## Estado actual del proyecto

| Área | Estado |
|------|--------|
| README y documentación | ✅ Completo |
| OPENCODE.md | ✅ Este archivo |
| Monorepo base | ⏳ Por hacer |
| Base de datos / entidades | ⏳ Por hacer |
| Backend NestJS | ⏳ Por hacer |
| OpenWA integración | ⏳ Por hacer (número dev: +52 720 753 8100) |
| Agente DeepSeek | ⏳ Por hacer |
| Panel admin | ⏳ Por hacer |
| Portal cliente | ⏳ Por hacer (espera datos del cliente) |
| Deploy Railway | ⏳ Por hacer |
| Datos reales del negocio | ⌛ Esperando respuesta del cliente |

---

## Lo que falta del cliente (no bloquea el desarrollo)

Estos datos se agregarán cuando el cliente los proporcione. Mientras tanto usar placeholders:

- Nombre real del negocio
- Catálogo de servicios con precios reales
- Horarios de atención
- Zonas de cobertura / colonias
- Número de WhatsApp definitivo de producción
- Forma de pago que manejan

Cuando lleguen estos datos: actualizar la tabla `settings` en la DB y el system prompt del agente en `apps/api/src/modules/agent/agent.service.ts`.
