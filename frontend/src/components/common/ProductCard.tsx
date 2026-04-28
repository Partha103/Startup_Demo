'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag } from 'lucide-react';
import type { Product } from '@/types/api';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';
import { useState, useCallback } from 'react';
import { addToCart, addToWishlist, removeFromWishlist, getCart, ApiError } from '@/lib/api';
import { useStore } from '@/store/store';

const IMGS = [
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=600&q=75',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=75',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=75',
  'https://images.unsplash.com/photo-1470309864661-68328b2cd0a5?auto=format&fit=crop&w=600&q=75',
  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=600&q=75',
  'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=600&q=75',
];

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const [hovered,    setHovered]    = useState(false);
  const [favorited,  setFavorited]  = useState(false);
  const [adding,     setAdding]     = useState(false);
  const { setCartCount, setCartOpen } = useStore();
  const { format }                  = useCurrencyFormatter();

  const idx1 = (product.product_id || index) % IMGS.length;
  const idx2 = (idx1 + 1) % IMGS.length;
  const img1 = product.images?.[0] ?? IMGS[idx1];
  const img2 = product.images?.[1] ?? IMGS[idx2];

  const handleWishlist = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    try {
      favorited ? await removeFromWishlist(product.product_id) : await addToWishlist(product.product_id);
      setFavorited((p) => !p);
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 401) window.location.href = '/auth';
    }
  }, [favorited, product.product_id]);

  const handleQuickAdd = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!product.sizes.length || !product.colors.length) return;
    setAdding(true);
    try {
      await addToCart({ product_id: product.product_id, size: product.sizes[0], color: product.colors[0], quantity: 1 });
      const cart = await getCart();
      setCartCount(cart.reduce((s, i) => s + i.quantity, 0));
      setCartOpen(true);
    } catch { /* silent */ } finally { setAdding(false); }
  }, [product, setCartCount, setCartOpen]);

  const isOOS = product.total_available === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.05, 0.3) }}
      viewport={{ once: true }}
    >
      <Link href={`/product/${product.product_id}`}>
        <div
          className="group cursor-pointer"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {/* ── Image wrapper ── */}
          <div className="relative overflow-hidden mb-4 bg-[#f0ede8]" style={{ paddingBottom: '133%' }}>
            {/* Primary */}
            <img
              src={img1}
              alt={product.name}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
              style={{ opacity: hovered ? 0 : 1 }}
            />
            {/* Secondary — scale on hover */}
            <img
              src={img2}
              alt=""
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-all duration-600"
              style={{ opacity: hovered ? 1 : 0, transform: hovered ? 'scale(1.04)' : 'scale(1)' }}
            />

            {isOOS && (
              <div className="absolute top-3 left-3 bg-[#0a0a0a] text-white font-body text-[10px] tracking-[0.15em] px-3 py-1 z-10">
                SOLD OUT
              </div>
            )}

            {/* Wishlist */}
            <button
              onClick={handleWishlist}
              className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white transition-all opacity-0 group-hover:opacity-100 rounded-full z-10 shadow-sm"
              aria-label={favorited ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart size={14} className={favorited ? 'fill-[#c9a96e] stroke-[#c9a96e]' : 'stroke-[#0a0a0a]'} />
            </button>

            {/* Quick Add */}
            {!isOOS && (
              <button
                onClick={handleQuickAdd}
                disabled={adding}
                className="absolute bottom-0 left-0 right-0 bg-[#0a0a0a]/90 text-white py-3 font-body text-[11px] tracking-[0.15em] flex items-center justify-center gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10 disabled:opacity-70"
              >
                <ShoppingBag size={13} />
                {adding ? 'ADDING…' : 'QUICK ADD'}
              </button>
            )}
          </div>

          {/* ── Info ── */}
          <div>
            <p className="font-body text-[10px] text-[#9a7a42] tracking-[0.15em] mb-0.5 uppercase">{product.category}</p>
            <h4 className="font-display text-[15px] font-medium leading-snug mb-1 group-hover:text-[#c9a96e] transition-colors line-clamp-1">
              {product.name}
            </h4>
            <div className="flex items-center justify-between">
              <span className="font-body text-sm font-medium">{format(product.price)}</span>
              {product.colors.length > 1 && (
                <span className="font-body text-xs text-[#6b7280]">{product.colors.length} colours</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
