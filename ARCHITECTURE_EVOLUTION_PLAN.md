# Architecture Evolution Plan - Luna Gold Creaciones

## 1. Objetivo

Evolucionar la arquitectura actual de Luna Gold Creaciones hacia un ecommerce maduro y escalable, preservando la funcionalidad existente y aplicando una estrategia incremental.

Principios rectores:

- Additive first: primero agregar capacidades nuevas, luego retirar legacy cuando esté validado.
- Backwards compatible: mantener comportamiento actual en cada fase.
- Una fase por vez: no comenzar Fase N+1 sin cerrar y verificar Fase N.
- No reemplazar arquitectura actual: evolucionar sobre React + Vite + Express + Supabase + Mercado Pago.

## 2. Estado Base (Actual)

Frontend:

- React 19 + TypeScript + Vite + Tailwind.
- Catálogo dinámico por categorías/colecciones.
- Checkout con Mercado Pago y flujos alternativos por WhatsApp.
- Admin panel para productos, variantes, categorías y colecciones.
- Auth admin con JWT basado en endpoint de login actual.

Backend:

- Express modular con rutas separadas.
- Supabase PostgreSQL + Storage para imágenes.
- CRUD de catálogo, variantes y endpoints de pago/webhook.
- Órdenes persistidas en tabla orders existente.

Base de datos actual principal:

- products
- product_variants
- categories
- collections
- orders (modelo legado single-item)

## 3. Modelo de Datos Final Objetivo

Nota: este es el modelo objetivo al finalizar la evolución. Su adopción será gradual por fases.

### 3.1 Entidades de Identidad y Cliente

users

- id (uuid pk)
- email (text unique, not null) -> identificador único de login
- password_hash (text, not null)
- first_name (text)
- last_name (text)
- phone (text)
- role (text, not null, default 'customer')
- active (boolean, not null, default true)
- created_at (timestamptz)
- updated_at (timestamptz)

addresses

- id (uuid pk)
- user_id (uuid fk -> users.id)
- label (text)
- recipient_name (text, not null)
- phone (text, not null)
- street (text, not null)
- number (text, not null)
- apartment (text)
- city (text, not null)
- state (text)
- postal_code (text)
- country (text, not null)
- is_default (boolean, not null, default false)
- created_at (timestamptz)
- updated_at (timestamptz)

### 3.2 Carrito

carts

- id (uuid pk)
- user_id (uuid unique fk -> users.id) -> un carrito activo por usuario
- created_at (timestamptz)
- updated_at (timestamptz)

cart_items

- id (uuid pk)
- cart_id (uuid fk -> carts.id)
- product_id (uuid fk -> products.id)
- variant_id (uuid fk -> product_variants.id, nullable)
- quantity (integer not null check > 0)
- created_at (timestamptz)
- updated_at (timestamptz)

### 3.3 Órdenes (Evolucionadas)

orders (evolución de tabla existente)

- id (text/uuid pk según compatibilidad definida en migración)
- user_id (uuid fk -> users.id, nullable para guest)
- address_id (uuid fk -> addresses.id, nullable para guest o flujos antiguos)
- payment_method (text)
- payment_status (text)
- order_status (text)
- subtotal (numeric)
- shipping_cost (numeric)
- total (numeric)
- mercadopago_payment_id (text)
- mercadopago_preference_id (text)
- created_at (timestamptz)
- updated_at (timestamptz)
- columnas legacy previas (mantenidas durante transición)

order_items

- id (uuid pk)
- order_id (fk -> orders.id)
- product_id (uuid fk -> products.id, nullable para no bloquear historial)
- variant_id (uuid fk -> product_variants.id, nullable)
- quantity (integer not null)
- product_name (text, not null) -> snapshot explícito
- variant_name (text, nullable) -> snapshot explícito
- unit_price (numeric, not null) -> snapshot explícito

### 3.4 Inventario (Ajustado)

products (extensión)

- stock (integer not null default 0)

Nota:

- reserved_stock queda pospuesto para fase posterior.
- control inicial solo con stock.

## 4. Estrategia de Migraciones por Fase

Convención propuesta:

