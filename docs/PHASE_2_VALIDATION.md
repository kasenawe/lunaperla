# Cierre de Fase 2 — Usuarios y Direcciones

Fecha de apertura: 2026-07-27
Entorno: `staging` independiente
Estado: validación local y Supabase aprobada; deploy Vercel pendiente

## Baseline

- Frontend: `8e9aca3`
- Backend: `d625999`
- Rama de preparación: `codex/pre-phase3-hardening`

## Migraciones

- [x] `supabase-phase1-users.sql` verificada en Supabase staging.
- [x] `supabase-phase2-addresses.sql` verificada en Supabase staging.
- [x] Existe un admin activo creado por bootstrap o manualmente.
- [x] El índice `uq_addresses_default_per_user` está activo.

## Pruebas automatizadas

- [x] Registro normaliza email y crea customer.
- [x] Login devuelve JWT con identidad y rol.
- [x] Token faltante o inválido devuelve `401`.
- [x] Customer recibe `403` en rutas admin.
- [x] CRUD de direcciones filtra por usuario autenticado.
- [x] Un usuario no puede modificar o eliminar direcciones ajenas.
- [x] Solo existe una dirección predeterminada por usuario.
- [x] Eliminar la predeterminada promueve otra dirección cuando existe.

Resultado local: `npm test`, typecheck y build aprobados el 2026-07-27.
CI agregado para ejecutar estas validaciones en pushes y PRs hacia `staging` y
`main`.

## Integración contra Supabase staging

- [x] Registro y login de dos clientes temporales.
- [x] CRUD de direcciones contra la base real.
- [x] Ownership cruzado rechazado.
- [x] Índice de default único rechazó un duplicado.
- [x] Eliminación de default promovió la dirección restante.
- [x] Los usuarios y direcciones temporales fueron eliminados.

Resultado: `npm run smoke:phase2:staging` aprobado el 2026-07-27.

## Smoke tests del deploy Vercel

- [ ] `GET /api/health`.
- [ ] Catálogo público y variantes.
- [ ] Login admin.
- [ ] CRUD de producto de prueba.
- [ ] Registro/login customer.
- [ ] CRUD de direcciones desde `/account/addresses`.
- [ ] Checkout guest con Mercado Pago TEST.
- [ ] Pedido por WhatsApp.
- [ ] Rutas success, failure y pending.

Bloqueo actual: los aliases escritos anteriormente en `.env.staging.example`
devuelven `DEPLOYMENT_NOT_FOUND` y no hay un URL real registrado en el
repositorio. Se requiere el alias efectivo de frontend y backend o acceso al
proyecto de Vercel para completar esta sección.

## Compatibilidad y seguridad

- [x] El checkout con direcciones guardadas permanece desactivado por defecto.
- [x] No hay service role key expuesta en frontend.
- [x] Los ejemplos de entorno no contienen secretos reales en su estado actual.
- [ ] Se rotó cualquier credencial previamente versionada.

## Rollback de Fase 2

Rollback funcional preferido:

1. Desplegar el frontend anterior a la ruta de cuenta o retirar su acceso.
2. Desplegar el backend anterior al montaje de `addressRoutes`.
3. Mantener las tablas `users` y `addresses`; no ejecutar `DROP`.
4. Conservar el admin por DB porque las rutas administrativas ya dependen de
   Fase 1.
5. Investigar y corregir en `staging` antes de promover cambios.

## Resultado

La Fase 2 solo puede marcarse como cerrada cuando todos los puntos obligatorios
estén aprobados y los resultados del deploy se registren aquí.
