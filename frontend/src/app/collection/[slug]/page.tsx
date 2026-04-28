'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';
import { getCollection, getProducts } from '@/lib/api';
import type { Collection, Product } from '@/types/api';
import ProductCard from '@/components/common/ProductCard';
import Link from 'next/link';

export default function CollectionPage() {
  const params = useParams<{ slug: string }>();
  const slug   = params?.slug ?? '';

  const [collection, setCollection] = useState<Collection | null>(null);
  const [products, setProducts]     = useState<Product[]>([]);
  const [loading, setLoading]       = useState(true);
  const [notFound, setNotFound]     = useState(false);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        const col = await getCollection(slug);
        if (!active) return;
        if (!col) { setNotFound(true); return; }
        setCollection(col);
        const prods = await getProducts({ collection_id: col.collection_id });
        if (!active) return;
        setProducts(prods);
      } catch { if (active) setNotFound(true); }
      finally { if (active) setLoading(false); }
    };
    void load();
    return () => { active = false; };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-ivory)' }}>
        <Loader size={28} className="animate-spin text-[#c9a96e]" />
      </div>
    );
  }

  if (notFound || !collection) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: 'var(--color-ivory)' }}>
        <p className="font-display text-2xl font-light">Collection not found</p>
        <Link href="/collections" className="font-body text-sm text-[#c9a96e] hover:underline">View all collections</Link>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--color-ivory)' }}>
      {/* Hero */}
      <div className="relative overflow-hidden" style={{ height: '50vh', minHeight: 320, background: '#0a0a0a' }}>
        {collection.image && collection.image.trim() && (
          <>
            <img src={collection.image} alt={collection.name} className="absolute inset-0 w-full h-full object-cover opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          </>
        )}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <motion.p
            className="font-body text-xs tracking-[0.3em] text-[#c9a96e] mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            COLLECTION
          </motion.p>
          <motion.h1
            className="font-display font-light text-white mb-3"
            style={{ fontSize: 'clamp(2.5rem,7vw,5rem)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {collection.name}
          </motion.h1>
          {collection.description && (
            <motion.p
              className="font-body text-sm text-white/60 max-w-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              {collection.description}
            </motion.p>
          )}
        </div>
      </div>

      {/* Products */}
      <div className="px-container py-section max-w-7xl mx-auto">
        <p className="font-body text-xs tracking-[0.15em] text-[#6b7280] mb-10">{products.length} products</p>
        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-display text-2xl font-light mb-4">No products in this collection yet</p>
            <Link href="/shop" className="font-body text-sm text-[#c9a96e] hover:underline">Browse all products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p, i) => <ProductCard key={p.product_id} product={p} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