- Crear carpeta de migraciones versionadas en backend (ej: supabase/migrations).
- Nombrado sugerido: YYYYMMDDHHMM\_<descripcion>.sql.
- Cada script idempotente cuando sea viable.

## 5. Plan por Fase

## Fase 1 - Sistema de Usuarios Reales

Objetivo:

- Reemplazar login hardcoded por usuarios en DB.
- Usar email como login único (sin username).

Migraciones DB:

- Crear users.
- Índice único en users.email.
- Check de role en ('admin','customer').
- Trigger updated_at para users.

Endpoints:

- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- PUT /api/auth/profile

Middleware:

- authenticate()
- authorize(role)

Compatibilidad:

- Mantener contratos existentes de rutas de catálogo y pagos.
- Proteger rutas admin por rol=admin sin alterar payload funcional de catálogo.

Cambios frontend:

- Adaptar servicio auth admin para login por email/password.
- Mantener persistencia de token en localStorage mientras se migra UX.
- No introducir aún UI de registro customer en frontend público salvo que se decida explícitamente.

Criterios de aceptación:

- Login funciona con email + password hash bcrypt.
- JWT sub = user.id.
- JWT payload incluye id, email, role.
- Rutas admin deniegan acceso a role=customer.
- Rutas públicas no regresionan.

Riesgos:

- Lockout administrativo si no existe usuario admin seed.
- Tokens legacy incompatibles.

Mitigación:

- Migración con seed inicial de admin.
- Ventana de transición controlada para rotación de credenciales.

## Fase 2 - Direcciones de Cliente

Objetivo:

- Permitir múltiples direcciones por usuario y una dirección default.

Migraciones DB:

- Crear addresses con FK user_id.
- Índices por user_id, is_default.
- Regla para máximo una default activa por usuario (índice parcial único o validación transaccional).
- Trigger updated_at para addresses.

Endpoints:

- GET /api/addresses
- POST /api/addresses
- PUT /api/addresses/:id
- DELETE /api/addresses/:id
- PUT /api/addresses/:id/default

Compatibilidad:

- Checkout guest se mantiene intacto.

Cambios frontend:

- Páginas/formularios de direcciones en área de cuenta.
- Selector de dirección default.

Criterios de aceptación:

- Usuario autenticado administra solo sus direcciones.
- Una sola dirección default por usuario.

Riesgos:

- Acceso cruzado de direcciones por mala validación de ownership.

Mitigación:

- Filtros por user_id en queries + chequeo server-side estricto.

## Fase 3 - Carrito Persistente

Objetivo:

- Tener carrito persistente para usuarios autenticados.
- Mantener carrito guest local sin merge automático.

Decisión aprobada:

- Guest cart: localStorage.
- User cart: DB.
- Merge guest->user: pospuesto.

Migraciones DB:

- Crear carts.
- Crear cart_items.
- Restricción de un carrito por user.
- Índices por cart_id, product_id, variant_id.

Endpoints:

- GET /api/cart
- POST /api/cart/items
- PUT /api/cart/items/:id
- DELETE /api/cart/items/:id

Compatibilidad:

- Comprar directo desde flujo actual debe seguir funcionando.

Cambios frontend:

- Cart icon con badge.
- Página de carrito.
- Add/remove/update quantity.
- Doble modo:
  - guest: localStorage
  - authenticated: API

Criterios de aceptación:

- Carrito usuario persiste entre sesiones.
- Carrito guest persiste en navegador.
- No se implementa merge automático.

Riesgos:

- Inconsistencia entre stock y carrito.

Mitigación:

- Revalidar disponibilidad en checkout y no confiar solo en carrito.

## Fase 4 - Órdenes con Snapshot Inmutable

Objetivo:

- Evolucionar órdenes a modelo robusto.
- Crear order_items con snapshots explícitos.

Migraciones DB:

- Crear order_items.
- Extender orders con campos: user_id, address_id, payment_method, payment_status, order_status, subtotal, shipping_cost, total, mercadopago_payment_id, mercadopago_preference_id.
- Mantener columnas legacy de orders durante transición.

Regla clave:

- order_items debe guardar snapshots explícitos:
  - product_name
  - variant_name
  - unit_price

Endpoints:

