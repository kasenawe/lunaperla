<div align="center">
   <img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Luna Gold Creaciones

E-commerce de joyeria infantil para Uruguay, construido con React + TypeScript + Vite + Tailwind CSS.

## Estado Actual

- Frontend con rutas completas para checkout: inicio, pago exitoso, pago fallido y pago pendiente.
- Home con catalogo dinamico por categorias, filtros y secciones generadas desde datos reales.
- Panel administrativo en `/admin` para gestionar productos, categorias y colecciones.
- Área de cliente en `/account/addresses` para gestionar direcciones guardadas.
- Panel administrativo con campo `Codigo de producto` en alta/edición y listado.
- Panel administrativo con gestion de variantes por producto (SKU, etiqueta, kilataje, mm, perfil, cierre, precio, orden, estado y metadata JSON).
- Flujo de compra con modal y formulario de datos del cliente.
- Flujo de compra con seleccion de variantes activas y precio dinamico por variante.
- Integracion de Mercado Pago via backend (creacion de preferencia y redireccion al checkout).
- Integracion de WhatsApp para consultas y pedidos con transferencia/efectivo.
- Productos dinámicos desde backend (base de datos Supabase).
- Categorias y colecciones opcionales sincronizadas con backend y fallback local.
- Imágenes en Supabase Storage con rutas persistidas en la base y URLs públicas normalizadas en frontend.
- Subida de imágenes con token firmado: backend genera `signed_url` y el archivo se sube directo a Supabase Storage.
- Fallback a productos estáticos en caso de error de conexión.

## Stack

- React 19 + TypeScript
- Vite 6
- Tailwind CSS 4
- Motion (animaciones)
- React Router DOM
- Lucide React (iconos)

## Funcionalidades

### Catálogo y experiencia de compra

- Productos dinámicos desde endpoint backend `/api/products` (Supabase PostgreSQL).
- Servicio de productos en [src/services/productService.ts](src/services/productService.ts) con:
  - Fetch desde backend con manejo de errores.
  - Normalización de URLs de imágenes desde Supabase Storage.
  - Fallback automático a productos estáticos si falla el API.
- Servicio de catalogo en [src/services/catalogService.ts](src/services/catalogService.ts) para categorias y colecciones.
- Home dinámica en [src/pages/Home.tsx](src/pages/Home.tsx) con:
  - carga paralela de productos y categorias
  - filtros por categoria
  - una seccion por categoria con productos asociados
- Navbar dinámico en [src/components/Navbar.tsx](src/components/Navbar.tsx) con accesos a categorias disponibles.
- Grilla de productos con animaciones en [src/components/ProductGrid.tsx](src/components/ProductGrid.tsx).
- Estados de carga y error en [src/pages/Home.tsx](src/pages/Home.tsx).
- Modal de compra multi-paso en [src/components/PurchaseModal.tsx](src/components/PurchaseModal.tsx).
- Imágenes almacenadas en Supabase Storage (bucket público `products`).

### Panel admin de catalogo

- Ruta dedicada: `/admin` en [src/App.tsx](src/App.tsx).
- Página de administración en [src/pages/Admin.tsx](src/pages/Admin.tsx).
- Login en navegador para admin (JWT) con persistencia de sesión en `localStorage`.
- Login en navegador para admin con email + contraseña, persistiendo el JWT en `localStorage`.
- Envío automático de `Authorization: Bearer <token>` en operaciones protegidas.
- CRUD completo de productos:
  - listado con `GET /api/products?all=true`
  - creación con `POST /api/products`
  - edición con `PUT /api/products/:id`
  - eliminación con `DELETE /api/products/:id`
- El formulario de producto permite cargar `product_code` (opcional y único en backend).
- Al editar un producto, incluye gestion de variantes:
  - listado con `GET /api/products/:id/variants`
  - creación con `POST /api/products/:id/variants`
  - edición con `PUT /api/products/:id/variants/:variantId`
  - eliminación con `DELETE /api/products/:id/variants/:variantId`
- Al editar o crear productos, categorias y colecciones, el panel hace scroll automático al formulario para mantener el contexto.
- CRUD completo de categorias:
  - listado con `GET /api/categories?all=true`
  - creación con `POST /api/categories`
  - edición con `PUT /api/categories/:slug`
  - eliminación con `DELETE /api/categories/:slug`
- CRUD completo de colecciones:
  - listado con `GET /api/collections?all=true`
  - creación con `POST /api/collections`
  - edición con `PUT /api/collections/:slug`
  - eliminación con `DELETE /api/collections/:slug`
