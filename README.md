<div align="center">
   <img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Luna Gold Creaciones

E-commerce de joyeria infantil para Uruguay, construido con React + TypeScript + Vite + Tailwind CSS.

## Estado Actual

- Frontend con rutas completas para checkout: inicio, pago exitoso, pago fallido y pago pendiente.
- Flujo de compra con modal y formulario de datos del cliente.
- Integracion de Mercado Pago via backend (creacion de preferencia y redireccion al checkout).
- Integracion de WhatsApp para consultas y pedidos con transferencia/efectivo.

## Stack

- React 19 + TypeScript
- Vite 6
- Tailwind CSS 4
- Motion (animaciones)
- React Router DOM
- Lucide React (iconos)

## Funcionalidades

### Catalogo y experiencia de compra

- Catalogo de productos desde [src/constants.ts](src/constants.ts).
- Grilla de productos con animaciones en [src/components/ProductGrid.tsx](src/components/ProductGrid.tsx).
- Modal de compra multi-paso en [src/components/PurchaseModal.tsx](src/components/PurchaseModal.tsx).

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
- `/success` confirmacion de pago exitoso.
- `/failure` pantalla de pago fallido con acceso a soporte.
- `/pending` pantalla de pago pendiente con seguimiento.

Implementadas en [src/App.tsx](src/App.tsx) y paginas en [src/pages](src/pages).

## Arquitectura (Frontend)

- [src/pages/Home.tsx](src/pages/Home.tsx): compone la pagina principal y controla `selectedProduct`.
- [src/components/PurchaseModal.tsx](src/components/PurchaseModal.tsx): concentra la logica de checkout.
- [src/constants.ts](src/constants.ts): productos, FAQ, logos, WhatsApp y URLs de backend.
- [src/types.ts](src/types.ts): tipos compartidos (`Product`, `FAQItem`, `PaymentMethod`).

## Estructura del Proyecto

```text
lunaperla/
   src/
      components/
      pages/
      App.tsx
      constants.ts
      types.ts
   .github/
   package.json
```

## Requisitos

- Node.js 18+
- npm
- Backend de Mercado Pago corriendo (por defecto en `http://localhost:3001`)

## Variables de Entorno

En este frontend:

- `.env.local`
  - `GEMINI_API_KEY` (si usas la integracion de AI Studio/Gemini)

Nota: la URL de backend usada para pagos esta definida actualmente en [src/constants.ts](src/constants.ts) como `BACKEND_URL_LOCAL`.

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

- `POST /api/create-payment`
- `POST /api/webhook`
- `GET /api/health`

## Contenido Editable Rapido

- Productos: [src/constants.ts](src/constants.ts)
- FAQs: [src/constants.ts](src/constants.ts)
- Numero de WhatsApp: [src/constants.ts](src/constants.ts)
- Textos de estados de pago: [src/pages/Success.tsx](src/pages/Success.tsx), [src/pages/Failure.tsx](src/pages/Failure.tsx), [src/pages/Pending.tsx](src/pages/Pending.tsx)
