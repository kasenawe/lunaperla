# Runbook de Staging - Luna Gold

Este runbook define como operar un entorno de pruebas estable para frontend y backend sin tocar produccion.

## 1. Objetivo

- Validar cambios funcionales en un entorno lo mas parecido posible a produccion.
- Evitar riesgos sobre datos reales, pagos reales y assets de produccion.

## 2. Estrategia de ramas

En ambos repos (`lunaperla` y `lunaperla-backend`):

- `main`: produccion
- `staging`: entorno de pruebas integrado
- `feature/*`: desarrollo de cambios

Flujo sugerido:

1. Crear feature desde `staging`.
2. Abrir PR hacia `staging`.
3. Validar en deploy de staging.
4. Promover `staging` a `main` cuando pase checklist.

## 3. Entornos y recursos

- `local`: frontend + backend locales, con proxy de Vite.
- `staging`: frontend y backend desplegados con base de datos/storages de staging.
- `production`: frontend y backend desplegados con recursos productivos.

Regla obligatoria:

- Staging y production no comparten proyecto de Supabase ni credenciales de Mercado Pago.

## 4. Variables de entorno requeridas

### Frontend (Vercel)

Configurar en el proyecto frontend:

- `VITE_API_BASE_URL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_STORAGE_BUCKET`
- `VITE_SUPABASE_STORAGE_PUBLIC_BASE_URL`

Referencia: [.env.staging.example](.env.staging.example)

### Backend (Vercel)

Configurar en el proyecto backend:

- `FRONTEND_URL`
- `BACKEND_URL`
- `MERCADO_PAGO_ACCESS_TOKEN` (TEST en staging)
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `INITIAL_ADMIN_EMAIL` (opcional, solo bootstrap del primer admin)
- `INITIAL_ADMIN_PASSWORD` (opcional, solo bootstrap del primer admin)
- `RESEND_API_KEY` (opcional)

Referencia: ../lunaperla-backend/.env.staging.example

## 5. Configuracion en Vercel

### Frontend

1. Asociar deploy de `main` a Production.
2. Asociar deploy de `staging` a Preview (o un proyecto dedicado staging).
3. Cargar variables de staging para Preview.
4. Cargar variables de produccion para Production.

### Backend

1. Asociar deploy de `main` a Production.
2. Asociar deploy de `staging` a Preview (o proyecto dedicado staging).
3. Cargar variables de staging para Preview.
4. Cargar variables de produccion para Production.

## 6. Supabase staging

1. Crear proyecto Supabase STG independiente.
2. Crear bucket `products` en STG.
3. Ejecutar migraciones SQL de backend en STG:
   - `supabase-setup.sql`
4. Cargar `supabase-seed.sql` si corresponde.

## 7. Smoke test obligatorio de staging

Ejecutar antes de promover a main:

1. Home carga productos desde API.
2. Login admin correcto y persistencia de sesion.
3. CRUD producto (crear/editar/eliminar).
4. CRUD categoria y coleccion.
5. Crear/editar/eliminar variante de producto.
6. Subida de imagen con signed URL y render correcto.
7. Checkout Mercado Pago en modo test.
8. Webhook actualiza estado de orden correctamente.

## 8. Criterios de promocion a produccion

Promover `staging` -> `main` solo si:

1. Smoke test completo en verde.
2. No hay errores 401/403/500 en flujos criticos.
3. Validacion visual del home y panel admin.
4. Validacion de pagos en modo test completada.

## 9. Rollback

Si falla release en produccion:

1. Revertir merge en `main`.
2. Redeploy de `main` en frontend y backend.
3. Mantener investigacion en `staging` sin bloquear produccion.
