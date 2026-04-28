# Backend Integration Guide

## Overview

The RÉBELLION frontend is fully prepared for backend integration. All API calls are centralized in `src/lib/api.ts` with proper error handling and type safety.

## Prerequisites

1. Backend running on `http://localhost:8080`
2. API endpoints available at `/api/*`
3. CORS headers configured on backend
4. JWT authentication (optional but recommended)

## Environment Setup

### Development

Create `.env.local`:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Production

Update environment variables in your deployment platform:

```env
NEXT_PUBLIC_BACKEND_URL=https://api.rebellion.com/api
NEXT_PUBLIC_APP_URL=https://rebellion.com
```

## API Endpoints Expected

### Products

#### `GET /api/products`

Query parameters:

- `page` (number) - Page number
- `limit` (number) - Items per page
- `sort` (string) - Sort field (e.g., "newest", "price")
- `filter` (string) - Filter criteria

Response:

```json
{
  "products": [
    {
      "id": "1",
      "name": "Black Silk Dress",
      "description": "...",
      "price": 189.99,
      "image": "https://...",
      "secondaryImage": "https://...",
      "category": "Dresses",
      "colors": ["Black", "Navy"],
      "sizes": ["XS", "S", "M", "L"],
      "available": 10
    }
  ],
  "total": 100,
  "page": 1,
  "pages": 10
}
```

#### `GET /api/products/:id`

Response:

```json
{
  "id": "1",
  "name": "Black Silk Dress",
  "price": 189.99,
  "description": "Full description...",
  "image": "https://...",
  "images": ["https://...", "https://..."],
  "category": "Dresses",
  "colors": ["Black", "Navy"],
  "sizes": ["XS", "S", "M", "L"],
  "available": 10,
  "fabric": "100% Silk",
  "fit": "Tailored fit",
  "care": "Dry clean only"
}
```

#### `GET /api/products/search?q=query`

Response: Same product list format

### Collections

#### `GET /api/collections`

Response:

```json
[
  {
    "id": "1",
    "slug": "new-arrivals",
    "title": "New Arrivals",
    "description": "Latest collection",
    "image": "https://..."
  }
]
```

#### `GET /api/collections/:slug`

Response:

```json
{
  "id": "1",
  "slug": "new-arrivals",
  "title": "New Arrivals",
  "description": "Latest collection",
  "image": "https://...",
  "products": [...]
}
```

### Cart

#### `GET /api/cart`

Response:

```json
{
  "items": [
    {
      "id": "cart-item-1",
      "productId": "1",
      "name": "Black Silk Dress",
      "price": 189.99,
      "quantity": 2,
      "size": "M",
      "color": "Black",
      "image": "https://..."
    }
  ],
  "subtotal": 379.98,
  "tax": 37.99,
  "total": 417.97
}
```

#### `POST /api/cart/add`

Request:

```json
{
  "productId": "1",
  "quantity": 1,
  "size": "M",
  "color": "Black"
}
```

Response: Updated cart

#### `POST /api/cart/remove`

Request:

```json
{
  "itemId": "cart-item-1"
}
```

#### `PUT /api/cart/update`

Request:

```json
{
  "itemId": "cart-item-1",
  "quantity": 3
}
```

### Orders

#### `POST /api/orders`

