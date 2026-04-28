'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Package, Heart, User, LogOut, Loader } from 'lucide-react';
import { ApiError, getCurrentUser, getOrders, getWishlist, getProducts, logout } from '@/lib/api';
import type { Order, WishlistItem, Product, User as UserType } from '@/types/api';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';
import { useStore } from '@/store/store';
import Link from 'next/link';

type Tab = 'orders' | 'wishlist' | 'profile';

const STATUS_PILL: Record<string, string> = {
  pending:         'bg-amber-50  text-amber-700  border border-amber-200',
  paid:            'bg-blue-50   text-blue-700   border border-blue-200',
  processing:      'bg-purple-50 text-purple-700 border border-purple-200',
  shipped:         'bg-indigo-50 text-indigo-700 border border-indigo-200',
  delivered:       'bg-green-50  text-green-700  border border-green-200',
  cancelled:       'bg-red-50    text-red-700    border border-red-200',
  payment_expired: 'bg-gray-50   text-gray-500   border border-gray-200',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function AccountPage() {
  const router = useRouter();
  const { setUser, setCartCount } = useStore();
  const { format } = useCurrencyFormatter();

  const [tab, setTab]               = useState<Tab>('orders');
  const [loading, setLoading]       = useState(true);
  const [localUser, setLocalUser]   = useState<UserType | null>(null);
  const [orders, setOrders]         = useState<Order[]>([]);
  const [wishlist, setWishlist]     = useState<WishlistItem[]>([]);
  const [wishlistProds, setWishlistProds] = useState<Product[]>([]);

  useEffect(() => {
    let active = true;
    const init = async () => {
      try {
        const u = await getCurrentUser();
        if (!active) return;
        setLocalUser(u); setUser(u);

        const [ord, wl] = await Promise.all([
          getOrders().catch(() => [] as Order[]),
          getWishlist().catch(() => [] as WishlistItem[]),
        ]);
        if (!active) return;
        setOrders(ord); setWishlist(wl);

        if (wl.length > 0) {
          const prods = await getProducts().catch(() => [] as Product[]);
          if (active) setWishlistProds(prods.filter((p) => wl.some((w) => w.product_id === p.product_id)));
        }
      } catch (err) {
        if (!active) return;
        if (err instanceof ApiError && err.statusCode === 401) router.push('/auth');
      } finally {
        if (active) setLoading(false);
      }
    };
    void init();
    return () => { active = false; };
  }, [router, setUser]);

  const handleLogout = async () => {
    await logout().catch(() => {});
    setUser(null); setCartCount(0);
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-ivory)' }}>
        <Loader size={26} className="animate-spin text-[#c9a96e]" />
      </div>
    );
  }

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'orders',   label: 'My Orders', icon: <Package size={14} /> },
    { id: 'wishlist', label: 'Wishlist',   icon: <Heart size={14} /> },
    { id: 'profile',  label: 'Profile',   icon: <User size={14} /> },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-ivory)' }}>

      {/* Header */}
      <div className="px-container py-12 border-b border-white/10" style={{ background: '#0a0a0a' }}>
        <div className="max-w-4xl mx-auto flex items-end justify-between">
          <div>
            <p className="font-body text-xs tracking-[0.25em] text-[#c9a96e] mb-2">MY ACCOUNT</p>
            <h1 className="font-display text-3xl font-light text-white">
              Welcome, {localUser?.name?.split(' ')[0] ?? 'Guest'}
            </h1>
            <p className="font-body text-sm text-white/40 mt-1">{localUser?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="hidden md:flex items-center gap-2 font-body text-xs tracking-[0.15em] text-white/40 hover:text-white transition-colors"
          >
            <LogOut size={13} /> SIGN OUT
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-[#e5e0d8] sticky top-[88px] z-20">
        <div className="px-container max-w-4xl mx-auto flex">
          {TABS.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-5 py-4 font-body text-xs tracking-[0.15em] border-b-2 transition-all ${
                tab === id ? 'border-[#c9a96e] text-[#0a0a0a]' : 'border-transparent text-[#6b7280] hover:text-[#0a0a0a]'
              }`}
            >
              {icon} {label.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="px-container py-10 max-w-4xl mx-auto">

        {/* Orders */}
        {tab === 'orders' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <Package size={36} className="text-[#e5e0d8] mb-4" />
                <p className="font-display text-2xl font-light mb-2">No orders yet</p>
                <p className="font-body text-sm text-[#6b7280] mb-6">Your orders will appear here</p>
                <Link href="/shop" className="px-8 py-3 bg-[#0a0a0a] text-white font-body text-xs tracking-[0.2em]">
                  SHOP NOW
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.order_id} className="bg-white border border-[#e5e0d8] p-6">
                    <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                      <div>
                        <p className="font-body text-xs tracking-[0.15em] text-[#6b7280]">
                          ORDER #{order.order_id}
                        </p>
                        <p className="font-body text-xs text-[#9ca3af] mt-0.5">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 font-body text-[10px] tracking-[0.12em] rounded-full ${STATUS_PILL[order.status] ?? STATUS_PILL['pending']}`}>
                          {order.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="font-body text-sm font-medium">{format(order.total_amount)}</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      {order.items.map((item) => (
                        <div key={item.order_item_id} className="flex justify-between font-body text-sm">
                          <span className="text-[#6b7280]">
                            {item.name} — {item.size} / {item.color}
                          </span>
                          <span className="text-[#6b7280] ml-4 flex-shrink-0">
                            ×{item.quantity} · {format(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                    {order.shipping_address && (
                      <p className="mt-3 font-body text-xs text-[#9ca3af]">
                        Shipping to: {order.shipping_address.name}, {order.shipping_address.city}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Wishlist */}
        {tab === 'wishlist' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {wishlistProds.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <Heart size={36} className="text-[#e5e0d8] mb-4" />
                <p className="font-display text-2xl font-light mb-2">Your wishlist is empty</p>
                <p className="font-body text-sm text-[#6b7280] mb-6">Save pieces you love to revisit later</p>
                <Link href="/shop" className="px-8 py-3 bg-[#0a0a0a] text-white font-body text-xs tracking-[0.2em]">
                  EXPLORE
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {wishlistProds.map((p, i) => (
                  <Link key={p.product_id} href={`/product/${p.product_id}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="group"
                    >
                      <div className="relative overflow-hidden mb-3" style={{ paddingBottom: '130%' }}>
                        <img
                          src={p.images?.[0] ?? 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=500&q=60'}
                          alt={p.name}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                      <p className="font-display text-sm font-medium group-hover:text-[#c9a96e] transition-colors line-clamp-1">
                        {p.name}
                      </p>
                      <p className="font-body text-sm text-[#6b7280]">{format(p.price)}</p>
                    </motion.div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Profile */}
        {tab === 'profile' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md">
            <h2 className="font-display text-2xl font-light mb-8">Profile Details</h2>
            <div className="space-y-4 mb-8">
              {[
                { label: 'Full Name',      value: localUser?.name   ?? '—' },
                { label: 'Email Address',  value: localUser?.email  ?? '—' },
                { label: 'Region',         value: localUser?.region ?? 'Global' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="font-body text-[10px] tracking-[0.2em] text-[#6b7280] mb-1.5 uppercase">{label}</p>
                  <div className="px-4 py-3.5 border border-[#e5e0d8] bg-white font-body text-sm">{value}</div>
                </div>
              ))}
            </div>

            <div className="p-5 border border-[#e5e0d8] bg-white mb-8">
              <p className="font-body text-[10px] tracking-[0.15em] text-[#6b7280] mb-1">MEMBERSHIP</p>
              <p className="font-body text-sm font-medium text-[#c9a96e]">
                {localUser?.roles?.includes('ADMIN') ? '✦ TANTA Admin' : '✦ TANTA Member'}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 font-body text-xs tracking-[0.15em] text-[#6b7280] hover:text-red-500 transition-colors"
            >
              <LogOut size={13} /> Sign out of your account
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