- POST /api/orders (creación previa al redirect de pago)
- Ajustes en POST /api/create-payment para enlazar orden ya creada.
- Webhook Mercado Pago actualiza payment_status/order_status.

Compatibilidad:

- Mantener checkout guest.
- Mantener flujo Mercado Pago existente extendido, no reemplazado.

Cambios frontend:

- Checkout crea orden antes de redirección.
- Enviar dirección/user cuando exista.

Criterios de aceptación:

- Historial no cambia si producto/variante cambian en catálogo.
- Webhook actualiza orden correcta por referencia.

Riesgos:

- Doble creación de orden por reintentos.

Mitigación:

- Idempotencia por external_reference/preference_id.

## Fase 5 - Historial de Compras

Objetivo:

- Exponer historial para clientes autenticados.

Migraciones DB:

- Sin tablas nuevas obligatorias (aprovecha orders + order_items).
- Índices adicionales por user_id, created_at, order_status si faltan.

Endpoints:

- GET /api/orders
- GET /api/orders/:id

Reglas de acceso:

- customer: solo sus órdenes.
- admin: acceso total.

Cambios frontend:

- Nueva ruta /account/orders.
- Vista listado + detalle.

Criterios de aceptación:

- Cliente no puede ver órdenes ajenas.
- Admin puede filtrar globalmente.

Riesgos:

- Fuga de datos por filtros incompletos.

Mitigación:

- Política de ownership centralizada en capa service/repository.

## Fase 6 - Inventario Inicial (Solo Stock)

Objetivo:

- Agregar control de stock básico sin reserved_stock.

Migraciones DB:

- Agregar products.stock.
- Backfill inicial de stock para productos existentes.
- Check constraint stock >= 0.

Endpoints:

- Extender CRUD de productos para editar stock.
- Validar stock en creación de orden/checkout.

Compatibilidad:

- Mantener productos legacy con stock inicial configurable.

Cambios frontend:

- Mostrar stock en admin.
- Bloquear compra si stock 0 (según UX definido).

Criterios de aceptación:

- Nunca stock negativo.
- Checkout falla de forma clara ante falta de stock.

Riesgos:

- Race conditions en compra concurrente.

Mitigación:

- Actualizaciones transaccionales y validación atómica en backend.

## Fase 7 - Evolución de Checkout

Objetivo:

- Extender checkout para usuarios autenticados conservando guest.

Migraciones DB:

- No obligatorias nuevas; reutiliza F2-F6.

Endpoints:

- Ajustes en create-payment/webhook/orders para flujo consolidado.

Cambios frontend:

- Checkout rápido para usuario con dirección guardada.
- Guest checkout intacto.

Criterios de aceptación:

- Flujo guest no se rompe.
- Flujo auth reduce fricción.

Riesgos:

- Divergencia de lógica entre guest y auth.

Mitigación:

- Orquestador único de checkout con variantes por contexto.

## Fase 8 - Mejoras Admin

Objetivo:

- Expandir panel admin con usuarios, órdenes, inventario, direcciones, estadísticas.

Migraciones DB:

- Índices de soporte para filtros y búsquedas.

Endpoints:

- Endpoints admin para listados con filtros/paginación.

Cambios frontend:

- Nuevas secciones en /admin.
- Búsqueda y filtros multi-criterio.

Criterios de aceptación:

- Consultas rápidas con datasets crecientes.
- Controles por rol efectivos.

Riesgos:

- Consultas costosas sin paginación.

Mitigación:

- Paginación server-side e índices específicos.

## Fase 9 - Buenas Prácticas de Base de Datos

Objetivo:

- Consolidar constraints, FKs, índices, triggers, soft-delete donde aplique.

Migraciones DB:

- Hardening de constraints.
- Índices compuestos según patrones reales.
- Triggers updated_at faltantes.

Criterios de aceptación:

- Integridad referencial completa.
- Sin pérdida histórica de órdenes.

Riesgos:

- Bloqueos por migraciones pesadas en producción.

Mitigación:

- Migraciones online/por lotes y ventanas controladas.

## Fase 10 - Calidad de Código

Objetivo:

- Separar capas y reducir lógica en rutas.

Cambios backend:

- routes / controllers / services / repositories / middleware.
- Validación centralizada.
- Errores centralizados.

Cambios frontend:

