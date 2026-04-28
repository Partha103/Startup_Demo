'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, ShoppingBag, AlertTriangle, BarChart3,
  Loader, LogOut, RefreshCw, CheckCircle, XCircle,
  ChevronDown, ChevronRight, Users, Eye,
} from 'lucide-react';
import {
  ApiError, getCurrentUser, logout,
  getAdminDashboard, getAdminProducts, getAdminOrders,
  getAdminInventory, getAdminAlerts, updateOrderTracking,
} from '@/lib/api';
import type { Product, Order, User } from '@/types/api';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';
import { useStore } from '@/store/store';
import Link from 'next/link';

type Tab = 'overview' | 'orders' | 'products' | 'inventory';

interface DashboardStats {
  active_products: number;
  tracked_variants: number;
  low_stock_alerts: number;
  open_orders: number;
}

interface InventoryRecord {
  product_id: number;
  sku: string;
  product_name: string;
  size: string;
  color: string;
  location_code: string;
  region: string;
  available_quantity: number;
  reorder_threshold: number;
  stock_state: string;
}

const ORDER_STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];

const STATUS_COLORS: Record<string, string> = {
  pending:    'bg-amber-50 text-amber-700 border border-amber-200',
  paid:       'bg-blue-50 text-blue-700 border border-blue-200',
  processing: 'bg-purple-50 text-purple-700 border border-purple-200',
  shipped:    'bg-indigo-50 text-indigo-700 border border-indigo-200',
  delivered:  'bg-green-50 text-green-700 border border-green-200',
  cancelled:  'bg-red-50 text-red-700 border border-red-200',
  payment_expired: 'bg-gray-50 text-gray-500 border border-gray-200',
};

