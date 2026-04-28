'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getProducts } from '@/lib/api';
import type { Product } from '@/types/api';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';

const FALLBACK_IMGS = [
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=600&q=75',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=75',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=75',
  'https://images.unsplash.com/photo-1470309864661-68328b2cd0a5?auto=format&fit=crop&w=600&q=75',
];

export default function LookbookSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const { format }              = useCurrencyFormatter();

  useEffect(() => {
    let active = true;
    getProducts()
      .then((data) => { if (active) setProducts(data.slice(0, 4)); })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <section className="py-section px-container" style={{ background: 'var(--color-cream)' }}>
      <motion.div
        className="flex items-end justify-between mb-14"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <p className="font-body text-xs tracking-[0.25em] text-[#c9a96e] mb-2">NEW ARRIVALS</p>
          <h2 className="font-display text-4xl md:text-5xl font-light tracking-tight">The Latest Pieces</h2>
        </div>
        <Link
          href="/shop"
          className="hidden md:flex items-center gap-2 font-body text-xs tracking-[0.15em] hover:text-[#c9a96e] transition-colors"
        >
          VIEW ALL <ArrowRight size={13} />
        </Link>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="bg-[#e8e4df] animate-pulse rounded-sm" style={{ paddingBottom: '130%' }} />
                <div className="h-3 bg-[#e8e4df] animate-pulse rounded w-3/4" />
                <div className="h-3 bg-[#e8e4df] animate-pulse rounded w-1/2" />
              </div>
            ))
          : products.map((product, idx) => {
              const imgSrc = product.images?.[0] || FALLBACK_IMGS[idx % FALLBACK_IMGS.length];
              return (
                <motion.div
                  key={product.product_id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                >
                  <Link href={`/product/${product.product_id}`}>
                    <div className="group cursor-pointer">
                      <div className="relative overflow-hidden mb-4" style={{ paddingBottom: '130%' }}>
                        <img
                          src={imgSrc}
                          alt={product.name}
                          loading="lazy"
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {/* Quick add overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-[#0a0a0a]/85 py-3 px-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <p className="font-body text-xs tracking-[0.15em] text-white text-center">QUICK VIEW</p>
                        </div>
                      </div>
                      <p className="font-body text-[10px] text-[#9a7a42] tracking-[0.15em] mb-0.5">
                        {product.category?.toUpperCase()}
                      </p>
                      <h4 className="font-display text-sm font-medium group-hover:text-[#c9a96e] transition-colors line-clamp-1">
                        {product.name}
                      </h4>
                      <p className="font-body text-sm text-[#0a0a0a] mt-0.5">{format(product.price)}</p>
                    </div>
                  </Link>
                </motion.div>
              );
            })
        }
      </div>

      <div className="mt-10 text-center md:hidden">
        <Link href="/shop" className="font-body text-xs tracking-[0.15em] text-[#c9a96e] hover:text-[#9a7a42] transition-colors">
          VIEW ALL NEW ARRIVALS →
        </Link>
      </div>
    </section>
  );
}
