# Agent Context

## Project Structure

- `apps/api` — NestJS backend (TypeORM, PostgreSQL)
- `apps/client` — React frontend (Vite, React Router)
- `apps/admin` — Admin panel (Vite, React)
- `apps/openwa` — WhatsApp service

## Railway

- **Project**: precious-perfection (ID: `286ef8a8-16d1-4707-8064-158e4c5fecf0`)
- **Environment**: production (ID: `49dc7d3e-5ee8-4726-922e-d475ce45bf5d`)
- **Services**:
  - `@lavanderia/api` (ID: `80946a22-5781-4d0b-be89-39f09bec77c0`) — API running at `https://lavanderiaapi-production.up.railway.app`
  - `@lavanderia/client` (ID: `95f286f6-f464-4e00-aa3e-df8841a53bf2`) — Client running at `https://lavanderiaclient-production.up.railway.app`
  - Postgres — PostgreSQL database

## Key Commands

### Deploy to Railway
```bash
# Deploy API
railway_deploy project_id=286ef8a8-16d1-4707-8064-158e4c5fecf0 service_id=80946a22-5781-4d0b-be89-39f09bec77c0 environment_id=49dc7d3e-5ee8-4726-922e-d475ce45bf5d

# Deploy Client
railway_deploy project_id=286ef8a8-16d1-4707-8064-158e4c5fecf0 service_id=95f286f6-f464-4e00-aa3e-df8841a53bf2 environment_id=49dc7d3e-5ee8-4726-922e-d475ce45bf5d
```

### View logs
```bash
# Build logs
railway_get_logs project_id=286ef8a8-16d1-4707-8064-158e4c5fecf0 service_id=80946a22-5781-4d0b-be89-39f09bec77c0 environment_id=49dc7d3e-5ee8-4726-922e-d475ce45bf5d log_type=build deployment_id=<ID>

# Deploy logs
railway_get_logs project_id=286ef8a8-16d1-4707-8064-158e4c5fecf0 service_id=80946a22-5781-4d0b-be89-39f09bec77c0 environment_id=49dc7d3e-5ee8-4726-922e-d475ce45bf5d log_type=deploy deployment_id=<ID>
```

### Migrations (local)
```bash
# Create migration manually (add file to apps/api/src/migrations/)
# Run migrations: set migrationsRun: true in TypeORM config (already set)
```

## Important Gotchas

- `synchronize: false` + `migrationsRun: true` — you MUST create a migration file for any entity column change
- Photon API does NOT support `lang=es` param (HTTP 400)
- ValidationPipe has `forbidNonWhitelisted: true` — DTOs must explicitly declare all fields
- `decimal(10,7)` type for lat/lng columns

## Location Picker

- Uses Leaflet + OpenStreetMap (free, no API key)
- Photon API for geocoding (free, no API key)
- San Mateo Atenco bounded via `maxBounds` and `bbox` in geocoding
- Drag marker → reverse geocode → update address field
