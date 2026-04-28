# LUMIÈRE — Luxury Fashion E-Commerce Platform

> *Where light meets luxury.*

A full-stack, industry-grade e-commerce web application built for **LUMIÈRE**, a premium lifestyle brand. Inspired by the architecture and design principles of ZARA and Prestige Shopify themes.

---

## Tech Stack

| Layer       | Technology                                      |
|-------------|------------------------------------------------|
| Frontend    | Next.js 15 · React 19 · TypeScript · Tailwind CSS · Framer Motion · Zustand |
| Backend     | Java 21 · Spring Boot · Spring Security         |
| Database    | MongoDB (Atlas or local)                        |
| Auth        | Session cookies · Google OAuth 2.0              |
| Payments    | Stripe Checkout                                 |

---

## Quick Start

### Prerequisites
- Node.js 20+
- Java 21+
- Maven 3.9+
- MongoDB running locally (or Atlas URI)

### 1. Backend

```bash
cd backend1
cp .env.example .env          # Fill in your credentials
mvn spring-boot:run
# → http://localhost:8080
```

**Default admin:** `admin@lumiere.fashion` / `Lumiere#2026`

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local    # Fill in your credentials
npm install
npm run dev
# → http://localhost:3000
```

---

## Environment Variables

### Backend (`backend1/.env`)

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | 32+ char random string |
| `STRIPE_SECRET_KEY` | From Stripe Dashboard |
| `STRIPE_WEBHOOK_SECRET` | From Stripe CLI/Dashboard |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console |
| `CORS_ALLOWED_ORIGINS` | Frontend URL |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_BACKEND_URL` | Backend URL (default: `http://localhost:8080`) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Same as backend GOOGLE_CLIENT_ID |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | From Stripe Dashboard |

---

## Setting Up Google OAuth

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create / select a project → **APIs & Services → Credentials**
3. Create **OAuth 2.0 Client ID** → Web application
4. Add Authorized redirect URIs: `http://localhost:3000/auth`
5. Copy the **Client ID** into both `.env` files

---

## Setting Up Stripe

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Get your **Secret Key** (backend) and **Publishable Key** (frontend)
3. For webhooks: `stripe listen --forward-to localhost:8080/api/payments/stripe/webhook`
4. Copy the webhook signing secret into backend `.env`

---

## Project Structure

```
LUMIERE/
├── frontend/                    # Next.js 15 App Router
│   └── src/
│       ├── app/                 # Pages
│       │   ├── page.tsx         # Homepage
│       │   ├── shop/            # Product listing
│       │   ├── product/[id]/    # Product detail
│       │   ├── collections/     # All collections
│       │   ├── collection/[slug]/ # Single collection
│       │   ├── cart/            # Cart (drawer)
│       │   ├── checkout/        # Checkout + Stripe
│       │   ├── auth/            # Login / Register / Google
│       │   ├── account/         # Orders, Wishlist, Profile
│       │   └── search/          # Search results
│       ├── components/
│       │   ├── layout/          # Navigation, Footer
│       │   ├── sections/home/   # Hero, Collections, Lookbook, CTA
│       │   ├── cart/            # CartDrawer
│       │   └── common/          # ProductCard, SearchBar, etc.
│       ├── lib/
│       │   ├── api.ts           # All backend API calls
│       │   └── constants.ts     # Brand config, navigation links
│       └── store/               # Zustand global state
│
└── backend1/                    # Spring Boot
    └── src/main/java/com/backend1/
        ├── controller/          # StoreController, AdminController
        ├── service/             # ProductService, OrderService, etc.
        ├── repository/          # StoreRepository (MongoDB)
        ├── model/               # MongoDocuments
        ├── dto/                 # ApiModels (request/response records)
        ├── security/            # SecurityConfig, SessionCookieService
        └── config/              # AppConfig (CORS, BCrypt)
```

---

## API Endpoints

### Public
- `GET  /api/products` — list products (filterable)
- `GET  /api/products/:id` — single product
- `GET  /api/collections` — list collections