export default function AdminPage() {
  const router = useRouter();
  const { setUser } = useStore();
  const { format }   = useCurrencyFormatter();

  const [tab, setTab]           = useState<Tab>('overview');
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { format } = useCurrencyFormatter();
  const [stats, setStats]           = useState<DashboardStats | null>(null);
  const [products, setProducts]     = useState<Product[]>([]);
  const [orders, setOrders]         = useState<Order[]>([]);
  const [inventory, setInventory]   = useState<InventoryRecord[]>([]);
  const [alerts, setAlerts]         = useState<InventoryRecord[]>([]);

  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [updatingOrder, setUpdatingOrder] = useState<number | null>(null);
  const [orderSearch, setOrderSearch]     = useState('');
  const [productSearch, setProductSearch] = useState('');

  // ── Auth guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    let active = true;
    const init = async () => {
      try {
        const user = await getCurrentUser();
        if (!active) return;
        if (!user.roles?.includes('ADMIN')) {
          router.push('/');
          return;
        }
        setAdminUser(user);
        setUser(user);
        await loadAll();
      } catch (err) {
        if (!active) return;
        if (err instanceof ApiError && err.statusCode === 401) {
          router.push('/auth');
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    void init();
    return () => { active = false; };
  }, [router, setUser]); // eslint-disable-line

  // ── Data loader ─────────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    const [s, p, o, inv, al] = await Promise.allSettled([
      getAdminDashboard(),
      getAdminProducts(),
      getAdminOrders(),
      getAdminInventory() as Promise<InventoryRecord[]>,
      getAdminAlerts()    as Promise<InventoryRecord[]>,
    ]);
    if (s.status === 'fulfilled')   setStats(s.value);
    if (p.status === 'fulfilled')   setProducts(p.value);
    if (o.status === 'fulfilled')   setOrders(o.value);
    if (inv.status === 'fulfilled') setInventory(inv.value);
    if (al.status === 'fulfilled')  setAlerts(al.value);
  }, []);

  const refresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await logout().catch(() => {});
    setUser(null);
    router.push('/');
  };

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    setUpdatingOrder(orderId);
    try {
      await updateOrderTracking(orderId, { status: newStatus });
      setOrders((prev) => prev.map((o) => o.order_id === orderId ? { ...o, status: newStatus } : o));
    } catch { /* ignore */ }
    finally { setUpdatingOrder(null); }
  };

  // ── Filtered data ───────────────────────────────────────────────────────────
  const filteredOrders = orders.filter((o) =>
    !orderSearch || String(o.order_id).includes(orderSearch) || o.status.includes(orderSearch.toLowerCase())
  );

  const filteredProducts = products.filter((p) =>
    !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.sku?.toLowerCase().includes(productSearch.toLowerCase())
  );

  // ── Loading / unauthorized ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-ivory)' }}>
        <Loader size={28} className="animate-spin text-[#c9a96e]" />
      </div>
    );
  }

  // ── Tabs config ─────────────────────────────────────────────────────────────
  const TABS: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview',   label: 'Overview',   icon: <BarChart3 size={15} />, },
    { id: 'orders',     label: 'Orders',     icon: <ShoppingBag size={15} />, badge: stats?.open_orders },
    { id: 'products',   label: 'Products',   icon: <Package size={15} /> },
    { id: 'inventory',  label: 'Inventory',  icon: <AlertTriangle size={15} />, badge: alerts.length || undefined },
  ];

  const statCards = [
    { label: 'Active Products', value: stats?.active_products ?? '—', icon: <Package size={20} />, color: '#c9a96e' },
    { label: 'Tracked Variants',value: stats?.tracked_variants ?? '—', icon: <Users size={20} />,   color: '#1D9E75' },
    { label: 'Low Stock Alerts',value: stats?.low_stock_alerts ?? '—', icon: <AlertTriangle size={20} />, color: '#E24B4A' },
    { label: 'Open Orders',     value: stats?.open_orders ?? '—',      icon: <ShoppingBag size={20} />, color: '#378ADD' },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-ivory)' }}>

      {/* ── Sidebar ── */}
      <div className="fixed left-0 top-0 bottom-0 w-56 bg-[#0a0a0a] flex flex-col z-40">
        <div className="px-6 py-6 border-b border-white/10">
          <Link href="/" className="font-display text-lg tracking-[0.3em] text-[#c9a96e]">TANTA</Link>
          <p className="font-body text-[10px] tracking-[0.15em] text-white/30 mt-1">ADMIN</p>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          {TABS.map(({ id, label, icon, badge }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all ${
                tab === id
                  ? 'bg-[#c9a96e] text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              {icon}
              <span className="font-body text-xs tracking-[0.1em]">{label.toUpperCase()}</span>
              {badge != null && badge > 0 && (
                <span className="ml-auto w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="px-3 pb-6 space-y-2">
          <Link href="/" className="w-full flex items-center gap-3 px-3 py-2.5 text-white/30 hover:text-white transition-colors">
            <Eye size={15} />
            <span className="font-body text-xs tracking-[0.1em]">VIEW STORE</span>
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-white/30 hover:text-red-400 transition-colors">
            <LogOut size={15} />
            <span className="font-body text-xs tracking-[0.1em]">SIGN OUT</span>
          </button>
        </div>
      </div>

      {/* ── Main ── */}
      <div className="ml-56 min-h-screen">

        {/* Top bar */}
        <div className="bg-white border-b border-[#e5e0d8] px-8 py-4 flex items-center justify-between sticky top-0 z-30">
          <div>
            <h1 className="font-display text-xl font-light">
              {TABS.find((t) => t.id === tab)?.label}
            </h1>
            <p className="font-body text-xs text-[#6b7280]">Signed in as {adminUser?.email}</p>
          </div>
          <button
            onClick={refresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 border border-[#e5e0d8] hover:border-[#c9a96e] font-body text-xs tracking-[0.1em] transition-all"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} /> REFRESH
          </button>
        </div>

        <div className="p-8">

          {/* ── OVERVIEW ── */}
          {tab === 'overview' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Stat cards */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
                {statCards.map(({ label, value, icon, color }) => (
                  <div key={label} className="bg-white border border-[#e5e0d8] p-6">
                    <div className="flex items-center justify-between mb-4">
                      <p className="font-body text-xs tracking-[0.1em] text-[#6b7280]">{label.toUpperCase()}</p>
                      <div style={{ color }}>{icon}</div>
                    </div>
                    <p className="font-display text-4xl font-light" style={{ color }}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Recent orders */}
              <div className="bg-white border border-[#e5e0d8] p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-display text-lg font-medium">Recent Orders</h2>
                  <button onClick={() => setTab('orders')} className="font-body text-xs text-[#c9a96e] hover:underline flex items-center gap-1">
                    View all <ChevronRight size={12} />
                  </button>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#e5e0d8]">
                      {['Order', 'Total', 'Status', 'Items'].map((h) => (
                        <th key={h} className="text-left pb-3 font-body text-[10px] tracking-[0.15em] text-[#6b7280]">{h.toUpperCase()}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 8).map((order) => (
                      <tr key={order.order_id} className="border-b border-[#f7f4ef] last:border-0">
                        <td className="py-3 font-body text-xs font-medium">#{order.order_id}</td>
                        <td className="py-3 font-body text-xs">{format(order.total_amount)}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 font-body text-[10px] tracking-[0.1em] rounded-full ${STATUS_COLORS[order.status] ?? STATUS_COLORS['pending']}`}>
                            {order.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 font-body text-xs text-[#6b7280]">{order.items?.length ?? 0} items</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {orders.length === 0 && (
                  <p className="text-center py-8 font-body text-sm text-[#6b7280]">No orders yet</p>
                )}
              </div>

              {/* Low stock alerts in overview */}
              {alerts.length > 0 && (
                <div className="mt-5 bg-red-50 border border-red-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle size={16} className="text-red-500" />
                    <h2 className="font-display text-lg font-medium text-red-700">{alerts.length} Low Stock Alerts</h2>
                  </div>
                  <div className="space-y-2">
                    {alerts.slice(0, 5).map((a, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-red-100 last:border-0">
                        <div>
                          <span className="font-body text-xs font-medium text-red-800">{a.product_name}</span>
                          <span className="font-body text-xs text-red-500 ml-2">{a.size} / {a.color}</span>
                        </div>
                        <span className="font-body text-xs text-red-600 font-medium">
                          {a.available_quantity} left (min {a.reorder_threshold})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── ORDERS ── */}
          {tab === 'orders' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="mb-5 flex gap-3">
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search order # or status…"
                  className="px-4 py-2.5 border border-[#e5e0d8] focus:border-[#c9a96e] outline-none font-body text-sm bg-white w-64"
                />
                <p className="self-center font-body text-xs text-[#6b7280]">{filteredOrders.length} orders</p>
              </div>

              <div className="space-y-3">
                {filteredOrders.length === 0 ? (
                  <div className="bg-white border border-[#e5e0d8] p-10 text-center">
                    <p className="font-display text-xl font-light text-[#6b7280]">No orders found</p>
                  </div>
                ) : (
                  filteredOrders.map((order) => (
                    <div key={order.order_id} className="bg-white border border-[#e5e0d8]">
                      {/* Order header */}
                      <div
                        className="flex items-center justify-between p-5 cursor-pointer hover:bg-[#f7f4ef] transition-colors"
                        onClick={() => setExpandedOrder(expandedOrder === order.order_id ? null : order.order_id)}
                      >
                        <div className="flex items-center gap-6">
                          <span className="font-body text-xs font-medium w-16">#{order.order_id}</span>
                          <span className="font-body text-sm font-medium">{format(order.total_amount)}</span>
                          <span className={`px-2 py-1 font-body text-[10px] tracking-[0.1em] rounded-full ${STATUS_COLORS[order.status] ?? STATUS_COLORS['pending']}`}>
                            {order.status.toUpperCase()}
                          </span>
                          <span className="font-body text-xs text-[#6b7280] hidden md:block">
                            {order.items?.length ?? 0} items
                          </span>
                          <span className="font-body text-xs text-[#6b7280] hidden lg:block">
                            {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          {/* Status changer */}
                          <select
                            value={order.status}
                            onChange={(e) => { e.stopPropagation(); handleStatusUpdate(order.order_id, e.target.value); }}
                            onClick={(e) => e.stopPropagation()}
                            disabled={updatingOrder === order.order_id}
                            className="font-body text-xs border border-[#e5e0d8] px-2 py-1.5 bg-white focus:border-[#c9a96e] outline-none"
                          >
                            {ORDER_STATUSES.map((s) => (
                              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                          </select>
                          {updatingOrder === order.order_id ? (
                            <Loader size={14} className="animate-spin text-[#c9a96e]" />
                          ) : (
                            <motion.div animate={{ rotate: expandedOrder === order.order_id ? 180 : 0 }}>
                              <ChevronDown size={15} className="text-[#6b7280]" />
                            </motion.div>
                          )}
                        </div>
                      </div>

                      {/* Expanded order detail */}
                      <AnimatePresence>
                        {expandedOrder === order.order_id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden border-t border-[#e5e0d8]"
                          >
                            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Items */}
                              <div>
                                <p className="font-body text-[10px] tracking-[0.15em] text-[#6b7280] mb-3">ORDER ITEMS</p>
                                <div className="space-y-2">
                                  {order.items?.map((item) => (
                                    <div key={item.order_item_id} className="flex justify-between font-body text-xs">
                                      <span className="text-[#0a0a0a]">{item.name} — {item.size} / {item.color}</span>
                                      <span className="text-[#6b7280]">×{item.quantity} · {format(item.price * item.quantity)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Shipping + history */}
                              <div>
                                <p className="font-body text-[10px] tracking-[0.15em] text-[#6b7280] mb-3">SHIPPING</p>
                                {order.shipping_address && (
                                  <div className="font-body text-xs text-[#6b7280] space-y-0.5 mb-4">
                                    <p className="text-[#0a0a0a] font-medium">{order.shipping_address.name}</p>
                                    <p>{order.shipping_address.address}</p>
                                    <p>{order.shipping_address.city}{order.shipping_address.postal_code ? `, ${order.shipping_address.postal_code}` : ''}</p>
                                    <p>{order.shipping_address.country}</p>
                                  </div>
                                )}
                                {order.status_history && order.status_history.length > 0 && (
                                  <>
                                    <p className="font-body text-[10px] tracking-[0.15em] text-[#6b7280] mb-2">STATUS HISTORY</p>
                                    <div className="space-y-1">
                                      {order.status_history.slice(-4).reverse().map((e, i) => (
                                        <div key={i} className="flex items-center gap-2 font-body text-xs text-[#6b7280]">
                                          <div className="w-1.5 h-1.5 rounded-full bg-[#c9a96e] flex-shrink-0" />
                                          <span className="capitalize">{e.status}</span>
                                          {e.note && <span className="text-[#9ca3af]">— {e.note}</span>}
                                        </div>
                                      ))}
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* ── PRODUCTS ── */}
          {tab === 'products' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="mb-5 flex gap-3">
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search name or SKU…"
                  className="px-4 py-2.5 border border-[#e5e0d8] focus:border-[#c9a96e] outline-none font-body text-sm bg-white w-64"
                />
                <p className="self-center font-body text-xs text-[#6b7280]">{filteredProducts.length} products</p>
              </div>

              <div className="bg-white border border-[#e5e0d8] overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[#f7f4ef]">
                    <tr>
                      {['SKU', 'Product', 'Category', 'Price', 'Stock', 'Status'].map((h) => (
                        <th key={h} className="text-left px-4 py-3 font-body text-[10px] tracking-[0.15em] text-[#6b7280]">{h.toUpperCase()}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product, idx) => (
                      <tr key={product.product_id} className={`border-t border-[#f7f4ef] ${idx % 2 === 0 ? '' : 'bg-[#fafaf8]'}`}>
                        <td className="px-4 py-3 font-body text-xs text-[#6b7280]">{product.sku}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {product.images?.[0] && (
                              <img src={product.images[0]} alt="" className="w-8 h-10 object-cover flex-shrink-0" />
                            )}
                            <div>
                              <p className="font-body text-xs font-medium">{product.name}</p>
                              <p className="font-body text-[10px] text-[#6b7280]">
                                {product.colors?.length} colours · {product.sizes?.length} sizes
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-body text-xs text-[#6b7280] capitalize">{product.category}</td>
                        <td className="px-4 py-3 font-body text-xs">{format(product.price)}</td>
                        <td className="px-4 py-3">
                          <span className={`font-body text-xs font-medium ${product.total_available > 5 ? 'text-green-600' : product.total_available > 0 ? 'text-amber-600' : 'text-red-500'}`}>
                            {product.total_available} units
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 font-body text-[10px] rounded-full ${product.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-500 border border-gray-200'}`}>
                            {product.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredProducts.length === 0 && (
                  <p className="text-center py-10 font-body text-sm text-[#6b7280]">No products found</p>
                )}
              </div>
            </motion.div>
          )}

          {/* ── INVENTORY ── */}
          {tab === 'inventory' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Alerts banner */}
              {alerts.length > 0 && (
                <div className="mb-6 bg-red-50 border border-red-200 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle size={15} className="text-red-500" />
                    <p className="font-body text-sm font-medium text-red-700">{alerts.length} items below reorder threshold</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {alerts.map((a, i) => (
                      <div key={i} className="flex items-center justify-between px-4 py-2.5 bg-white border border-red-100">
                        <div>
                          <span className="font-body text-xs font-medium text-red-800">{a.product_name}</span>
                          <span className="font-body text-xs text-red-400 ml-2">{a.size} / {a.color}</span>
                          <span className="font-body text-xs text-red-400 ml-2">@ {a.location_code}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-body text-xs font-medium text-red-600">{a.available_quantity} left</p>
                          <p className="font-body text-[10px] text-red-400">min {a.reorder_threshold}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Full inventory table */}
              <div className="bg-white border border-[#e5e0d8] overflow-auto">
                <table className="w-full min-w-[700px]">
                  <thead className="bg-[#f7f4ef]">
                    <tr>
                      {['SKU', 'Product', 'Variant', 'Location', 'Region', 'Available', 'Reserved', 'State'].map((h) => (
                        <th key={h} className="text-left px-3 py-3 font-body text-[10px] tracking-[0.15em] text-[#6b7280]">{h.toUpperCase()}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((row, i) => (
                      <tr key={i} className={`border-t border-[#f7f4ef] ${i % 2 === 0 ? '' : 'bg-[#fafaf8]'}`}>
                        <td className="px-3 py-2.5 font-body text-[11px] text-[#6b7280]">{row.sku}</td>
                        <td className="px-3 py-2.5 font-body text-xs">{row.product_name}</td>
                        <td className="px-3 py-2.5 font-body text-xs text-[#6b7280]">{row.size} / {row.color}</td>
                        <td className="px-3 py-2.5 font-body text-[11px] text-[#6b7280]">{row.location_code}</td>
                        <td className="px-3 py-2.5 font-body text-[11px] text-[#6b7280]">{row.region}</td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <span className={`font-body text-xs font-medium ${
                              row.available_quantity > row.reorder_threshold ? 'text-green-600' :
                              row.available_quantity > 0 ? 'text-amber-600' : 'text-red-500'
                            }`}>
                              {row.available_quantity}
                            </span>
                            {row.available_quantity <= row.reorder_threshold && row.available_quantity > 0 && (
                              <AlertTriangle size={11} className="text-amber-500" />
                            )}
                            {row.available_quantity === 0 && (
                              <XCircle size={11} className="text-red-500" />
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2.5 font-body text-xs text-[#6b7280]">{(row as any).reserved_quantity ?? 0}</td>
                        <td className="px-3 py-2.5">
                          <span className={`px-2 py-0.5 font-body text-[10px] rounded-full ${
                            row.stock_state === 'HEALTHY' ? 'bg-green-50 text-green-700' :
                            row.stock_state === 'LOW'     ? 'bg-amber-50 text-amber-700' :
                            'bg-red-50 text-red-600'
                          }`}>
                            {row.stock_state ?? 'UNKNOWN'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {inventory.length === 0 && (
                  <p className="text-center py-10 font-body text-sm text-[#6b7280]">No inventory records</p>
                )}
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
