# Fase 3 — Carrito persistente

Fecha de apertura: 2026-07-27
Rama: `codex/phase3-persistent-cart`
Entorno objetivo: `staging` independiente

## Alcance

- Carrito guest persistido en `localStorage`.
- Carrito autenticado persistido en Supabase.
- Sin fusión automática guest → usuario.
- Página `/cart`, badge y acciones de agregar, aumentar, disminuir y eliminar.
- Producto con variante opcional y cantidad entre 1 y 99.
- Flujo `Comprar ahora` preservado.

Fuera de alcance: órdenes v2, historial, stock y evolución del checkout.

## Migración

- Backend:
  `supabase/migrations/202607270300_phase3_persistent_cart.sql`.
- Tablas: `carts` y `cart_items`.
- Unicidad: un carrito activo por usuario y un ítem por
  carrito/producto/variante.
- RLS habilitado sin acceso directo para clientes; el backend opera con service
  role y valida el ownership obtenido del JWT.

## Flags

- Backend: `CART_PERSISTENT_ENABLED=false`.
- Frontend: `VITE_CART_PERSISTENT_ENABLED=false`.

Ambas se activan primero en staging después de aplicar la migración.

La migración fue aplicada en Supabase staging el 2026-07-27. Las flags se
mantienen apagadas por defecto hasta disponer de los despliegues de las ramas.

## Verificación automatizada

- [x] Autenticación requerida para `/api/cart`.
- [x] Feature flag desactivada devuelve error claro.
- [x] Un solo carrito activo por usuario.
- [x] Persistencia del carrito autenticado entre requests.
- [x] Separación entre usuarios y rechazo de ítems ajenos.
- [x] Producto con variante y sin variante.
- [x] Rechazo de cantidades inválidas, productos inexistentes y variantes
      incorrectas.
- [x] Agregar repetido incrementa cantidad.
- [x] Actualizar y eliminar recalculan totales.
- [x] Carrito guest sobrevive una recarga simulada.
- [x] Badge usa la suma de cantidades.
- [x] Typecheck y build frontend.
- [x] `supabase db push --linked --dry-run`.
- [x] `supabase db push --linked`.
- [x] Validación read-only del esquema y datos de staging.
- [x] Smoke autenticado en staging con dos usuarios temporales y limpieza final.

## Smoke manual pendiente

- [x] Aplicar migración en Supabase staging.
- [ ] Activar ambas flags en staging.
- [ ] Guest: agregar, recargar, aumentar, disminuir y eliminar.
- [ ] Login con carrito guest existente: mostrar carrito remoto sin fusionar.
- [ ] Logout: recuperar el carrito guest anterior.
- [ ] Usuario autenticado: cerrar sesión, volver a entrar y recuperar carrito.
- [ ] Dos usuarios no ven ni modifican carritos ajenos.
- [ ] Validar layout en escritorio y móvil.
- [ ] Confirmar que `Comprar ahora` abre el modal y completa el flujo legacy.

La sesión de implementación no expuso un navegador controlable. Los servidores
locales y el proxy respondieron correctamente (`/` 200, `/api/health` 200 y
`/api/cart` sin token 401), pero la revisión visual queda registrada para el
preview de los PR.

## Rollback

1. Desactivar `VITE_CART_PERSISTENT_ENABLED` en frontend staging.
2. Desactivar `CART_PERSISTENT_ENABLED` en backend staging.
3. Redesplegar ambos proyectos.
4. Conservar `carts` y `cart_items`; no ejecutar `DROP`.
