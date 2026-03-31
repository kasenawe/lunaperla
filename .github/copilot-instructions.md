# AI Copilot Instructions for Luna Gold Creaciones

## Project Overview

Luna Gold Creaciones is a luxury jewelry e-commerce website for baby earrings (aretes de oro bebé) built with React 19, TypeScript, Vite, and Tailwind CSS. The app is designed for a Uruguayan market and emphasizes elegant UI with Spanish content.

## Architecture & Key Patterns

### Component Structure

- **Layout Components** (`Navbar`, `Hero`, `Footer`): Handle page structure and navigation
- **Product Components** (`ProductGrid`, `PurchaseModal`): Product display and purchasing flow
- **Feature Sections** (`TrustSection`, `PaymentMethods`, `FAQ`, `BrandStory`): Marketing and information sections
- **Page Components** (`Home`, `Success`, `Failure`, `Pending`): Route-based pages for Mercado Pago results
- **Utility Components** (`WhatsAppButton`): Floating action button for customer support

### State Management

- **App.tsx** is the single source of state using `useState` for `selectedProduct`
- Child components receive product data via props and call `onBuy(product)` callback to trigger modal
- Modal handles multi-step purchasing: payment method selection → form collection → WhatsApp redirect

### Data Layer

- **`constants.ts`**: Centralized data source for `PRODUCTS`, `FAQS`, `LOGO_URL`, `LOGO_SIMPLE_URL`, and `WHATSAPP_NUMBER`
- All component data comes from constants, enabling easy content updates without code changes
- **`types.ts`**: Defines `Product`, `FAQItem`, and `PaymentMethod` interfaces

## Critical Developer Workflows

### Local Development

```bash
npm install              # Install dependencies
npm run dev              # Start Vite dev server on port 3000 with HMR
npm run build            # Production build to dist/
npm run lint             # TypeScript type checking
npm run clean            # Remove dist/ folder
```

### Backend Development

```bash
cd ../lunaperla-backend
npm install              # Install backend dependencies
npm run dev              # Start Express server on port 3001 with nodemon
```

### Routing

- Uses `react-router-dom` for client-side routing
- Routes: `/` (Home), `/success`, `/failure`, `/pending` (Mercado Pago redirects)
- All routes include Navbar, Footer, and WhatsApp button for consistency

### Important Notes

### Important Notes

- Set `GEMINI_API_KEY` in `.env.local` (referenced in `vite.config.ts` via `process.env.GEMINI_API_KEY`)
- Set `MERCADO_PAGO_ACCESS_TOKEN` in `backend/.env` (get from Mercado Pago Developers)
- HMR is disabled in AI Studio via `DISABLE_HMR` env var—file watching is intentionally disabled to prevent flickering during agent edits
- Assets use dynamic imports via Vite's `import.meta.url` for proper path resolution

## UI/Design Conventions

### Tailwind CSS + Motion Library

- Use `motion` (from 'motion/react') for enter animations: scroll-triggered animations with `whileInView`, staggered `delay`
- Hover effects use `group` class pattern: `group-hover:bg-black/5` for child interactions
- Color scheme: Gold accent (`gold` / `#C5A059`), black/white contrast, zinc grays for secondary text
- Typography: Serif font (Cormorant Garamond) for headings, sans-serif (Inter) for body

### Component Patterns

- **Modal Pattern**: `AnimatePresence` + relative positioning with backdrop blur (see `PurchaseModal`)
- **Cards**: Border `border-zinc-100`, light padding, hover scale transform
- **Buttons**: Outline style (border-black), full uppercase text, tracking-widest, smooth hover transitions

## Forms & External Integrations

### Purchase Flow

### Purchase Flow

1. User clicks "Comprar" → `onBuy()` passes product to parent
2. Modal appears with payment method options (Mercado Pago, Transfer, Cash)
3. Mercado Pago: Frontend calls `POST /api/create-payment` → redirects to Mercado Pago checkout
4. After payment: Mercado Pago redirects to `/success`, `/failure`, or `/pending` routes
5. Other methods: Show form (name, phone, address) → Send to WhatsApp via `wa.me/` URL with encoded message
6. **Never store payment data**—all orders go through WhatsApp or Mercado Pago

### WhatsApp Integration

- Floating button in `WhatsAppButton` component
- Use `WHATSAPP_NUMBER` constant (`59899000000` for example)
- Message format: `*Bold text*` markdown, newlines `\n`, use `encodeURIComponent()` for URL-safe messages

### Mercado Pago Integration

- Backend endpoint: `POST /api/create-payment` creates payment preference
- Frontend calls backend API, then redirects to Mercado Pago checkout URL
- Webhook endpoint: `POST /api/webhook` handles payment confirmations
- SDK: `mercadopago@2.12.0` with new client API (`MercadoPagoConfig`, `Preference`)
- Access token stored securely in `backend/.env`

## Build & Deployment

- Build output: `dist/` folder via `npm run build`
- Vite handles asset optimization and code splitting
- Tailwind CSS via `@tailwindcss/vite` plugin (Tailwind 4.x syntax)
- Environment variables loaded from `.env.local` via `loadEnv()`

## Spanish Localization Notes

- Product names, descriptions, FAQ, footer copyright use Spanish
- Keep Spanish terminology consistent (e.g., "Comprar" for buy button, "Envío" for shipping)
- Currency displayed as "USD" (prices are in USD)

## Common Editing Tasks

- **Update products**: Edit `PRODUCTS` array in `constants.ts` (id, name, price, image path, description)
- **Update FAQs**: Edit `FAQS` array in `constants.ts`
- **Add images**: Place in `src/assets/images/`, reference with dynamic imports in constants
- **Change logos**: Update `LOGO_URL` and `LOGO_SIMPLE_URL` paths in constants.ts
- **Modify WhatsApp number**: Update `WHATSAPP_NUMBER` in constants.ts