- Tipos compartidos robustos.
- Servicios desacoplados por dominio.

Criterios de aceptación:

- Mismo comportamiento funcional con menor complejidad ciclomática.

Riesgos:

- Regresiones por refactor profundo.

Mitigación:

- Refactor incremental por módulo + pruebas de regresión.

## Fase 11 - Seguridad

Objetivo:

- Elevar seguridad operacional y de aplicación.

Áreas:

- bcrypt cost factor apropiado.
- Expiración/rotación JWT.
- Ownership checks obligatorios.
- Validación de inputs estricta.
- Protección de rutas admin.
- Evitar exposición de service role keys.

Criterios de aceptación:

- Pruebas de acceso indebido fallan consistentemente.
- Secretos no expuestos en cliente ni logs.

## Fase 12 - Documentación

Objetivo:

- Documentar todo el sistema evolucionado.

Entregables:

- README frontend actualizado.
- README backend actualizado.
- Manual de usuario (admin + customer).
- Instrucciones de setup, operación y mantenimiento.

Criterios de aceptación:

- Un nuevo developer puede levantar, operar y desplegar el sistema solo con documentación.

## 6. Riesgos Globales y Backwards Compatibility

Riesgos globales:

- Incompatibilidad de tokens al migrar auth.
- Inconsistencia temporal entre modelo legacy de orders y modelo nuevo.
- Degradación de performance sin índices adecuados.
- Errores de ownership en recursos de cliente.

Estrategia de compatibilidad:

- Mantener endpoints y payloads legacy durante transición.
- Introducir campos nuevos como opcionales inicialmente.
- Dual read/dual write temporal cuando aplique.
- Remoción de legacy solo después de validación en producción.

## 7. Estrategia de Despliegue

Por cada fase:

1. Preparación

- Congelar alcance de la fase.
- Definir checklist de pruebas.
- Definir rollback específico.

2. Migración DB (additive)

- Ejecutar scripts SQL primero.
- Verificar tablas/índices/triggers.
- No eliminar estructuras legacy en el mismo release.

3. Deploy backend

- Activar nuevos endpoints/middleware con compatibilidad.
- Monitorear logs de errores y latencia.

4. Deploy frontend

- Activar UI/servicios nuevos detrás de feature toggle si aplica.
- Verificar rutas críticas: home, checkout, admin.

5. Verificación post-deploy

- Smoke tests de catálogo, checkout, admin, auth.
- Validar métricas y errores.

6. Cierre de fase

- Actualizar READMEs y manual.
- Registrar resultados de pruebas.
- Documentar rollback realizado o descartado.

## 8. Checklist de Aceptación General por Fase

- Migraciones ejecutadas sin pérdida de datos.
- Endpoints nuevos funcionando y legacy sin ruptura.
- Frontend compatible con estado de backend desplegado.
- Seguridad y ownership validados.
- Documentación actualizada al cerrar fase.
- Rollback plan documentado y probado en entorno staging.

## 9. Decisiones Aprobadas (Resumen)

- Users sin username: login único por email.
- order_items con snapshots explícitos: product_name, variant_name, unit_price.
- reserved_stock pospuesto: inventario inicial solo con stock.
- merge automático guest->user cart pospuesto.
- Ejecución incremental estricta: una fase por vez.

## 10. Próximo Paso Aprobado

Implementar únicamente Fase 1:

- users + auth real por email
- middleware authenticate/authorize
- protección de rutas admin por rol
- documentación y checklist de pruebas de Fase 1

# Architecture Evolution Plan - Luna Gold Creaciones

## 1. Objetivo y Principios

Este plan define la evolución del ecommerce actual hacia una arquitectura madura, escalable y mantenible, preservando el funcionamiento productivo existente.

Principios obligatorios:

- Additive first: primero agregar, luego migrar, por último retirar legado.
- Backwards compatible: no romper flujos existentes de catálogo, admin ni Mercado Pago.
- Una fase por vez: no iniciar Fase N+1 hasta completar y verificar Fase N.
- Seguridad por defecto: autenticación, autorización y ownership explícitos.
- Trazabilidad: toda fase incluye migraciones SQL, checklist de testing y rollback.

Decisiones aprobadas para esta versión del plan:

