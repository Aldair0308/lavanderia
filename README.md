# 🧺 LavanderiaOS

> Sistema completo de administración para lavanderías — desde la experiencia del cliente hasta la gestión interna, automatización de WhatsApp y retención de clientes con inteligencia.

---

## 📋 Tabla de Contenidos

- [Visión General](#visión-general)
- [Módulos del Sistema](#módulos-del-sistema)
- [Tech Stack](#tech-stack)
- [Arquitectura](#arquitectura)
- [Funcionalidades por Módulo](#funcionalidades-por-módulo)
  - [Portal del Cliente](#-portal-del-cliente)
  - [Agente de WhatsApp](#-agente-de-whatsapp)
  - [Panel de Administración](#-panel-de-administración)
  - [CRM & Retención de Clientes](#-crm--retención-de-clientes)
- [Base de Datos](#base-de-datos)
- [Integraciones](#integraciones)
- [Instalación y Despliegue](#instalación-y-despliegue)
- [Variables de Entorno](#variables-de-entorno)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Entorno de Desarrollo con CodeGraph](#entorno-de-desarrollo-con-codegraph)
- [Roadmap](#roadmap)

---

## Visión General

**LavanderiaOS** es una plataforma full-stack diseñada específicamente para lavanderías que quieren digitalizar su operación completa. El sistema cubre tres frentes principales:

1. **Experiencia del cliente** — Una página pública simple e intuitiva donde los clientes pueden solicitar recolección de ropa, especificar la cantidad y tipo de prendas, y hacer seguimiento de su pedido.

2. **Automatización de WhatsApp** — Un agente inteligente que responde preguntas frecuentes, confirma pedidos y notifica estados automáticamente, reduciendo drásticamente el tiempo que el personal dedica a contestar mensajes.

3. **Administración y CRM** — Un panel interno completo para gestionar pedidos, clientes, pagos y una herramienta de retención que identifica clientes inactivos para enviarles promociones personalizadas.

---

## Módulos del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                        LavanderiaOS                         │
├──────────────────┬──────────────────┬───────────────────────┤
│  Portal Cliente  │  Agente WhatsApp │   Panel de Admin      │
│  (React Public)  │   (OpenWA)       │   (React Dashboard)   │
├──────────────────┴──────────────────┴───────────────────────┤
│                    API Backend (NestJS)                      │
├─────────────────────────────────────────────────────────────┤
│                  Base de Datos (Supabase / PostgreSQL)       │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Capa | Tecnología | Descripción |
|------|-----------|-------------|
| **Frontend** | React + Vite | Portal del cliente y panel de administración |
| **Backend** | NestJS (Node.js) | API REST con arquitectura modular |
| **Base de Datos** | Supabase (PostgreSQL) | DB principal + autenticación + realtime |
| **ORM** | TypeORM | Modelos y migraciones de base de datos |
| **WhatsApp** | OpenWA | API Gateway de WhatsApp self-hosted |
| **Agente IA** | DeepSeek API | Procesamiento inteligente de mensajes (bajo costo) |
| **Storage** | Supabase Storage | Imágenes de pedidos, comprobantes |
| **Cache** | Redis | Sesiones, colas de mensajes |
| **Despliegue** | Railway | Hosting cloud con deploy automático desde GitHub |
| **Contenedores** | Docker | Build de servicios para Railway |

---

## Arquitectura

### Flujo del Agente de WhatsApp

```
Cliente envía mensaje
        │
        ▼
   OpenWA Gateway
   (recibe mensaje)
        │
        ▼
  Webhook → NestJS
  (procesamiento)
        │
        ├─── ¿Es pregunta frecuente? ──► Respuesta automática
        │
        ├─── ¿Es nuevo pedido? ──────── Registrar en DB + confirmar
        │
        ├─── ¿Consulta de estado? ───── Buscar pedido + responder
        │
        └─── ¿Consulta compleja? ────── DeepSeek API → Respuesta IA
                                              │
                                              ▼
                                     OpenWA REST API
                                     (envía respuesta)
```

### Flujo de Pedido del Cliente

```
Cliente visita portal público
        │
        ▼
Llena formulario de solicitud
(dirección, cantidad de ropa, tipo, notas)
        │
        ▼
  NestJS crea el pedido
  Estado: PENDIENTE
        │
        ▼
Notificación al admin (Dashboard)
+ Mensaje de confirmación al cliente (WhatsApp)
        │
        ▼
Admin asigna repartidor → RECOLECTANDO
        │
        ▼
Ropa en lavandería → EN_PROCESO
        │
        ▼
Listo para entrega → LISTO
        │
        ▼
Entregado → COMPLETADO ✓
```

---

## Funcionalidades por Módulo

### 🌐 Portal del Cliente

Página pública, sin necesidad de registro, diseñada para ser rápida y fácil en móvil.

**Solicitud de recolección:**
- Formulario de solicitud con nombre, dirección, número de WhatsApp
- Selección de tipo de servicio (lavado normal, lavado delicado, planchado, etc.)
- Estimación de cantidad de ropa (piezas o kilogramos)
- Campo de notas especiales (prendas delicadas, instrucciones, etc.)
- Selección de fecha y hora aproximada de recolección
- Confirmación inmediata por WhatsApp al enviar

**Seguimiento de pedido:**
- URL única por pedido para consultar el estado en tiempo real
- Timeline visual del proceso: Solicitado → Recolectado → En proceso → Listo → Entregado

**Información general:**
- Catálogo de servicios con precios
- Tiempo estimado de entrega
- Preguntas frecuentes
- Número de WhatsApp directo para contacto

---

### 💬 Agente de WhatsApp

Powered by **OpenWA** + **DeepSeek API**. Reduce el tiempo de atención manual al mínimo.

**Respuestas automáticas:**
- Saludo inicial y menú de opciones al primer contacto
- Respuesta a preguntas frecuentes (precios, horarios, tiempos de entrega)
- Confirmación automática de pedidos creados desde el portal
- Notificaciones de cambio de estado del pedido
- Confirmación de recolección y entrega

**Acciones vía WhatsApp:**
- Cliente puede solicitar recolección directamente por mensaje
- Consulta de estado de pedido activo con solo escribir "mi pedido"
- Solicitar resumen de servicios

**Escalamiento a humano:**
- Cuando el agente no puede resolver la consulta, notifica al administrador en el dashboard
- El admin puede tomar el control del chat manualmente desde el panel

**Campañas salientes:**
- Envío de mensajes de promoción a segmentos de clientes (gestionado desde el panel admin)
- Recordatorios a clientes con pedidos listos para recoger

---

### 🎭 Filosofía de Comunicación: El Agente Habla como Persona

Este es uno de los pilares más importantes del sistema. El agente **no debe parecer un bot**. El objetivo es que los clientes sientan que hay una persona real del otro lado respondiendo con naturalidad y atención.

#### Principios de escritura

**1. Respuestas cortas y directas**
Un humano que atiende WhatsApp no escribe párrafos. Va al grano.

```
❌ MAL — Respuesta de bot típica:
"¡Hola! Bienvenido/a a LavanderiaX 🎉🧺 Estamos muy contentos de atenderte.
Somos tu mejor opción en lavandería. Puedes elegir entre las siguientes opciones:
1️⃣ Ver precios  2️⃣ Hacer un pedido  3️⃣ Ver estado  4️⃣ Hablar con alguien"

✅ BIEN — Natural y humano:
"Hola, ¿en qué te puedo ayudar?"
```

**2. Emojis: mínimos y con propósito**
Solo cuando refuerzan el mensaje. Nunca decorativos ni en exceso.

```
❌ MAL: "Tu ropa está lista 🎉✨👕👗🧺 ¡Pasa a recogerla cuando quieras! 😊🙌"
✅ BIEN: "Tu ropa ya está lista, puedes pasar a recogerla."
```

**3. Tono cálido pero sin exagerar**
Amable como quien conoce al cliente, no efusivo como un anuncio.

```
❌ MAL: "¡Perfecto! ¡Con mucho gusto te ayudamos! ¡Somos los mejores!"
✅ BIEN: "Claro, ahorita te reviso."
```

**4. Confirmaciones concretas, sin relleno**

```
❌ MAL: "¡Tu pedido ha sido registrado exitosamente en nuestro sistema!
         En breve nos pondremos en contacto contigo para coordinar la recolección.
         Gracias por elegirnos 🙏"

✅ BIEN: "Listo, quedó registrado tu pedido. Pasamos por tu ropa el [fecha]
          entre [hora]. Cualquier cosa me avisas."
```

**5. Errores y aclaraciones sin frases robóticas**

```
❌ MAL: "Lo siento, no pude entender tu mensaje. Por favor selecciona
         una de las opciones del menú."

✅ BIEN: "No te entendí bien, ¿me puedes decir qué necesitas?"
```

#### Ejemplos de conversaciones completas

**Consulta de precios:**
```
Cliente:  "Buenas, ¿cuánto cobran por kilo?"
Agente:   "Hola, el lavado normal está en $X el kilo.
           ¿Sería para recoger a domicilio o traes la ropa?"
```

**Solicitud de recolección:**
```
Cliente:  "Quiero que pasen por mi ropa"
Agente:   "Con gusto. ¿Cuál es tu dirección y para cuándo la necesitas?"
Cliente:  "Calle Hidalgo 45, para el jueves"
Agente:   "Perfecto. Pasamos el jueves en la mañana, te avisamos antes de salir."
```

**Seguimiento de pedido:**
```
Cliente:  "Oye, ¿ya está mi ropa?"
Agente:   "Déjame revisar... Tu pedido está en proceso, queda listo
           mañana por la tarde. ¿Te la llevamos o pasas por ella?"
```

**Campaña de reactivación:**
```
Agente:   "Hola [nombre], hace tiempo que no te vemos por aquí.
           Esta semana tenemos 15% de descuento si quieres aprovechar.
           ¿Te ayudo a agendar una recolección?"
```

#### Cómo se logra esto técnicamente

El system prompt de DeepSeek define estrictamente la personalidad y reglas del agente. Los puntos clave del prompt:

```
- Responde siempre en español mexicano informal pero respetuoso
- Máximo 2-3 líneas por respuesta, salvo que el cliente pida información detallada
- No uses listas numeradas ni bullets en WhatsApp
- Usa emojis solo si el cliente los usa primero, y con moderación
- Nunca digas "como IA" ni menciones que eres un sistema automatizado
- Si no sabes algo, di "déjame revisar" y escala al humano
- Usa el nombre del cliente cuando lo tienes, pero no en cada mensaje
- Evita palabras como "perfecto", "excelente", "con mucho gusto" en exceso
- El tono es: alguien del negocio que conoce a sus clientes de confianza
```

---

### 🖥️ Panel de Administración

Dashboard completo para el dueño y personal de la lavandería.

**Gestión de pedidos:**
- Vista tipo Kanban con columnas por estado del pedido
- Detalle de cada pedido (cliente, ropa, notas, historial de estados)
- Actualización de estado con un clic (notifica al cliente automáticamente por WhatsApp)
- Filtros por fecha, estado, servicio, cliente

**Gestión de clientes:**
- Directorio completo de clientes con historial de pedidos
- Perfil de cliente: nombre, WhatsApp, dirección, fecha de registro, total gastado
- Etiquetas personalizadas (VIP, frecuente, inactivo, etc.)

**Agente de WhatsApp (control manual):**
- Bandeja de conversaciones activas
- Posibilidad de responder manualmente cuando el agente escala
- Toggle para activar/desactivar el auto-responder por conversación
- Historial de todos los mensajes

**Reportes:**
- Pedidos por día / semana / mes
- Ingresos y servicios más solicitados
- Clientes nuevos vs recurrentes
- Tasa de retención

---

### 🎯 CRM & Retención de Clientes

Módulo estratégico para recuperar y fidelizar clientes.

**Detección de inactividad:**
- Listado automático de clientes que no han pedido en X días (configurable: 7, 14, 30 días)
- Vista de "clientes en riesgo" con su último pedido y valor histórico
- Segmentación por frecuencia de compra (frecuente, ocasional, inactivo)

**Campañas de reactivación:**
- Creación de mensajes de campaña personalizables con variables (nombre del cliente, último servicio, etc.)
- Envío masivo por WhatsApp a un segmento seleccionado via OpenWA
- Programación de envío (enviar ahora o en fecha/hora específica)
- Seguimiento de respuestas a la campaña

**Ejemplo de flujo:**
```
El admin filtra: clientes sin pedido en los últimos 30 días (15 clientes)
           │
           ▼
Crea mensaje: "Hola {nombre}, te extrañamos en LavanderiaX 🧺
              Esta semana tienes 20% de descuento en tu próximo pedido.
              ¡Escríbenos para agendarlo!"
           │
           ▼
Selecciona destinatarios → Enviar campaña
           │
           ▼
OpenWA envía los mensajes → Respuestas llegan al agente
```

---

## Base de Datos

Hospedada en **Supabase** (PostgreSQL). Principales entidades:

### Tablas Principales

```sql
-- Clientes
customers (id, name, phone_whatsapp, address, email, created_at, last_order_at)

-- Pedidos
orders (id, customer_id, status, service_type, quantity_kg, notes, 
        pickup_address, pickup_scheduled_at, delivered_at, total_price, created_at)

-- Items del pedido
order_items (id, order_id, item_type, quantity, price_per_unit)

-- Mensajes de WhatsApp (log)
whatsapp_messages (id, customer_id, direction, content, timestamp, is_automated)

-- Campañas de reactivación
campaigns (id, name, message_template, target_segment, sent_at, status)

-- Destinatarios de campaña
campaign_recipients (id, campaign_id, customer_id, sent_at, response_received)

-- Configuración del sistema
settings (key, value) -- precios, tiempos de entrega, mensajes automáticos, etc.
```

---

## Integraciones

| Integración | Propósito |
|-------------|-----------|
| **OpenWA** | API Gateway de WhatsApp (self-hosted) |
| **DeepSeek API** | Procesamiento inteligente de mensajes complejos (muy bajo costo) |
| **Supabase** | Base de datos, auth, storage y realtime |
| **Redis** | Cola de mensajes salientes y cache |

---

## 💸 Estimación de Costos (Producción)

Una de las prioridades del proyecto es mantener el costo operativo al mínimo. Aquí el desglose mensual estimado:

| Servicio | Plan / Uso estimado | Costo/mes |
|----------|-------------------|-----------|
| **Supabase** | Free tier (hasta 500MB DB, 1GB storage) | $0 |
| **Supabase** | Pro tier si se necesita más capacidad | $25 |
| **Railway** | Hobby Plan — NestJS + OpenWA + Redis | ~$5–$15 |
| **DeepSeek API** | ~500K tokens/mes (uso moderado del agente) | ~$0.50 |
| **DeepSeek API** | ~2M tokens/mes (uso intensivo) | ~$2.00 |
| **Total estimado** | **Operación mensual completa** | **~$5–$20** |

> 💡 **Por qué DeepSeek:** Su modelo `deepseek-chat` tiene un rendimiento comparable a GPT-4 para tareas de atención al cliente, a una fracción del precio. Costo de entrada: ~$0.014 por millón de tokens de entrada, ~$0.28 por millón de tokens de salida.

> 💡 **Por qué Railway:** Permite desplegar múltiples servicios (NestJS API, OpenWA, Redis) desde el mismo repositorio de GitHub con cero configuración de servidores. SSL automático, dominios custom, y escalado sin esfuerzo. El Hobby Plan (~$5/mes base + uso) es más que suficiente para una lavandería en etapa inicial.

---



## 🚀 Instalación y Despliegue

### Arquitectura en Railway

Cada servicio se despliega como un **Railway Service** independiente dentro del mismo proyecto:

```
Railway Project: lavanderia-os
├── api          → NestJS Backend        (lavanderia-api.railway.app)
├── client       → React Portal Cliente  (lavanderia.railway.app)
├── admin        → React Panel Admin     (admin-lavanderia.railway.app)
├── openwa       → OpenWA Gateway        (openwa-lavanderia.railway.app)
└── redis        → Redis (plugin Railway) (interno)
```

> La base de datos vive en **Supabase** (externo a Railway). SSL y dominios custom son automáticos en Railway.

### Requisitos previos
- Cuenta en [Railway](https://railway.app)
- Cuenta en [Supabase](https://supabase.com)
- API Key de DeepSeek
- Número de WhatsApp dedicado para el negocio
  - **Desarrollo:** +52 720 753 8100 (número provisional)
  - **Producción:** número definitivo de la lavandería (pendiente)
- Node.js 22+ (solo para desarrollo local)

### Deploy en Railway

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-org/lavanderia-os.git
cd lavanderia-os

# 2. Instalar Railway CLI
npm install -g @railway/cli

# 3. Login y vincular proyecto
railway login
railway link

# 4. Configurar variables de entorno en Railway Dashboard
#    (ver sección Variables de Entorno)

# 5. Deploy
railway up
```

### Desarrollo local

```bash
# Copiar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Instalar dependencias
npm install

# Levantar en modo desarrollo
docker compose -f docker-compose.dev.yml up -d

# El sistema estará disponible en:
# Portal cliente:   http://localhost:3000
# Panel admin:      http://localhost:3001
# API (NestJS):     http://localhost:3100/api
# API Docs:         http://localhost:3100/api/docs
# OpenWA Dashboard: http://localhost:2886
# OpenWA API:       http://localhost:2785/api
```

---

## Variables de Entorno

Estas variables se configuran en el **Railway Dashboard** (por servicio) y en `.env` para desarrollo local:

```env
# Base de Datos (Supabase)
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
DATABASE_URL=postgresql://...

# DeepSeek (Agente IA)
DEEPSEEK_API_KEY=sk-...
DEEPSEEK_API_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat

# OpenWA
OPENWA_API_URL=https://openwa-lavanderia.railway.app/api  # prod
# OPENWA_API_URL=http://localhost:2785/api                # dev
OPENWA_API_KEY=...
OPENWA_SESSION_ID=lavanderia-bot
OPENWA_DEV_NUMBER=5207207538100   # Número provisional de desarrollo (MX)

# Redis (Railway plugin — la URL la genera Railway automáticamente)
REDIS_URL=${{Redis.REDIS_URL}}

# App
PORT=3100
JWT_SECRET=...
NODE_ENV=production
FRONTEND_URL=https://lavanderia.railway.app
ADMIN_URL=https://admin-lavanderia.railway.app
```

---

## Estructura del Proyecto

```
lavanderia-os/
├── apps/
│   ├── api/                        # Backend NestJS → Railway Service: api
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── orders/         # Gestión de pedidos
│   │   │   │   ├── customers/      # Gestión de clientes / CRM
│   │   │   │   ├── whatsapp/       # Integración OpenWA + agente DeepSeek
│   │   │   │   ├── campaigns/      # Campañas de reactivación
│   │   │   │   ├── auth/           # Autenticación (Supabase Auth)
│   │   │   │   └── settings/       # Configuración del sistema
│   │   │   └── main.ts
│   │   ├── Dockerfile
│   │   └── railway.json            # Configuración de deploy Railway
│   │
│   ├── client/                     # Portal público → Railway Service: client
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   │   ├── Home.tsx        # Landing + formulario de solicitud
│   │   │   │   ├── OrderStatus.tsx # Seguimiento de pedido
│   │   │   │   └── Services.tsx    # Catálogo de servicios
│   │   │   └── main.tsx
│   │   ├── Dockerfile
│   │   └── railway.json
│   │
│   └── admin/                      # Panel admin → Railway Service: admin
│       ├── src/
│       │   ├── pages/
│       │   │   ├── Dashboard.tsx   # Vista general
│       │   │   ├── Orders.tsx      # Kanban de pedidos
│       │   │   ├── Customers.tsx   # Directorio de clientes
│       │   │   ├── WhatsApp.tsx    # Bandeja de mensajes
│       │   │   ├── Campaigns.tsx   # CRM y campañas
│       │   │   └── Reports.tsx     # Reportes
│       │   └── main.tsx
│       ├── Dockerfile
│       └── railway.json
│
├── openwa/                         # OpenWA Gateway → Railway Service: openwa
│   ├── docker-compose.yml          # Config local de OpenWA
│   └── railway.json
│
├── railway.json                    # Config raíz del proyecto Railway
├── docker-compose.dev.yml          # Entorno de desarrollo local completo
└── .env.example
```

---

## 🧠 Entorno de Desarrollo con CodeGraph

Este proyecto usa **[CodeGraph](https://www.npmjs.com/package/@colbymchenry/codegraph)** junto con **opencode** para acelerar el desarrollo. CodeGraph genera un grafo del repositorio que permite al agente de IA entender la estructura del código al instante, sin necesidad de leer archivo por archivo — lo que se traduce en sugerencias más precisas, refactors más seguros y navegación más rápida en un monorepo como este.

### Instalación

```bash
# Global (recomendado) o como dependencia de desarrollo
npm install -g @colbymchenry/codegraph
# o:
npm install -D @colbymchenry/codegraph
```

### Configuración inicial (una sola vez)

```bash
# 1. Configurar el agente — selecciona "opencode" cuando lo pida
npx @colbymchenry/codegraph

# 2. Reiniciar opencode
#    (cierra la terminal/ventana y ábrela de nuevo)

# 3. Inicializar el grafo en la raíz del proyecto
cd /ruta/a/lavanderia-os
codegraph init -i

# 4. Verificar que todo quedó correctamente
codegraph status
```

### Uso en el día a día

Cada vez que se agreguen módulos nuevos o se hagan cambios estructurales importantes, actualiza el grafo para que opencode siga teniendo contexto preciso:

```bash
codegraph update
```

> Con este setup, opencode puede navegar el monorepo completo (`apps/api`, `apps/client`, `apps/admin`) con contexto total, lo que hace que las sugerencias de código sean mucho más relevantes y alineadas con la arquitectura del proyecto.

---



### v1.0 — MVP
- [x] Arquitectura base (NestJS + React + Supabase)
- [ ] Portal del cliente con formulario de solicitud
- [ ] Panel de administración con gestión de pedidos (Kanban)
- [ ] Integración OpenWA básica (confirmaciones automáticas)
- [ ] Notificaciones de estado por WhatsApp

### v1.1 — Agente Inteligente
- [ ] Integración DeepSeek API para respuestas conversacionales
- [ ] Solicitud de recolección vía WhatsApp
- [ ] Consulta de estado vía WhatsApp ("mi pedido")
- [ ] Escalamiento a humano desde el dashboard

### v1.2 — CRM & Retención
- [ ] Módulo de detección de clientes inactivos
- [ ] Creación y envío de campañas de reactivación
- [ ] Segmentación de clientes
- [ ] Seguimiento de respuestas a campañas

### v1.3 — Reportes y Optimización
- [ ] Dashboard de reportes con gráficas
- [ ] Exportación de datos
- [ ] Programación de campañas
- [ ] App móvil para repartidores (PWA)

---

## Licencia

MIT — Libre para uso personal y comercial.

---

> Construido con ❤️ para digitalizar y hacer crecer tu lavandería.
