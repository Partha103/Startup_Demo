'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader, Search } from 'lucide-react';
import { searchProducts } from '@/lib/api';
import type { Product } from '@/types/api';
import ProductCard from '@/components/common/ProductCard';
import { ProductGridSkeleton } from '@/components/common/SkeletonLoader';

function SearchContent() {
  const params  = useSearchParams();
  const query   = params.get('q') ?? '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!query) { setProducts([]); setSearched(false); return; }
    let active = true;
    setLoading(true);
    setSearched(false);
    searchProducts(query)
      .then((data) => { if (active) { setProducts(data); setSearched(true); } })
      .catch(() => { if (active) setSearched(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [query]);

  return (
    <div className="min-h-screen px-container py-12" style={{ background: 'var(--color-ivory)' }}>
      <div className="mb-10">
        <p className="font-body text-xs tracking-[0.2em] text-[#c9a96e] mb-2">SEARCH RESULTS</p>
        <h1 className="font-display text-3xl font-light">
          {query ? (
            <>Results for &ldquo;<em className="not-italic italic">{query}</em>&rdquo;</>
          ) : 'Search'}
        </h1>
        {searched && !loading && (
          <p className="font-body text-sm text-[#6b7280] mt-2">
            {products.length} {products.length === 1 ? 'product' : 'products'} found
          </p>
        )}
      </div>

      {loading ? (
        <ProductGridSkeleton count={8} />
      ) : !query ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search size={36} className="text-[#e5e0d8] mb-4" />
          <p className="font-display text-2xl font-light mb-2">What are you looking for?</p>
          <p className="font-body text-sm text-[#6b7280]">Enter a search term above to get started.</p>
        </div>
      ) : products.length === 0 && searched ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search size={36} className="text-[#e5e0d8] mb-4" />
          <p className="font-display text-2xl font-light mb-2">No results found</p>
          <p className="font-body text-sm text-[#6b7280]">
            Try a different search term or browse our collections.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
          {products.map((p, i) => <ProductCard key={p.product_id} product={p} index={i} />)}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen px-container py-24" style={{ background: 'var(--color-ivory)' }}>
        <ProductGridSkeleton count={8} />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