- Formulario reutilizable en [src/components/ProductForm.tsx](src/components/ProductForm.tsx).
- Formularios reutilizables en [src/components/CategoryForm.tsx](src/components/CategoryForm.tsx) y [src/components/CollectionForm.tsx](src/components/CollectionForm.tsx).
- Subida de imágenes vía backend usando [src/services/storageService.ts](src/services/storageService.ts).
- Vista previa de imágenes y normalización compartida con [src/utils/imageUrl.ts](src/utils/imageUrl.ts).
- Footer reutilizable en [src/components/Footer.tsx](src/components/Footer.tsx).

### Metodos de pago

- Mercado Pago:
  - Solicita nombre, telefono y email.
  - Llama al backend en `/api/create-payment`.
  - Envía `product_code` dentro de `product` cuando está disponible.
  - Si existe variante seleccionada, envía tambien `productVariant` con snapshot de la variante (sku, label, karat, width_mm, profile, closure_type, price, metadata).
  - Redirige al `init_point` de Mercado Pago.
- Transferencia bancaria y efectivo:
  - Solicita nombre, telefono y direccion.
  - Genera mensaje y abre WhatsApp con datos del pedido.

### Rutas de la app

- `/` Home: landing, catalogo, FAQ y modal de compra.
- `/admin` panel de administración de catalogo.
- `/account/addresses` gestión de direcciones del cliente autenticado.
- `/success` confirmacion de pago exitoso.
- `/failure` pantalla de pago fallido con acceso a soporte.
- `/pending` pantalla de pago pendiente con seguimiento.

Implementadas en [src/App.tsx](src/App.tsx) y paginas en [src/pages](src/pages).

## Arquitectura (Frontend)

- [src/pages/Home.tsx](src/pages/Home.tsx): compone la página principal, carga productos y categorias, y arma secciones dinámicas por categoria.
- [src/pages/Admin.tsx](src/pages/Admin.tsx): panel de administración por pestañas para productos, categorias y colecciones, incluyendo gestion de variantes por producto.
- [src/services/productService.ts](src/services/productService.ts): servicio de fetch de productos con normalización de URLs y fallback.
- [src/services/catalogService.ts](src/services/catalogService.ts): servicio de CRUD para categorias y colecciones.
- [src/services/storageService.ts](src/services/storageService.ts): subida de imágenes en dos pasos (`/api/upload-image-token` + `PUT` directo a Supabase Storage).
- [src/utils/imageUrl.ts](src/utils/imageUrl.ts): helper compartido para convertir paths almacenados en URLs públicas renderizables.
- [src/components/ProductGrid.tsx](src/components/ProductGrid.tsx): recibe productos, titulo y subtitulo para renderizar cada categoria del catalogo.
- [src/components/ProductForm.tsx](src/components/ProductForm.tsx): formulario reutilizable para el CRUD del admin, con categoria, coleccion opcional y campo `Codigo de producto` (`product_code`).
- [src/components/CategoryForm.tsx](src/components/CategoryForm.tsx): formulario reutilizable para categorias.
- [src/components/CollectionForm.tsx](src/components/CollectionForm.tsx): formulario reutilizable para colecciones.
- [src/components/PurchaseModal.tsx](src/components/PurchaseModal.tsx): concentra la lógica de checkout y seleccion de variantes para precio/codigo.
- [src/components/Navbar.tsx](src/components/Navbar.tsx): navegación superior con accesos a categorias activas.
- [src/components/Footer.tsx](src/components/Footer.tsx): footer reutilizable para páginas internas.
- [src/constants.ts](src/constants.ts): productos, categorias y colecciones de fallback, FAQ, logos y WhatsApp.
- [src/config/api.ts](src/config/api.ts): resolución centralizada de base URL para API según entorno (`VITE_API_BASE_URL`, proxy local de Vite y fallback de producción).
- [src/types.ts](src/types.ts): tipos compartidos (`CatalogProduct`, `ProductVariant`, `BackendProduct`, `BackendProductVariant`, `Category`, `Collection`, `FAQItem`, `PaymentMethod`).

## Estructura del Proyecto

```text
lunaperla/
   src/
      components/
      pages/
      services/
         productService.ts
      App.tsx
      constants.ts
      types.ts
   .github/
   package.json
   .env.example
```

## Requisitos

- Node.js 18+
- npm
- Backend de Mercado Pago corriendo (por defecto en `http://localhost:3001`)

## Variables de Entorno

En este frontend:

- `.env.local`
  - `VITE_API_BASE_URL`: base URL del backend para entornos no locales (staging/prod). En local puede quedar vacía para usar el proxy de Vite (`/api` -> `http://localhost:3001`).
  - `GEMINI_API_KEY` (si usas la integración de AI Studio/Gemini)
  - `VITE_SUPABASE_STORAGE_PUBLIC_BASE_URL`: URL pública del bucket de productos en Supabase Storage (ejemplo: `https://PROJECT_REF.supabase.co/storage/v1/object/public/products`)

Notas:

- El frontend sube imágenes directamente a Supabase Storage usando una signed upload URL emitida por backend.
- El backend no recibe el binario de la imagen, solo firma la subida usando `SUPABASE_SERVICE_ROLE_KEY`.
- `image_url` se guarda en base como path del objeto en Storage, no como URL pública completa.
- Si el backend o las tablas de catalogo no están disponibles, el frontend usa fallback local de productos y categorias definido en [src/constants.ts](src/constants.ts).
- Para `/admin`, necesitás iniciar sesión con un usuario admin persistido en la base de datos.

Nota: la base URL de backend se resuelve en [src/config/api.ts](src/config/api.ts) usando `VITE_API_BASE_URL`; en local usa el proxy de Vite hacia `http://localhost:3001`.

## Scripts

Desde este proyecto:

- `npm run dev`: levanta frontend en puerto 3000 (si esta ocupado, Vite usa otro).
- `npm run dev:backend`: ejecuta backend en carpeta hermana `../lunaperla-backend`.
- `npm run dev:full`: corre frontend + backend en paralelo.
- `npm run build`: build de produccion.
- `npm run preview`: vista previa del build.
- `npm run lint`: chequeo de TypeScript (`tsc --noEmit`).

## Flujo de Pago End-to-End

1. Usuario elige producto en Home.
2. Se abre modal y selecciona metodo de pago.
3. Si es Mercado Pago, frontend envia datos al backend (`/api/create-payment`).
4. Backend crea preferencia y devuelve `init_point`.
5. Frontend redirige a Mercado Pago.
6. Mercado Pago redirige a `/success`, `/failure` o `/pending`.

## Backend Relacionado

Este frontend espera un backend Node/Express en una carpeta hermana (`../lunaperla-backend`) con al menos:

- Arquitectura modular en `src/` (config, clients, routes, views, middlewares, utils).
- Entry point local en `src/server.js` y app Express exportada desde `src/app.js`.

- `GET /api/products`
- `GET /api/products?all=true`
- `GET /api/categories`
- `GET /api/categories?all=true`
- `POST /api/categories`
- `PUT /api/categories/:slug`
- `DELETE /api/categories/:slug`
- `GET /api/collections`
- `GET /api/collections?all=true`
- `POST /api/collections`
- `PUT /api/collections/:slug`
- `DELETE /api/collections/:slug`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`
- `GET /api/products/:id/variants`
- `POST /api/products/:id/variants`
- `PUT /api/products/:id/variants/:variantId`
- `DELETE /api/products/:id/variants/:variantId`
- `POST /api/upload-image-token`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PUT /api/auth/profile`
- `GET /api/addresses`
- `POST /api/addresses`
- `PUT /api/addresses/:id`
- `PUT /api/addresses/:id/default`
- `DELETE /api/addresses/:id`
- `POST /api/create-payment`
- `POST /api/webhook`
- `GET /api/health`

Nota: las rutas administrativas de escritura/gestión y dashboard API están protegidas por JWT y requieren Bearer token.

## Contenido Editable Rápido

- **Productos**: tabla `products` en Supabase (ver instrucciones en backend).
- **Variantes de productos**: tabla `product_variants` en Supabase o panel `/admin` al editar un producto.
- **Categorias**: tabla `categories` en Supabase o panel `/admin`.
- **Colecciones**: tabla `collections` en Supabase o panel `/admin`.
- **Productos, categorias y colecciones (fallback local)**: [src/constants.ts](src/constants.ts) para cuando falla el API o faltan migraciones.
- **FAQs**: [src/constants.ts](src/constants.ts)
- **Número de WhatsApp**: [src/constants.ts](src/constants.ts)
- **Imágenes de productos**: bucket `products` en Supabase Storage; el frontend renderiza desde el path guardado en `image_url`.
- **Textos de estados de pago**: [src/pages/Success.tsx](src/pages/Success.tsx), [src/pages/Failure.tsx](src/pages/Failure.tsx), [src/pages/Pending.tsx](src/pages/Pending.tsx)

## Manual de uso para administración

- Manual final para uso diario del panel admin: [MANUAL-USUARIO-ADMIN.md](MANUAL-USUARIO-ADMIN.md)
