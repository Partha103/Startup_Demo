# Frontend API Service

This file contains all API calls to the backend.

## Environment Variables

Create a `.env.local` file in the root of the frontend directory:

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Available Endpoints

### Products

- `GET /products` - Get all products
- `GET /products/{id}` - Get product details
- `GET /products/search?q={query}` - Search products
- `GET /collections/{slug}` - Get collection

### Cart

- `POST /cart/add` - Add to cart
- `POST /cart/remove` - Remove from cart
- `PUT /cart/update` - Update cart quantity
- `GET /cart` - Get cart contents

### Orders

- `POST /orders` - Create order
- `GET /orders` - Get user orders
- `GET /orders/{id}` - Get order details

### Auth

- `POST /auth/login` - Login
- `POST /auth/register` - Register
- `POST /auth/logout` - Logout
- `GET /auth/me` - Get current user

### Payments

- `POST /payments/stripe/checkout` - Create Stripe session
- `GET /payments/stripe/status/{sessionId}` - Check payment status

### Wishlist

- `GET /wishlist` - Get user wishlist
- `POST /wishlist/add` - Add to wishlist
- `POST /wishlist/remove` - Remove from wishlist