### Auth
- `POST /api/auth/register` — email registration
- `POST /api/auth/login` — email login
- `POST /api/auth/google` — Google OAuth login
- `POST /api/auth/logout` — logout
- `GET  /api/auth/me` — current user

### Protected (session required)
- `GET/POST/PUT/DELETE /api/cart/**` — cart management
- `GET/POST/DELETE /api/wishlist/**` — wishlist
- `GET/POST /api/orders/**` — orders
- `POST /api/payments/stripe/checkout` — initiate Stripe checkout
- `GET  /api/payments/stripe/status/:id` — payment status

### Admin
- `GET/POST/PUT/DELETE /api/admin/**` — product & inventory management

---

## Bugs Fixed from Original Project

| Bug | File | Fix |
|---|---|---|
| Invisible footer text | `Footer.tsx` | Dark bg with correct white text |
| Collection images not rendering | `FeaturedCollections.tsx` | Fixed conditional + real images |
| Google OAuth wrong endpoint | `auth/page.tsx` | POST to `/api/auth/google` with `access_token` |
| `FOOTER_SECTIONS.company` type error | `constants.ts` | Proper TS typing |
| State update on unmounted component | `CartDrawer.tsx` | `useRef` cleanup pattern |
| Stripe errors not caught | `checkout/page.tsx` | Full try/catch + user feedback |
| CORS wildcard + credentials conflict | `AppConfig.java` | Explicit allowed headers |
| No admin route protection | `SecurityConfig.java` | Route-level permits |

---

*LUMIÈRE © 2026. All rights reserved.*

---

## Admin Dashboard

Access at `/admin` — requires ADMIN role.

**Features:**
- Overview stats (active products, variants, low-stock alerts, open orders)
- Order management — view details, update status (pending → paid → shipped → delivered)
- Product catalogue table with stock levels
- Full inventory table with location, region, stock state, reorder alerts

**Default admin:** `admin@lumiere.fashion` / `Lumiere#2026`

---

## Stripe Webhook Setup

The backend includes `StripeWebhookController` at `POST /api/payments/stripe/webhook`.

**Local testing:**
```bash
# Install Stripe CLI
stripe login
stripe listen --forward-to localhost:8080/api/payments/stripe/webhook
```

Supported events: `checkout.session.completed`, `checkout.session.expired`, `payment_intent.payment_failed`

---

## Docker (Full Stack)

```bash
# Copy and fill in env
cp backend1/.env.example backend1/.env

# Build and start everything
docker compose up --build

# Services:
# → Frontend:  http://localhost:3000
# → Backend:   http://localhost:8080
# → MongoDB:   mongodb://localhost:27017
```

---

## Pages Reference

| Route | Description |
|---|---|
| `/` | Homepage — hero, collections, editorial, lookbook |
| `/shop` | Product listing with filter sidebar |
| `/product/[id]` | Product detail with image gallery |
| `/collections` | All collections grid |
| `/collection/[slug]` | Collection detail |
| `/search` | Search results |
| `/auth` | Login, register, Google OAuth |
| `/account` | Orders, wishlist, profile |
| `/checkout` | 3-step checkout with Stripe |
| `/checkout/success` | Order confirmation |
| `/admin` | Admin dashboard (ADMIN role required) |
| `/about` | Brand story & values |
| `/size-guide` | Size charts & measurement guide |
| `/not-found` | 404 page |

---

## Region & Currency System

12 supported regions with local currency, IP detection, and Stripe-compatible amounts.

| Region | Currency | Symbol |
|---|---|---|
| US | USD | $ |
| GB | GBP | £ |
| EU | EUR | € |
| IN | INR | ₹ |
| JP | JPY | ¥ |
| AU | AUD | A$ |
| CA | CAD | CA$ |
| AE | AED | د.إ |
| SG | SGD | S$ |
| CH | CHF | Fr |
| KR | KRW | ₩ |
| BR | BRL | R$ |

Update `EXCHANGE_RATES` in `src/lib/regions.ts` or swap for a live rate API.