- `users`: sin `username`; el identificador de login es `email` único.
- `order_items`: snapshots explícitos mínimos en compra: `product_name`, `variant_name`, `unit_price`.
- Inventario inicial: usar solamente `stock`; `reserved_stock` se pospone.
- Carrito guest: queda en `localStorage`; se pospone merge automático con carrito persistente de usuario.

---

## 2. Modelo de Datos Final (Target)

### 2.1 Tablas existentes (se mantienen)

- `products`
- `product_variants`
- `categories`
- `collections`
- `orders` (existente, evolucionará sin ruptura)

### 2.2 Tablas nuevas target

### `users`

- `id` UUID PK
- `email` TEXT UNIQUE NOT NULL
- `password_hash` TEXT NOT NULL
- `first_name` TEXT
- `last_name` TEXT
- `phone` TEXT
- `role` TEXT NOT NULL CHECK (`admin`, `customer`)
- `active` BOOLEAN NOT NULL DEFAULT true
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()
- `updated_at` TIMESTAMPTZ NOT NULL DEFAULT now()

### `addresses`

- `id` UUID PK
- `user_id` UUID NOT NULL FK -> `users.id`
- `label` TEXT
- `recipient_name` TEXT NOT NULL
- `phone` TEXT NOT NULL
- `street` TEXT NOT NULL
- `number` TEXT NOT NULL
- `apartment` TEXT
- `city` TEXT NOT NULL
- `state` TEXT
- `postal_code` TEXT
- `country` TEXT NOT NULL
- `is_default` BOOLEAN NOT NULL DEFAULT false
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()
- `updated_at` TIMESTAMPTZ NOT NULL DEFAULT now()

### `carts`

- `id` UUID PK
- `user_id` UUID NOT NULL UNIQUE FK -> `users.id`
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()
- `updated_at` TIMESTAMPTZ NOT NULL DEFAULT now()

### `cart_items`

- `id` UUID PK
- `cart_id` UUID NOT NULL FK -> `carts.id`
- `product_id` UUID NOT NULL FK -> `products.id`
- `variant_id` UUID NULL FK -> `product_variants.id`
- `quantity` INTEGER NOT NULL CHECK (`quantity > 0`)
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()
- Restricción recomendada: UNIQUE (`cart_id`, `product_id`, `variant_id`)

### Evolución de `orders` (cabecera)

Tabla actual conserva columnas existentes para compatibilidad y agrega:

- `user_id` UUID NULL FK -> `users.id`
- `address_id` UUID NULL FK -> `addresses.id`
- `payment_method` TEXT NULL
- `payment_status` TEXT NOT NULL DEFAULT `pending`
  - CHECK: `pending`, `approved`, `rejected`, `refunded`
- `order_status` TEXT NOT NULL DEFAULT `pending`
  - CHECK: `pending`, `paid`, `processing`, `shipped`, `delivered`, `cancelled`
- `subtotal` NUMERIC(10,2) NULL
- `shipping_cost` NUMERIC(10,2) NULL
- `total` NUMERIC(10,2) NULL
- `mercadopago_payment_id` TEXT NULL
- `mercadopago_preference_id` TEXT NULL

Nota: durante transición se mantiene compatibilidad con columnas legacy (`product`, `price`, `status`, etc.) y se hace dual-write cuando aplique.

### `order_items`

- `id` UUID PK
- `order_id` TEXT/UUID NOT NULL FK -> `orders.id` (según tipo final de `orders.id`)
- `product_id` UUID NULL FK -> `products.id`
- `variant_id` UUID NULL FK -> `product_variants.id`
- `quantity` INTEGER NOT NULL CHECK (`quantity > 0`)
- `product_name` TEXT NOT NULL
- `variant_name` TEXT NULL
- `unit_price` NUMERIC(10,2) NOT NULL
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()

Regla clave: `order_items` es snapshot inmutable de compra. Nunca depende de valores actuales de producto o variante.

### Inventario en `products` (fase inicial)

- `stock` INTEGER NOT NULL DEFAULT 0 CHECK (`stock >= 0`)

`reserved_stock` queda explícitamente pospuesto para fase posterior.

---

## 3. Migraciones por Fase

