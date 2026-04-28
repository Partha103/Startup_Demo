'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Minus, Plus, ShoppingBag, X, Loader } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { ApiError, getCart, getProduct, removeCartItem, updateCartQuantity } from '@/lib/api';
import type { CartItem, Product } from '@/types/api';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';
import { useStore } from '@/store/store';

interface DisplayItem extends CartItem {
  name:      string;
  image?:    string;
  unitPrice: number;
}

function resolveUnitPrice(p: Product | undefined, item: CartItem): number {
  if (!p) return 0;
  return p.variants.find((v) => v.size === item.size && v.color === item.color)?.price ?? p.price;
}

export default function CartDrawer() {
  const [items,   setItems]   = useState<DisplayItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const { isCartOpen, setCartOpen, setCartCount } = useStore();
  const { format } = useCurrencyFormatter();

  const loadCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cartData = await getCart();
      const ids = [...new Set(cartData.map((i) => i.product_id))];
      const pMap = new Map<number, Product>();
      await Promise.allSettled(
        ids.map(async (id) => {
          try { pMap.set(id, await getProduct(id)); } catch { /* skip */ }
        })
      );
      const display: DisplayItem[] = cartData.map((item) => {
        const p = pMap.get(item.product_id);
        return { ...item, name: p?.name ?? 'Product', image: p?.images?.[0], unitPrice: resolveUnitPrice(p, item) };
      });
      setItems(display);
      setCartCount(display.reduce((s, i) => s + i.quantity, 0));
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 401) {
        setItems([]);
        setCartCount(0);
      } else {
        setError('Unable to load cart. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [setCartCount]);

  useEffect(() => {
    if (!isCartOpen) return;
    let cancelled = false;
    loadCart().catch(() => { if (!cancelled) setError('Unable to load cart.'); });
    return () => { cancelled = true; };
  }, [isCartOpen, loadCart]);

  const handleRemove = async (id: number) => {
    try {
      await removeCartItem(id);
      setItems((prev) => {
        const next = prev.filter((i) => i.cart_item_id !== id);
        setCartCount(next.reduce((s, i) => s + i.quantity, 0));
        return next;
      });
    } catch { setError('Could not remove item.'); }
  };

  const handleQty = async (id: number, delta: number) => {
    const item = items.find((i) => i.cart_item_id === id);
    if (!item) return;
    const newQty = item.quantity + delta;
    if (newQty < 1) { await handleRemove(id); return; }
    try {
      await updateCartQuantity(id, newQty);
      setItems((prev) => {
        const next = prev.map((i) => i.cart_item_id === id ? { ...i, quantity: newQty } : i);
        setCartCount(next.reduce((s, i) => s + i.quantity, 0));
        return next;
      });
    } catch { setError('Could not update quantity.'); }
  };

  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            className="fixed top-0 right-0 bottom-0 w-full max-w-[420px] bg-white z-[70] flex flex-col shadow-2xl"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#e5e0d8] flex-shrink-0">
              <div className="flex items-center gap-3">
                <ShoppingBag size={18} />
                <h2 className="font-display text-lg font-medium">Your Bag</h2>
                {items.length > 0 && (
                  <span className="w-5 h-5 bg-[#c9a96e] text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {items.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                )}
              </div>
              <button onClick={() => setCartOpen(false)} className="p-1.5 hover:opacity-60 transition-opacity">
                <X size={20} />
              </button>
            </div>

            {/* Body — scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {loading && (
                <div className="flex items-center justify-center py-16">
                  <Loader size={24} className="animate-spin text-[#c9a96e]" />
                </div>
              )}
              {!loading && error && (
                <div className="flex flex-col items-center gap-3 py-12">
                  <p className="font-body text-sm text-red-500">{error}</p>
                  <button onClick={loadCart} className="font-body text-xs text-[#c9a96e] hover:underline">
                    Try again
                  </button>
                </div>
              )}
              {!loading && !error && items.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <ShoppingBag size={40} className="text-[#e5e0d8] mb-4" />
                  <p className="font-display text-xl font-light mb-2">Your bag is empty</p>
                  <p className="font-body text-sm text-[#6b7280] mb-6">Discover our latest collections</p>
                  <Link
                    href="/shop"
                    onClick={() => setCartOpen(false)}
                    className="px-8 py-3 bg-[#0a0a0a] text-white font-body text-xs tracking-[0.15em] hover:bg-[#1a1a1a] transition-colors"
                  >
                    SHOP NOW
                  </Link>
                </div>
              )}

              {!loading && !error && items.length > 0 && (
                <div className="space-y-5">
                  {items.map((item) => (
                    <motion.div
                      key={item.cart_item_id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex gap-4"
                    >
                      <div className="w-20 h-24 flex-shrink-0 bg-[#f7f4ef] overflow-hidden">
                        {item.image
                          ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center"><ShoppingBag size={18} className="text-[#c9a96e]" /></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-0.5">
                          <h4 className="font-display text-sm font-medium leading-snug line-clamp-2">{item.name}</h4>
                          <button onClick={() => handleRemove(item.cart_item_id)} className="flex-shrink-0 p-1 hover:opacity-50 transition-opacity mt-0.5">
                            <X size={13} />
                          </button>
                        </div>
                        <p className="font-body text-xs text-[#6b7280] mb-3">{item.size} · {item.color}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center border border-[#e5e0d8]">
                            <button onClick={() => handleQty(item.cart_item_id, -1)} className="px-2 py-1.5 hover:bg-[#f7f4ef] transition-colors">
                              <Minus size={11} />
                            </button>
                            <span className="w-8 text-center font-body text-xs">{item.quantity}</span>
                            <button onClick={() => handleQty(item.cart_item_id, 1)} className="px-2 py-1.5 hover:bg-[#f7f4ef] transition-colors">
                              <Plus size={11} />
                            </button>
                          </div>
                          <p className="font-body text-sm font-medium">{format(item.unitPrice * item.quantity)}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer — fixed */}
            {items.length > 0 && !loading && (
              <div className="border-t border-[#e5e0d8] px-6 py-6 flex-shrink-0 bg-white">
                <div className="flex justify-between mb-1 font-body text-sm">
                  <span className="text-[#6b7280]">Subtotal</span>
                  <span className="font-medium">{format(subtotal)}</span>
                </div>
                <p className="font-body text-xs text-[#6b7280] mb-5">Shipping and taxes at checkout</p>
                <Link
                  href="/checkout"
                  onClick={() => setCartOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-4 bg-[#0a0a0a] text-white font-body text-xs tracking-[0.2em] hover:bg-[#1a1a1a] transition-colors"
                >
                  CHECKOUT <ArrowRight size={14} />
                </Link>
                <button
                  onClick={() => setCartOpen(false)}
                  className="w-full text-center font-body text-xs text-[#6b7280] hover:text-[#0a0a0a] transition-colors mt-3 py-1"
                >
                  Continue shopping
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