Request:

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1-555-000-0000",
  "address": "123 Fashion St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "US",
  "items": [
    {
      "productId": "1",
      "quantity": 2,
      "size": "M",
      "color": "Black",
      "price": 189.99
    }
  ],
  "subtotal": 379.98,
  "tax": 37.99,
  "shipping": 0,
  "total": 417.97
}
```

Response:

```json
{
  "id": "RB-2024-001",
  "status": "pending",
  "items": [...],
  "total": 417.97,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

#### `GET /api/orders`

Response:

```json
[
  {
    "id": "RB-2024-001",
    "status": "delivered",
    "items": [...],
    "total": 417.97,
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

#### `GET /api/orders/:id`

Response:

```json
{
  "id": "RB-2024-001",
  "status": "in-transit",
  "items": [...],
  "shipping": {
    "address": "123 Fashion St",
    "trackingNumber": "TRACK123"
  },
  "total": 417.97
}
```

### Authentication

#### `POST /api/auth/login`

Request:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "1",
    "name": "John Doe",
    "email": "user@example.com"
  }
}
```

#### `POST /api/auth/register`

Request:

```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123"
}
```

Response: Same as login

#### `GET /api/auth/me`

Headers: `Authorization: Bearer {token}`

Response:

```json
{
  "id": "1",
  "name": "John Doe",
  "email": "user@example.com"
}
```

### Payments

#### `POST /api/payments/stripe/checkout`

Request:

```json
{
  "orderId": "RB-2024-001"
}
```

Response:

```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

#### `GET /api/payments/stripe/status/:sessionId`

Response:

```json
{
  "status": "complete",
  "paymentIntentId": "pi_..."
}
```

### Wishlist

#### `GET /api/wishlist`

Response:

```json
[
  {
    "id": "1",
    "name": "Black Silk Dress",
    "price": 189.99,
    "image": "https://..."
  }
]
```

#### `POST /api/wishlist/add`

Request:

```json
{
  "productId": "1"
}
```

#### `POST /api/wishlist/remove`

Request:

```json
{
  "productId": "1"
}
```

## Authentication Flow

### Token Storage

Tokens are stored in `localStorage` under the `token` key:

```javascript
localStorage.setItem('token', 'jwt_token_here');
```

### Token in API Calls

All API calls automatically include the token:

```javascript
headers['Authorization'] = `Bearer ${token}`;
```

### Clearing Token

On logout:

```javascript
localStorage.removeItem('token');
```

## Error Handling

All API errors throw an `ApiError` with structure:

```typescript
class ApiError extends Error {
  statusCode: number;
  message: string;
  data?: any;
}
```

Example handling:

```typescript
try {
  const response = await getProducts();
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`Error ${error.statusCode}: ${error.message}`);
  }
}
```

## Testing with Backend

### 1. Verify Backend Running

```bash
curl http://localhost:8080/api/health
# Should return: 200 OK
```

### 2. Test API Endpoints

```bash
# Get products
curl http://localhost:8080/api/products

# Get single product
curl http://localhost:8080/api/products/1

# Search
curl http://localhost:8080/api/products/search?q=dress
```

### 3. Test with Frontend

1. Start frontend: `npm run dev`
2. Check browser console for API calls
3. Verify data displays correctly
4. Test cart, checkout, account flows

## Common Issues

### CORS Errors

**Problem**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**: Add CORS headers to backend:

```java
// Java/Spring Backend
@Bean
public WebMvcConfigurer corsConfigurer() {
  return new WebMvcConfigurer() {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
      registry
        .addMapping("/api/**")
        .allowedOrigins("http://localhost:3000")
        .allowedMethods("*")
        .allowCredentials(true);
    }
  };
}
```

### Auth Token Not Working

**Problem**: 401 Unauthorized on protected endpoints

**Solution**:

1. Verify token in localStorage
2. Check token format in API requests
3. Verify backend token validation
4. Check token expiration

### API 404 Errors

**Problem**: Endpoints not found

**Solution**:

1. Verify backend running: `curl http://localhost:8080/api/health`
2. Check `NEXT_PUBLIC_BACKEND_URL` in `.env.local`
3. Check backend route configurations
4. Verify route paths match API documentation

### Type Errors in Components

**Problem**: TypeScript errors with API responses

**Solution**:

1. Update types in `src/types/api.ts` to match actual API schema
2. Use `Partial<T>` if some fields are optional
3. Use `Record<string, any>` for dynamic responses

## Deployment

### Environment Variables

Set these in your deployment platform's environment:

```bash
NEXT_PUBLIC_BACKEND_URL=https://api.yoursite.com/api
NEXT_PUBLIC_APP_URL=https://yoursite.com
```

### Vercel Deployment

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy

### Self-Hosted

```bash
npm run build
npm start
```

## Performance Considerations

1. **Paginate Large Lists**: Implement pagination for products, orders
2. **Cache Data**: Use React Query or SWR for caching
3. **Lazy Load Images**: Frontend already implements Next.js Image lazy loading
4. **Rate Limiting**: Implement backend rate limiting
5. **Compression**: Enable gzip on backend

## Security Checklist

- [ ] HTTPS in production
- [ ] CORS configured correctly
- [ ] Token expiration implemented
- [ ] Input validation on backend
- [ ] SQL injection protection
- [ ] XSS protection
- [ ] CSRF tokens if needed
- [ ] Rate limiting enabled
- [ ] Secrets in environment variables
- [ ] API keys secured

## Next Steps

1. Update `src/lib/api.ts` if API responses differ from documentation
2. Update `src/types/api.ts` with actual API models
3. Test each endpoint with backend
4. Implement error handling UI
5. Add loading states to all components
6. Deploy to staging environment
7. Load testing and performance tuning
8. Production deployment

---

For questions or issues, check the backend API logs and frontend browser console.