## Fase 1 - Real User System

Objetivo: reemplazar autenticación hardcoded por usuarios en base de datos, manteniendo el panel admin operativo.

Migraciones SQL:

1. Crear tabla `users`.
2. Índices/constraints:
   - UNIQUE (`email`)
   - INDEX (`role`, `active`)
3. Trigger `updated_at` para `users`.
4. Seed mínimo de admin inicial (email y hash bcrypt).

Compatibilidad:

- Mantener temporalmente soporte de login legacy vía env (feature flag) hasta validar despliegue.
- JWT nuevo con `sub = user.id` y payload con `id`, `email`, `role`.

## Fase 2 - Customer Addresses

Migraciones SQL:

1. Crear tabla `addresses`.
2. FK `addresses.user_id -> users.id`.
3. Índices:
   - (`user_id`)
   - (`user_id`, `is_default`)
4. Trigger `updated_at`.
5. Regla de una sola dirección default por usuario (índice parcial recomendado).

Compatibilidad:

- No afecta checkout guest actual.

## Fase 3 - Persistent Shopping Cart

Migraciones SQL:

1. Crear `carts`.
2. Crear `cart_items`.
3. FKs y restricciones.
4. Índices:
   - `carts.user_id` UNIQUE
   - `cart_items.cart_id`
   - `cart_items.product_id`
   - `cart_items.variant_id`
   - UNIQUE (`cart_id`, `product_id`, `variant_id`)
5. Trigger `updated_at` en `carts`.

Compatibilidad:

- Guest cart permanece en `localStorage`.
- No merge automático guest->user en esta fase.

## Fase 4 - Orders (Normalización y Snapshot)

Migraciones SQL:

1. Alter `orders` para nuevas columnas de cabecera (`user_id`, `address_id`, `payment_method`, `payment_status`, `order_status`, `subtotal`, `shipping_cost`, `total`, `mercadopago_*`).
2. Crear `order_items` con snapshots explícitos (`product_name`, `variant_name`, `unit_price`).
3. FKs e índices para lectura por usuario/estado/fecha.
4. Mantener columnas legacy de `orders` durante transición.
5. Trigger `updated_at` en `orders` (si no existe o ajustar idempotencia).

Compatibilidad:

- Mantener flujo actual de Mercado Pago mientras se incorpora creación de orden previa al redirect.

## Fase 5 - Purchase History

Migraciones SQL:

- Sin tablas nuevas obligatorias.
- Índices de performance para consultas por usuario y fecha:
  - (`user_id`, `created_at DESC`)
  - (`order_status`, `payment_status`)

Compatibilidad:

- Endpoints admin existentes continúan.

## Fase 6 - Inventory (stock básico)

Migraciones SQL:

1. Alter `products` add `stock` INTEGER NOT NULL DEFAULT 0 CHECK (`stock >= 0`).
2. Índice opcional en `stock` para filtros admin.

Compatibilidad:

- `reserved_stock` pospuesto.
- Lógica de descuento de stock solo en eventos definidos (aprobación/cancelación según diseño final).

## Fase 7 - Checkout Evolution

Migraciones SQL:

- Ajustes menores en `orders`/`order_items` si hicieran falta constraints adicionales.

Compatibilidad:

- Guest checkout sigue funcionando.
- No se reemplaza integración Mercado Pago, solo se extiende.

## Fase 8 - Admin Improvements

Migraciones SQL:

- Índices para búsqueda y filtros administrativos sobre users, orders, addresses, products.

## Fase 9 - Database Best Practices

Migraciones SQL:

1. Consolidar constraints, FKs faltantes, índices finales.
2. Triggers `updated_at` idempotentes en todas las tablas nuevas.
3. Soft delete donde aplique (no en datos históricos de órdenes).
4. Revisión de RLS y políticas por rol/ownership.

## Fase 10 - Code Quality

Migraciones SQL:

- No obligatorias (en principio).

## Fase 11 - Security

Migraciones SQL:

- Ajustes de políticas RLS y constraints de seguridad si aplica.

## Fase 12 - Documentation

Migraciones SQL:

- No aplica.

---

## 4. Endpoints por Fase

## Fase 1

Nuevos:

- `POST /api/auth/register`
- `POST /api/auth/login` (email + password)
- `GET /api/auth/me`
- `PUT /api/auth/profile`

Middleware:

- `authenticate()`
- `authorize(role)`

Impacto:

- Proteger rutas admin por rol admin.

## Fase 2

Nuevos CRUD de direcciones:

- `GET /api/addresses`
- `POST /api/addresses`
- `PUT /api/addresses/:id`
- `DELETE /api/addresses/:id`
- `PUT /api/addresses/:id/default` (o equivalente)

## Fase 3

Nuevos carrito persistente:

- `GET /api/cart`
- `POST /api/cart/items`
- `PUT /api/cart/items/:id`
- `DELETE /api/cart/items/:id`

Comportamiento:

- Guest usa carrito local en frontend.
- Usuario autenticado usa carrito en DB.

## Fase 4

Órdenes normalizadas:

- `POST /api/orders` (crear orden antes de redirigir a MP)
- `POST /api/create-payment` (extensión para usar orden existente)
- `POST /api/webhook` (actualiza `payment_status`/`order_status`)

## Fase 5

Historial:

- `GET /api/orders`
- `GET /api/orders/:id`

Reglas:

- Customer: solo sus órdenes.
- Admin: acceso total.

## Fase 6

Inventario:

- Endpoints de actualización/validación de stock en flujo de orden y admin.
- Sin `reserved_stock` en esta etapa.

## Fase 7

Checkout evolucionado:

- Extensión de endpoints existentes para soporte address book y usuario autenticado.

## Fase 8

Admin:

- Endpoints para gestión de users, orders, inventory, addresses y estadísticas avanzadas con filtros.

## Fase 9-11

- Ajustes transversales de contratos existentes sin ruptura de API pública.

## Fase 12

- No nuevos endpoints; documentación completa.

---

## 5. Cambios Frontend por Fase

## Fase 1

- Reemplazar login admin basado en `username` por `email`.
- Mantener experiencia actual de `/admin` sin cambios visuales disruptivos.
- Persistir token JWT y manejar sesión expirada.

## Fase 2

- Nuevas vistas/forms de direcciones para cliente autenticado.
- Selección de dirección default.

## Fase 3

- Crear página de carrito.
- Ícono de carrito con badge.
- Add/remove/update quantity.
- Guest cart en `localStorage`.
- User cart desde API persistente.

## Fase 4

- Checkout crea orden primero, luego redirige a Mercado Pago.
- Uso de snapshots de item en confirmación.

## Fase 5

- Nueva sección `/account/orders`.
- Lista + detalle de órdenes con estado y productos comprados.

## Fase 6

- Mostrar stock disponible y bloquear compra sin stock.

## Fase 7

- Checkout rápido para autenticados usando direcciones guardadas.
- Guest checkout intacto.

## Fase 8

- Extender panel admin: usuarios, órdenes, inventario, direcciones, filtros, búsqueda, estadísticas.

## Fase 9-11

- Ajustes de validación, errores y seguridad en UX/API handling.

## Fase 12

- Actualización de textos de ayuda y manuales de uso.

---

## 6. Cambios Backend por Fase

## Fase 1

- Introducir capa de auth real con bcrypt + JWT sobre `users`.
- Implementar `authenticate()` y `authorize(role)`.
- Aplicar protección por rol en rutas admin.

## Fase 2

- CRUD de `addresses` con ownership estricto por `user_id`.

## Fase 3

- Servicio de carrito persistente para usuarios autenticados.
- Validaciones de producto/variante activa y cantidad.

## Fase 4

- Evolucionar modelo de órdenes a cabecera + ítems.
- Asegurar snapshots inmutables en `order_items`.
- Integrar actualización de estados por webhook MP.

## Fase 5

- Endpoints de historial con reglas de acceso por rol y ownership.

## Fase 6

- Validaciones de stock en creación/actualización de orden.
- Evitar stock negativo.

## Fase 7

- Extender checkout actual sin reemplazar integración MP.

## Fase 8

- Endpoints administrativos ampliados con filtros y paginación.

## Fase 9

- Hardening de DB (índices, FKs, constraints, triggers, RLS).

## Fase 10

- Refactor por capas: routes/controllers/services/repositories/middleware.

