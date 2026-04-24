<div align="center">
   <img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Luna Gold Creaciones

E-commerce de joyeria infantil para Uruguay, construido con React + TypeScript + Vite + Tailwind CSS.

## Estado Actual

- Frontend con rutas completas para checkout: inicio, pago exitoso, pago fallido y pago pendiente.
- Home con catalogo dinamico por categorias, filtros y secciones generadas desde datos reales.
- Panel administrativo en `/admin` para gestionar productos, categorias y colecciones.
- Flujo de compra con modal y formulario de datos del cliente.
- Integracion de Mercado Pago via backend (creacion de preferencia y redireccion al checkout).
- Integracion de WhatsApp para consultas y pedidos con transferencia/efectivo.
- Productos dinámicos desde backend (base de datos Supabase).
- Categorias y colecciones opcionales sincronizadas con backend y fallback local.
- Imágenes en Supabase Storage con rutas persistidas en la base y URLs públicas normalizadas en frontend.
- Subida de imágenes desde el panel admin a través del backend.
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
- CRUD completo de productos:
  - listado con `GET /api/products?all=true`
  - creación con `POST /api/products`
  - edición con `PUT /api/products/:id`
  - eliminación con `DELETE /api/products/:id`
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
  - Redirige al `init_point` de Mercado Pago.
- Transferencia bancaria y efectivo:
  - Solicita nombre, telefono y direccion.
  - Genera mensaje y abre WhatsApp con datos del pedido.

### Rutas de la app

- `/` Home: landing, catalogo, FAQ y modal de compra.
- `/admin` panel de administración de catalogo.
- `/success` confirmacion de pago exitoso.
- `/failure` pantalla de pago fallido con acceso a soporte.
- `/pending` pantalla de pago pendiente con seguimiento.

Implementadas en [src/App.tsx](src/App.tsx) y paginas en [src/pages](src/pages).

## Arquitectura (Frontend)

- [src/pages/Home.tsx](src/pages/Home.tsx): compone la página principal, carga productos y categorias, y arma secciones dinámicas por categoria.
- [src/pages/Admin.tsx](src/pages/Admin.tsx): panel de administración por pestañas para productos, categorias y colecciones.
- [src/services/productService.ts](src/services/productService.ts): servicio de fetch de productos con normalización de URLs y fallback.
- [src/services/catalogService.ts](src/services/catalogService.ts): servicio de CRUD para categorias y colecciones.
- [src/services/storageService.ts](src/services/storageService.ts): subida de imágenes al backend usando `multipart/form-data`.
- [src/utils/imageUrl.ts](src/utils/imageUrl.ts): helper compartido para convertir paths almacenados en URLs públicas renderizables.
- [src/components/ProductGrid.tsx](src/components/ProductGrid.tsx): recibe productos, titulo y subtitulo para renderizar cada categoria del catalogo.
- [src/components/ProductForm.tsx](src/components/ProductForm.tsx): formulario reutilizable para el CRUD del admin, con categoria y coleccion opcional.
- [src/components/CategoryForm.tsx](src/components/CategoryForm.tsx): formulario reutilizable para categorias.
- [src/components/CollectionForm.tsx](src/components/CollectionForm.tsx): formulario reutilizable para colecciones.
- [src/components/PurchaseModal.tsx](src/components/PurchaseModal.tsx): concentra la lógica de checkout.
- [src/components/Navbar.tsx](src/components/Navbar.tsx): navegación superior con accesos a categorias activas.
- [src/components/Footer.tsx](src/components/Footer.tsx): footer reutilizable para páginas internas.
- [src/constants.ts](src/constants.ts): productos, categorias y colecciones de fallback, FAQ, logos, WhatsApp y URLs de backend.
- [src/types.ts](src/types.ts): tipos compartidos (`Product`, `BackendProduct`, `Category`, `Collection`, `FAQItem`, `PaymentMethod`).

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
  - `GEMINI_API_KEY` (si usas la integración de AI Studio/Gemini)
  - `VITE_SUPABASE_STORAGE_PUBLIC_BASE_URL`: URL pública del bucket de productos en Supabase Storage (ejemplo: `https://PROJECT_REF.supabase.co/storage/v1/object/public/products`)

Notas:

- El frontend ya no sube imágenes directamente a Supabase; esa operación se hace en backend con service role.
- `image_url` se guarda en base como path del objeto en Storage, no como URL pública completa.
- Si el backend o las tablas de catalogo no están disponibles, el frontend usa fallback local de productos y categorias definido en [src/constants.ts](src/constants.ts).

Nota: la URL de backend para pagos está definida en [src/constants.ts](src/constants.ts) como `BACKEND_URL` (producción) y `BACKEND_URL_LOCAL` (desarrollo).

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
- `POST /api/upload-image`
- `POST /api/create-payment`
- `POST /api/webhook`
- `GET /api/health`

## Contenido Editable Rápido

- **Productos**: tabla `products` en Supabase (ver instrucciones en backend).
- **Categorias**: tabla `categories` en Supabase o panel `/admin`.
- **Colecciones**: tabla `collections` en Supabase o panel `/admin`.
- **Productos, categorias y colecciones (fallback local)**: [src/constants.ts](src/constants.ts) para cuando falla el API o faltan migraciones.
- **FAQs**: [src/constants.ts](src/constants.ts)
- **Número de WhatsApp**: [src/constants.ts](src/constants.ts)
- **Imágenes de productos**: bucket `products` en Supabase Storage; el frontend renderiza desde el path guardado en `image_url`.
- **Textos de estados de pago**: [src/pages/Success.tsx](src/pages/Success.tsx), [src/pages/Failure.tsx](src/pages/Failure.tsx), [src/pages/Pending.tsx](src/pages/Pending.tsx)
