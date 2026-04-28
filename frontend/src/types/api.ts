export interface Product {
  product_id: number;
  collection_id: number;
  sku: string;
  name: string;
  description: string;
  price: number;
  category: string;
  subcategory: string;
  fit?: string;
  fabric?: string;
  status: string;
  colors: string[];
  sizes: string[];
  images: string[];
  regions: string[];
  total_available: number;
  variants: ProductVariant[];
}

export interface ProductVariant {
  sku: string;
  size: string;
  color: string;
  price: number;
  available_stock: number;
  reserved_stock: number;
  available: boolean;
}

export interface CartItem {
  cart_item_id: number;
  product_id: number;
  size: string;
  color: string;
  quantity: number;
  available_stock: number;
}

export interface WishlistItem {
  wishlist_id: number;
  product_id: number;
}

export interface Order {
  order_id: number;
  total_amount: number;
  status: string;
  payment_method: string;
  shipping_address: ShippingAddress;
  created_at: string;
  items: OrderItem[];
  tracking_status?: string;
  fulfillment_source?: string;
  fulfillment_type?: string;
  status_history: OrderStatusEvent[];
}

export interface OrderItem {
  order_item_id: number;
  product_id: number;
  name: string;
  quantity: number;
  price: number;
  size: string;
  color: string;
  source_location?: string;
}

export interface Collection {
  collection_id: number;
  name: string;
  description?: string;
  image?: string;
  products_count: number;
}

export interface User {
  user_id: number;
  name: string;
  email: string;
  roles: string[];
  region?: string;
}

export interface ShippingAddress {
  name: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
}

export interface OrderStatusEvent {
  status: string;
  tracking_status?: string;
  note?: string;
  created_at: string;
}

export interface AuthResponse {
  session_token: string;
  user: User;
}

export interface AuthSessionResponse {
  session_token: string;
  user_id: number;
  name: string;
  email: string;
  roles: string[];
  region?: string;
}

export interface CreatedOrderResponse {
  order_id: number;
}

export interface CheckoutSessionResponse {
  session_id: string;
  checkout_url: string;
}

export interface PaymentStatusResponse {
  session_id: string;
  order_id: number;
  status: string;
  payment_status: string;
}

export interface ProductFilters {
  category?: string;
  collection_id?: number;
  min_price?: number;
  max_price?: number;
  size?: string[];
  color?: string[];
  fit?: string[];
}

export interface AuthRequest {
  name?: string;
  email: string;
  password: string;
}

export interface AddToCartRequest {
  product_id: number;
  size: string;
  color: string;
  quantity: number;
}

export interface CreateOrderItem {
  product_id: number;
  name: string;
  quantity: number;
  price: number;
  size: string;
  color: string;
}

export interface CreateOrderRequest {
  items: CreateOrderItem[];
  total_amount: number;
  shipping_address: ShippingAddress;
  payment_method: string;
}

export interface CheckoutRequest {
  order_id: number;
  amount: number;
  currency: string;
}
