# Plan de Evolución de Arquitectura — Luna Gold Creaciones

Última actualización: 2026-07-28
Documento canónico para frontend y backend.

## 1. Objetivo

Evolucionar el ecommerce de forma incremental sobre React, Vite, Express,
Supabase y Mercado Pago, preservando los flujos existentes hasta que cada
reemplazo esté validado.

Principios:

- Additive first: agregar antes de retirar comportamiento legacy.
- Backwards compatible: catálogo, admin, checkout guest y pagos deben seguir
  operativos durante la transición.
- Una fase por vez: no iniciar una fase sin cerrar la anterior.
- Seguridad por defecto: identidad, rol y ownership se validan en backend.
- Trazabilidad: cada fase requiere migración, pruebas, resultado y rollback.

## 2. Baseline de `staging`

Baseline cerrado de Fase 3:

- Frontend `staging`: `f29f558` (merge de Fase 3).
- Backend `staging`: `6517125` (Fase 3 más migraciones productivas
  versionadas de Fases 1 y 2).
- `staging` tiene despliegue de Vercel y Supabase independientes.
- El código validado de Fases 1–3 se promovió a `main`.
- Producción todavía no tiene uso comercial.
- En Supabase producción solo están aplicadas las migraciones
  `202607270100_phase1_users.sql` y
  `202607270200_phase2_addresses.sql`.
- La migración `202607270300_phase3_persistent_cart.sql` no está aplicada en
  producción.

Estado funcional confirmado por inspección del repositorio:

| Fase | Estado | Evidencia principal |
| --- | --- | --- |
| 1. Usuarios reales | Cerrada | `users`, bcrypt, JWT, roles y baseline productivo verificado |
| 2. Direcciones | Cerrada | CRUD, ownership, dirección predeterminada y baseline productivo verificado |
| 3. Carrito persistente | Cerrada en staging, deshabilitada en producción | Tests automatizados, smoke técnico y smoke visual aprobados en staging |
| 4–6 | No iniciadas | No existen órdenes v2, historial ni stock |
| 7. Checkout evolucionado | Adelanto parcial y desactivado | Selector de dirección sin persistencia en órdenes |
| 8–12 | No iniciadas formalmente | Mejoras futuras |

Estado formal actual:

> Fases 1, 2 y 3 cerradas y validadas en staging. El código se promovió a
> producción, pero el carrito persistente permanece deshabilitado y sin su
> migración productiva. La Fase 4 no está iniciada.

## 3. Trabajo adelantado del checkout

El frontend contiene una selección de direcciones guardadas y el backend acepta
`shippingAddress` en el payload de pago. Sin embargo, la tabla legacy `orders` y
`saveOrder()` no persisten ese snapshot.

Hasta completar las Fases 4 y 7:

- La funcionalidad queda detrás de
  `VITE_CHECKOUT_SAVED_ADDRESSES_ENABLED`.
- El valor por defecto es `false`.
- Activarla no convierte la Fase 7 en completa.
- No se debe comunicar que la dirección quedó asociada a la orden mientras no
  exista persistencia verificable.

## 4. Modelo objetivo

### Identidad

- `users`
- `addresses`

### Carrito

- `carts`
- `cart_items`

### Órdenes

- `orders` evolucionada como cabecera
- `order_items` con snapshots de nombre, variante y precio

### Inventario

- `products.stock`
- `reserved_stock` queda pospuesto

## 5. Plan por fases

### Fase 1 — Sistema de usuarios reales

Estado: cerrada y promovida a `main`.

Incluye:

- Registro y login por email.
- Password hash con bcrypt.
- JWT con `sub`, `id`, `email` y `role`.
- Perfil autenticado.
- Rutas admin protegidas por rol.

Criterios de cierre:

- Customer no accede a rutas admin.
- Token inválido o vencido devuelve `401`.
- Catálogo y pagos públicos no regresionan.

### Fase 2 — Direcciones de cliente

Estado: cerrada, validada en staging y promovida a `main`.

Incluye:

- Múltiples direcciones por usuario.
- Una dirección predeterminada como máximo.
- CRUD autenticado.
- Ownership por `user_id` obtenido del JWT.
- Área `/account/addresses`.

Criterios de cierre:

- Migraciones verificadas en Supabase staging.
- Un usuario no puede operar direcciones ajenas.
- La primera dirección queda como predeterminada.
- Cambiar o eliminar la predeterminada mantiene una sola dirección default.
- Smoke tests de catálogo, admin y checkout guest aprobados.
- Resultado y rollback documentados.

### Fase 3 — Carrito persistente

Estado: cerrada y validada en staging. El código está promovido a `main`, pero
en producción permanece deshabilitada: no se aplicó
`202607270300_phase3_persistent_cart.sql` y las flags
`CART_PERSISTENT_ENABLED` y `VITE_CART_PERSISTENT_ENABLED` están ausentes o en
`false`.

Decisiones aprobadas:

- Guest cart en `localStorage`.
- User cart en Supabase.
- Sin merge automático guest → user.
- Comprar ahora continúa operativo.

Modelo:

- `carts`: un carrito activo por usuario.
- `cart_items`: producto, variante opcional y cantidad mayor que cero.
- Unicidad por carrito, producto y variante.

