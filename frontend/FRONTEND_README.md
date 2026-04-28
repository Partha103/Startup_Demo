# RÉBELLION Frontend

A premium luxury fashion e-commerce frontend built with Next.js, React, Tailwind CSS, and Framer Motion.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **React**: 19+
- **Styling**: Tailwind CSS 3.4
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Language**: TypeScript
- **fonts**: Playfair Display, Poppins, JetBrains Mono

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Backend API running on `http://localhost:8080/api`

### Installation

1. Install dependencies:

```bash
npm install
# or
yarn install
```

1. Create environment variables:

```bash
cp .env.example .env.local
```

1. Start the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```bash
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Homepage
│   ├── shop/              # Product listing
│   ├── product/[id]/      # Product detail
│   ├── checkout/          # Checkout flow
│   ├── account/           # Account pages
│   ├── auth/              # Login/register
│   ├── collection/        # Collection pages
│   └── search/            # Search results
├── components/            # Reusable components
│   ├── layout/           # Layout components (Nav, Footer, etc)
│   ├── sections/         # Page sections (Hero, Collections, etc)
│   ├── common/           # Common components (Card, Button, etc)
│   └── cart/             # Cart-related components
├── lib/                   # Utilities and helpers
│   ├── api.ts            # API service
│   ├── utils.ts          # Helper functions
│   └── constants.ts      # Constants and configuration
├── store/                # Zustand store
├── types/                # TypeScript types
└── styles/               # Global styles
```

## Key Features

### Design System

- **Color Palette**: rebellion-black, rebellion-white, rebellion-red, rebellion-gold
- **Typography**: Editorial typography with Playfair Display headings
- **Spacing**: Consistent spacing system with container utilities
- **Animations**: Smooth Framer Motion animations (transform + opacity only)

### Pages

- **Homepage**: Editorial hero, featured collections, lookbook, CTA sections
- **Shop**: Advanced filtering with sidebar, responsive grid
- **Product Detail**: Image gallery, size/color selection, related items
- **Checkout**: Multi-step form with order summary
- **Account**: Profile, order history, wishlist
- **Collections**: Dynamic collection pages with filtering
- **Search**: Full-text search with suggestions

### Components

- **Navigation**: Sticky header with mobile menu, search, cart
- **Footer**: Multi-column footer with newsletter, social links
- **ProductCard**: Reusable product tile with hover effects
- **CartDrawer**: Slide-in cart with quantity controls
- **SkeletonLoader**: Loading states for better UX
- **SearchBar**: Modal search with suggestions

## API Integration

All API calls are handled through `src/lib/api.ts`. The backend should be running at the URL specified in `NEXT_PUBLIC_BACKEND_URL`.

### Auth

- Login/Register with email and password
- Token stored in localStorage
- Auto-attach token to all API requests

### Products

- Fetch products with pagination, filtering, sorting
- Search functionality with suggestions
- Detailed product information with variants

### Cart & Orders

- Add/remove items from cart
- Manage quantities
- Create orders via checkout
- Track order status

### Wishlist

- Add/remove items from wishlist
- Persistent across sessions

## Performance Optimization

- Next.js Image component with WebP/AVIF formats
- Code splitting by route
- Server-side rendering for SEO
- CSS-in-JS with Tailwind (zero runtime overhead)
- Framer Motion animations with GPU acceleration

### Lighthouse Audits

Target scores:

- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 100

## Environment Variables

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Building for Production

```bash
npm run build
npm start
```

Or deploy to Vercel:

```bash
vercel deploy
```

## Development

### Add a New Page

1. Create a new directory in `src/app/`
2. Add a `page.tsx` file
3. Use the existing component patterns

### Add a New Component

1. Create a new file in `src/components/`
2. Export the component
3. Import and use in pages

### Update the Store

Edit `src/store/store.ts` to add new state or actions.

### Styling

- Use Tailwind CSS utilities
- Custom colors available in `tailwind.config.js`
- Global styles in `src/styles/globals.css`

## Troubleshooting

### API Errors

- Ensure backend is running on `http://localhost:8080/api`
- Check `NEXT_PUBLIC_BACKEND_URL` in `.env.local`
- Check browser console for error details

### Build Issues

- Clear `.next` directory: `rm -rf .next`
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

### Port Already in Use

By default, Next.js uses port 3000. Use `-p` flag to change:

```bash
npm run dev -- -p 3001
```

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

## License

© 2024 RÉBELLION. All rights reserved.
