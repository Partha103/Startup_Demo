'use client';

import { useEffect, useState, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';
import { getProducts } from '@/lib/api';
import type { Product } from '@/types/api';
import ProductCard from '@/components/common/ProductCard';
import { FILTER_OPTIONS } from '@/lib/constants';
import { ProductGridSkeleton } from '@/components/common/SkeletonLoader';

function ShopContent() {
  const searchParams  = useSearchParams();
  const categoryParam = searchParams.get('category') ?? '';
  const sortParam     = searchParams.get('sort') ?? 'default';

  const [products, setProducts]         = useState<Product[]>([]);
  const [filtered, setFiltered]         = useState<Product[]>([]);
  const [loading, setLoading]           = useState(true);
  const [filtersOpen, setFiltersOpen]   = useState(false);
  const [sort, setSort]                 = useState(sortParam);
  const [selectedSizes, setSelectedSizes]   = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange]         = useState<{ min: number; max: number } | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setProducts([]);
    getProducts(categoryParam ? { category: categoryParam } : undefined)
      .then((data) => { if (active) setProducts(data); })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [categoryParam]);

  useEffect(() => {
    let result = [...products];
    if (selectedSizes.length)  result = result.filter((p) => p.sizes.some((s) => selectedSizes.includes(s)));
    if (selectedColors.length) result = result.filter((p) => p.colors.some((c) => selectedColors.includes(c)));
    if (priceRange)            result = result.filter((p) => p.price >= priceRange.min && p.price <= priceRange.max);
    if (sort === 'price-asc')  result = [...result].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') result = [...result].sort((a, b) => b.price - a.price);
    if (sort === 'new')        result = [...result].sort((a, b) => b.product_id - a.product_id);
    setFiltered(result);
  }, [products, selectedSizes, selectedColors, priceRange, sort]);

  const toggleSize  = (s: string) => setSelectedSizes((p)  => p.includes(s) ? p.filter((x) => x !== s) : [...p, s]);
  const toggleColor = (c: string) => setSelectedColors((p) => p.includes(c) ? p.filter((x) => x !== c) : [...p, c]);
  const clearAll    = useCallback(() => { setSelectedSizes([]); setSelectedColors([]); setPriceRange(null); }, []);
  const activeCount = selectedSizes.length + selectedColors.length + (priceRange ? 1 : 0);

  const pageTitle = categoryParam
    ? categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1)
    : 'All Products';

  return (
    <div style={{ background: 'var(--color-ivory)', minHeight: '100vh' }}>

      {/* Page header */}
      <div className="px-container py-12 border-b border-[#e5e0d8]">
        {categoryParam && (
          <p className="font-body text-xs tracking-[0.25em] text-[#c9a96e] mb-2">
            {categoryParam.toUpperCase()}
          </p>
        )}
        <h1 className="font-display text-4xl md:text-5xl font-light">{pageTitle}</h1>
      </div>

      {/* Controls bar */}
      <div className="sticky top-[88px] z-30 bg-white/95 backdrop-blur-md border-b border-[#e5e0d8]">
        <div className="px-container flex items-center justify-between h-12">
          <button
            onClick={() => setFiltersOpen((p) => !p)}
            className="flex items-center gap-2 font-body text-xs tracking-[0.15em] hover:text-[#c9a96e] transition-colors"
          >
            <SlidersHorizontal size={14} />
            FILTERS
            {activeCount > 0 && (
              <span className="w-4 h-4 bg-[#c9a96e] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {activeCount}
              </span>
            )}
            {filtersOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          <p className="font-body text-xs text-[#6b7280]">
            {loading ? '—' : `${filtered.length} products`}
          </p>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="font-body text-xs tracking-[0.1em] bg-transparent border-none outline-none cursor-pointer py-2"
          >
            <option value="default">FEATURED</option>
            <option value="new">NEWEST</option>
            <option value="price-asc">PRICE ↑</option>
            <option value="price-desc">PRICE ↓</option>
          </select>
        </div>
      </div>

      {/* Inline filter panel — pushes content down, no overlay layout issues */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="overflow-hidden bg-white border-b border-[#e5e0d8]"
          >
            <div className="px-container py-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">

                {/* Size */}
                <div>
                  <p className="font-body text-[10px] tracking-[0.2em] text-[#6b7280] mb-3">SIZE</p>
                  <div className="flex flex-wrap gap-2">
                    {FILTER_OPTIONS.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => toggleSize(s)}
                        className={`w-10 h-10 border font-body text-xs transition-all ${
                          selectedSizes.includes(s)
                            ? 'bg-[#0a0a0a] text-white border-[#0a0a0a]'
                            : 'border-[#e5e0d8] hover:border-[#0a0a0a]'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Colour */}
                <div>
                  <p className="font-body text-[10px] tracking-[0.2em] text-[#6b7280] mb-3">COLOUR</p>
                  <div className="flex flex-wrap gap-2">
                    {FILTER_OPTIONS.colors.map((c) => (
                      <button
                        key={c}
                        onClick={() => toggleColor(c)}
                        className={`px-3 py-1.5 border font-body text-xs transition-all ${
                          selectedColors.includes(c)
                            ? 'bg-[#0a0a0a] text-white border-[#0a0a0a]'
                            : 'border-[#e5e0d8] hover:border-[#0a0a0a]'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div>
                  <p className="font-body text-[10px] tracking-[0.2em] text-[#6b7280] mb-3">PRICE</p>
                  <div className="space-y-2">
                    {FILTER_OPTIONS.priceRanges.map((r) => (
                      <button
                        key={r.label}
                        onClick={() => setPriceRange(priceRange?.min === r.min ? null : { min: r.min, max: r.max })}
                        className={`w-full text-left px-3 py-2 border font-body text-xs transition-all ${
                          priceRange?.min === r.min
                            ? 'bg-[#0a0a0a] text-white border-[#0a0a0a]'
                            : 'border-[#e5e0d8] hover:border-[#0a0a0a]'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {activeCount > 0 && (
                <div className="mt-5 pt-5 border-t border-[#e5e0d8] flex items-center gap-3">
                  <button
                    onClick={clearAll}
                    className="font-body text-xs tracking-[0.15em] text-[#6b7280] hover:text-[#0a0a0a] transition-colors"
                  >
                    CLEAR ALL ({activeCount})
                  </button>
                  <button
                    onClick={() => setFiltersOpen(false)}
                    className="ml-auto font-body text-xs tracking-[0.15em] text-[#c9a96e] flex items-center gap-1"
                  >
                    <X size={12} /> CLOSE
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product grid — full width, no flex sidebar layout issues */}
      <div className="px-container py-10">
        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="font-display text-2xl font-light mb-3">No products found</p>
            <p className="font-body text-sm text-[#6b7280] mb-6">
              Try adjusting your filters or browse all products.
            </p>
            <button
              onClick={clearAll}
              className="px-8 py-3 bg-[#0a0a0a] text-white font-body text-xs tracking-[0.2em] hover:bg-[#1a1a1a] transition-colors"
            >
              CLEAR FILTERS
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
            {filtered.map((product, idx) => (
              <ProductCard key={product.product_id} product={product} index={idx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div style={{ background: 'var(--color-ivory)', minHeight: '100vh' }} className="px-container py-24">
        <ProductGridSkeleton count={8} />
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