Endpoints:

- `GET /api/cart`
- `POST /api/cart/items`
- `PUT /api/cart/items/:id`
- `DELETE /api/cart/items/:id`

Frontend:

- Página de carrito.
- Badge de cantidad.
- Agregar, actualizar y eliminar items.
- Dos adaptadores de persistencia: local y API.

Criterios de cierre:

- Carrito autenticado persiste entre sesiones.
- Carrito guest persiste en el navegador.
- Ownership validado en backend.
- Producto y variante se revalidan server-side.
- Flujo Comprar ahora no regresa.

### Fase 4 — Órdenes con snapshot inmutable

Estado: no iniciada.

- Crear `order_items`.
- Evolucionar `orders` sin retirar columnas legacy.
- Crear la orden antes de redirigir a Mercado Pago.
- Guardar snapshots de producto, variante, precio y dirección.
- Usar idempotencia por referencia externa o preferencia.

### Fase 5 — Historial de compras

Estado: no iniciada.

- `GET /api/orders`
- `GET /api/orders/:id`
- Customer ve solo sus órdenes.
- Admin puede consultar todas con filtros y paginación.
- Nueva ruta `/account/orders`.

### Fase 6 — Inventario inicial

Estado: no iniciada.

- Agregar `products.stock`.
- Constraint `stock >= 0`.
- Revalidación atómica en checkout.
- Edición y visualización de stock en admin.
- No implementar todavía `reserved_stock`.

### Fase 7 — Evolución del checkout

Estado: adelanto parcial desactivado.

- Checkout autenticado usa direcciones guardadas.
- Checkout guest permanece operativo.
- Orden, dirección y usuario quedan enlazados.
- La lógica se concentra en un único orquestador de checkout.

### Fase 8 — Mejoras de administración

- Usuarios, órdenes, inventario, direcciones y estadísticas.
- Filtros, búsqueda y paginación server-side.

### Fase 9 — Buenas prácticas de base de datos

- Consolidar FKs, constraints, índices y triggers.
- Evitar pérdida histórica.
- Revisar políticas y accesos directos a Supabase.

### Fase 10 — Calidad de código

- Backend por controllers, services y repositories.
- Validación y errores centralizados.
- Servicios frontend por dominio.
- Pruebas de regresión por módulo.

### Fase 11 — Seguridad

- Validación estricta de inputs.
- Expiración y rotación JWT.
- Revisión de ownership.
- Rate limiting y protección de endpoints sensibles.
- Secretos fuera del repositorio y rotación ante exposición.

### Fase 12 — Documentación

- README frontend y backend completos.
- Manuales admin y customer.
- Setup local, staging y producción.
- Operación, monitoreo y mantenimiento.

## 6. Convención de migraciones

- Los scripts históricos de Fases 1 y 2 se mantienen en su ubicación actual.
- El baseline se registra en `lunaperla-backend/supabase/migrations/README.md`.
- Las migraciones nuevas usan:
  `YYYYMMDDHHMM_descripcion.sql`.
- Cada migración debe ser additive e idempotente cuando sea viable.
- No realizar `DROP` o renames destructivos dentro de una fase funcional.

## 7. Feature flags

Flags actuales o previstas:

- `VITE_CHECKOUT_SAVED_ADDRESSES_ENABLED`
- `CART_PERSISTENT_ENABLED` en backend
- `VITE_CART_PERSISTENT_ENABLED` en frontend
- `ORDERS_V2_ENABLED`
- `INVENTORY_STOCK_ENABLED`

Reglas:

- El valor por defecto es desactivado.
- El backend mantiene compatibilidad mientras la flag está apagada.
- La activación ocurre primero en staging.
- El rollback funcional consiste en desactivar la flag.

## 8. Flujo de entrega

1. Crear feature branch desde `staging`.
2. Definir alcance y checklist.
3. Preparar migración y rollback.
4. Implementar backend compatible.
5. Implementar frontend detrás de flag cuando aplique.
6. Ejecutar tests y build locales.
7. Integrar y desplegar en staging.
8. Ejecutar smoke tests.
9. Documentar resultado.
10. Cerrar la fase antes de iniciar la siguiente.

## 9. Definition of Done

Una fase se considera cerrada solo cuando:

- Migraciones aplicadas y verificadas en staging.
- Endpoints y UI operativos.
- Tests automatizados relevantes aprobados.
- Smoke tests de regresión aprobados.
- Seguridad y ownership validados.
- Documentación actualizada.
- Rollback documentado.
- No quedan dependencias ocultas de fases posteriores.

## 10. Pausa y próximo paso

Luna Perla queda pausado en este baseline limpio para priorizar PSICOAPOYO. No
iniciar la Fase 4 durante la pausa.

Al retomar, la siguiente operación es la activación productiva controlada de la
Fase 3:

1. Confirmar nuevamente backups, variables y conectividad.
2. Aplicar `202607270300_phase3_persistent_cart.sql` en Supabase producción.
3. Validar esquema, RLS, ownership y ausencia de cambios en datos existentes.
4. Habilitar primero `CART_PERSISTENT_ENABLED` y después
   `VITE_CART_PERSISTENT_ENABLED`.
5. Ejecutar smoke productivo completo y documentar el rollback.
