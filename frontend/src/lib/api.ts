/**
 * TANTA — Frontend API Service
 * Matches the Spring backend contract under /api.
 */

import { API_BASE } from '@/lib/constants';
import type {
  AddToCartRequest,
  AuthRequest,
  AuthResponse,
  AuthSessionResponse,
  CartItem,
  CheckoutRequest,
  CheckoutSessionResponse,
  Collection,
  CreateOrderRequest,
  CreatedOrderResponse,
  Order,
  PaymentStatusResponse,
  Product,
  ProductFilters,
  User,
  WishlistItem,
} from '@/types/api';

// ── Error class ───────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public override message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ── Core fetch wrapper ────────────────────────────────────────────────────────

async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url     = `${API_BASE}${endpoint}`;
  const headers = new Headers(options.headers);
  const hasBody = options.body !== undefined && options.body !== null;

  if (hasBody && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, { ...options, credentials: 'include', headers });

  if (!response.ok) {
    let errorData: { message?: string };
    try { errorData = await response.json(); }
    catch { errorData = { message: response.statusText }; }
    throw new ApiError(response.status, errorData.message ?? 'API request failed', errorData);
  }

  if (response.status === 204) return undefined as T;

  const ct = response.headers.get('content-type') ?? '';
  if (!ct.includes('application/json')) return undefined as T;
  return response.json() as Promise<T>;
}

// ── URL helpers ───────────────────────────────────────────────────────────────

function appendFilters(params: URLSearchParams, filters?: ProductFilters) {
  if (!filters) return;
  if (filters.category)                    params.append('category', filters.category);
  if (filters.collection_id !== undefined) params.append('collection_id', filters.collection_id.toString());
  if (filters.min_price     !== undefined) params.append('min_price', filters.min_price.toString());
  if (filters.max_price     !== undefined) params.append('max_price', filters.max_price.toString());
  filters.size?.forEach((v) => params.append('size', v));
  filters.color?.forEach((v) => params.append('color', v));
  filters.fit?.forEach((v)  => params.append('fit', v));
}

export function slugifyCollectionName(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// ── Catalogue ─────────────────────────────────────────────────────────────────

export async function getProducts(filters?: ProductFilters) {
  const params = new URLSearchParams();
  appendFilters(params, filters);
  const q = params.toString();
  return apiCall<Product[]>(`/products${q ? `?${q}` : ''}`);
}

export async function getProduct(id: string | number) {
  return apiCall<Product>(`/products/${id}`);
}

export async function searchProducts(query: string) {
  const term     = query.trim().toLowerCase();
  const products = await getProducts();
  if (!term) return products;
  return products.filter((p) => {
    const haystack = [
      p.name, p.description, p.category, p.subcategory, p.fit, p.fabric,
      ...p.colors, ...p.sizes,
    ].filter(Boolean).join(' ').toLowerCase();
    return haystack.includes(term);
  });
}

export async function getCollections() {
  return apiCall<Collection[]>('/collections');
}

export async function getCollection(slug: string) {
  const all = await getCollections();
  return all.find((c) => slugifyCollectionName(c.name) === slug) ?? null;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function login(email: string, password: string) {
  return apiCall<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password } satisfies AuthRequest),
  });
}

export async function register(data: AuthRequest) {
  return apiCall<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(data) });
}

export async function logout() {
  return apiCall<{ message: string }>('/auth/logout', { method: 'POST' });
}

export async function getCurrentUser() {
  return apiCall<User>('/auth/me');
}

/**
 * Google OAuth — POST access_token to backend which verifies via Google UserInfo API.
 * Called from auth/page.tsx after useGoogleLogin() succeeds.
 */
export async function authenticateWithGoogle(accessToken: string) {
  return apiCall<AuthResponse>('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ access_token: accessToken }),
  });
}

// ── Cart ──────────────────────────────────────────────────────────────────────

export async function getCart()              { return apiCall<CartItem[]>('/cart'); }

export async function addToCart(data: AddToCartRequest) {
  return apiCall<{ message: string }>('/cart', { method: 'POST', body: JSON.stringify(data) });
}

export async function removeCartItem(cartItemId: string | number) {
  return apiCall<{ message: string }>(`/cart/${cartItemId}`, { method: 'DELETE' });
}

export async function updateCartQuantity(cartItemId: string | number, quantity: number) {
  return apiCall<{ message: string }>(`/cart/${cartItemId}?quantity=${quantity}`, { method: 'PUT' });
}

// ── Wishlist ──────────────────────────────────────────────────────────────────

export async function getWishlist()              { return apiCall<WishlistItem[]>('/wishlist'); }

export async function addToWishlist(productId: string | number) {
  return apiCall<{ message: string }>(`/wishlist/${productId}`, { method: 'POST' });
}

export async function removeFromWishlist(productId: string | number) {
  return apiCall<{ message: string }>(`/wishlist/${productId}`, { method: 'DELETE' });
}

// ── Orders ────────────────────────────────────────────────────────────────────

export async function getOrders() { return apiCall<Order[]>('/orders'); }

export async function createOrder(data: CreateOrderRequest) {
  return apiCall<CreatedOrderResponse>('/orders', { method: 'POST', body: JSON.stringify(data) });
}

// ── Payments ──────────────────────────────────────────────────────────────────

export async function createStripeCheckout(data: CheckoutRequest) {
  return apiCall<CheckoutSessionResponse>('/payments/stripe/checkout', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function checkPaymentStatus(sessionId: string) {
  return apiCall<PaymentStatusResponse>(`/payments/stripe/status/${sessionId}`);
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export async function getAdminDashboard() {
  return apiCall<{
    active_products: number;
    tracked_variants: number;
    low_stock_alerts: number;
    open_orders: number;
  }>('/admin/dashboard');
}

export async function getAdminProducts() {
  return apiCall<Product[]>('/admin/products');
}

export async function getAdminOrders() {
  return apiCall<Order[]>('/admin/orders');
}

export async function getAdminInventory() {
  return apiCall<unknown[]>('/admin/inventory');
}

export async function getAdminAlerts() {
  return apiCall<unknown[]>('/admin/inventory/alerts');
}

export async function updateOrderTracking(orderId: number, data: { status: string; tracking_status?: string; note?: string }) {
  return apiCall<Order>(`/admin/orders/${orderId}/tracking`, { method: 'PATCH', body: JSON.stringify(data) });
}