## Fase 11

- Hardening de seguridad: validación inputs, ownership, expiración JWT y controles de autorización.

## Fase 12

- No funcional: documentación técnica y operativa completa.

---

## 7. Riesgos y Mitigaciones

1. Ruptura del login admin al pasar de credenciales hardcoded a DB.
   - Mitigación: feature flag temporal para fallback legacy y despliegue gradual.

2. Inconsistencias entre órdenes legacy y nuevo esquema de `order_items`.
   - Mitigación: dual-write transitorio y lectura compatible durante fase de migración.

3. Regresiones en checkout con Mercado Pago.
   - Mitigación: no reemplazar flujo existente; extender por detrás de flags y pruebas E2E.

4. Exposición de datos por falta de ownership checks.
   - Mitigación: aplicar `authenticate()` + ownership en todos los recursos customer.

5. Performance en admin al crecer datos.
   - Mitigación: índices por fase, filtros server-side y paginación.

6. Manejo de stock en alta concurrencia sin `reserved_stock`.
   - Mitigación: validaciones transaccionales y reglas conservadoras; planear evolución posterior.

---

## 8. Criterios de Aceptación por Fase

## Fase 1

- Login por email/password operativo.
- Passwords solo hasheados con bcrypt.
- JWT con `sub=user.id` y payload (`id`, `email`, `role`).
- `/api/auth/me` y `/api/auth/profile` funcionando.
- Rutas admin accesibles solo por role admin.
- Flujos actuales de catálogo/admin no rotos.

## Fase 2

- Usuario puede CRUD de direcciones propias.
- Puede marcar una dirección default.
- No puede acceder a direcciones de otros usuarios.

## Fase 3

- Usuario autenticado mantiene carrito persistente entre sesiones.
- Guest conserva carrito local.
- Sin merge automático en esta fase.

## Fase 4

- Órdenes se crean antes de redirect a MP.
- `order_items` guarda snapshots: `product_name`, `variant_name`, `unit_price`.
- Webhook actualiza estados correctamente.

## Fase 5

- Customer visualiza solo sus órdenes.
- Admin visualiza todas.

## Fase 6

- No hay ventas con stock negativo.
- Stock se refleja correctamente en panel y compra.

## Fase 7

- Checkout guest intacto.
- Checkout autenticado más rápido con direcciones guardadas.

## Fase 8

- Admin puede gestionar users, orders, inventory, addresses, products y estadísticas con filtros.

## Fase 9-11

- Base endurecida, seguridad reforzada y estructura de código mantenible.

## Fase 12

- Documentación actualizada, completa y alineada con comportamiento real del sistema.

---

## 9. Estrategia de Despliegue

## 9.1 Enfoque general

- Deploy por fase, nunca por paquete completo.
- Cada fase con:
  1. Migración SQL idempotente.
  2. Deploy backend.
  3. Deploy frontend.
  4. Smoke tests.
  5. Monitoreo.

## 9.2 Orden de ejecución recomendado

1. Ejecutar migración de fase en staging.
2. Validar regresión de endpoints existentes.
3. Validar nuevos endpoints fase.
4. Desplegar a producción en ventana controlada.
5. Monitorear logs/errores y métricas de checkout/admin.

## 9.3 Feature flags recomendados

- `AUTH_DB_ENABLED`
- `ORDERS_V2_ENABLED`
- `CART_PERSISTENT_ENABLED`
- `INVENTORY_STOCK_ENABLED`

## 9.4 Rollback

- SQL additive permite rollback funcional vía desactivar flags y volver a rutas/lecturas legacy.
- Evitar drops o renames destructivos en fases tempranas.
- Mantener documentación de rollback por fase en changelog operativo.

## 9.5 Definition of Done por fase

Una fase se considera completada solo cuando:

- Migraciones aplicadas y verificadas.
- Endpoints fase operativos.
- Frontend fase operativo.
- Documentación actualizada (README frontend, README backend, manual si aplica).
- Checklist de testing ejecutado.
- Rollback documentado.

---

## 10. Próximo Paso Aprobado

Con este plan aprobado, el siguiente paso de implementación será exclusivamente la Fase 1 (Real User System), sin adelantar fases posteriores.
