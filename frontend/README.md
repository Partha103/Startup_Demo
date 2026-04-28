# Rebellion Frontend - Next.js 15 E-Commerce App

Production-ready Next.js 15 app with TypeScript, Tailwind CSS, shadcn/ui, and Zustand state management.

## Features
- App Router (Next.js 13+)
- TypeScript strict mode
- Tailwind CSS + shadcn/ui components
- Framer Motion animations
- Zustand for global state (cart, auth)
- Server Components + Suspense
- Optimized images (remote patterns for backend)
- SEO optimized (metadata, OG images)

## Tech Stack
- Next.js 15.0.0
- React 19.0.0
- TypeScript 5.3.3
- Tailwind CSS 3.4.1
- shadcn/ui components
- Zustand 4.4.7
- Lucide React icons
- Framer Motion animations

## Quick Start

### Prerequisites
- Node.js 20+

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open http://localhost:3000

### 3. Build for Production
```bash
npm run build
npm start
```

### 4. Lint & Type Check
```bash
npm run lint
```

## Backend Integration
- Backend runs on http://localhost:8080
- CORS configured in next.config.js
- API calls via @/lib/api.ts
- Backend API docs: http://localhost:8080/swagger-ui.html

## Project Structure
```
frontend/src/
├── app/                 # App Router pages + layouts
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page
│   ├── shop/            # Shop pages
│   ├── product/         # Product detail
│   └── account/         # Account pages
├── components/          # UI components (shadcn + custom)
├── lib/                 # Utilities, API client
├── store/               # Zustand stores
└── styles/              # Global CSS (globals.css)
```

## Scripts
- `npm run dev` - Development server (3000)
- `npm run build` - Production build
- `npm run start` - Production server
- `npm run lint` - ESLint check

## Deployment
Recommended: Vercel (Next.js optimized)

## Troubleshooting
- **Build fails**: Check Node version >=20
- **Tailwind missing**: Restart dev server after component install
- **Backend connection**: Ensure backend running on 8080

Clean Next.js migration complete! 🚀
