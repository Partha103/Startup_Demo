'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Loader } from 'lucide-react';
import { getCollections, slugifyCollectionName } from '@/lib/api';
import type { Collection } from '@/types/api';

const FALLBACK_IMGS = [
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1470309864661-68328b2cd0a5?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=80',
];

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    let active = true;
    getCollections()
      .then((data) => { if (active) setCollections(data); })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <div style={{ background: 'var(--color-ivory)' }}>
      {/* Hero */}
      <div className="relative overflow-hidden py-24 px-container text-center" style={{ background: '#0a0a0a' }}>
        <motion.p
          className="font-body text-xs tracking-[0.3em] text-[#c9a96e] mb-4"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        >
          TANTA MAISON
        </motion.p>
        <motion.h1
          className="font-display font-light text-white"
          style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)' }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        >
          All Collections
        </motion.h1>
        <motion.p
          className="font-body text-sm text-white/40 mt-4 max-w-lg mx-auto"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
        >
          Each collection tells a story of craftsmanship, material, and the eternal pursuit of beauty.
        </motion.p>
      </div>

      {/* Grid */}
      <div className="px-container py-section max-w-6xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader size={26} className="animate-spin text-[#c9a96e]" />
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-display text-2xl font-light text-[#6b7280]">
              Collections coming soon
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {collections.map((col, idx) => {
              const imgSrc = (typeof col.image === 'string' && col.image.trim())
                ? col.image
                : FALLBACK_IMGS[idx % FALLBACK_IMGS.length];

              return (
                <motion.div
                  key={col.collection_id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, delay: idx * 0.1 }}
                >
                  <Link href={`/collection/${slugifyCollectionName(col.name)}`}>
                    <div className="group cursor-pointer">
                      <div className="relative overflow-hidden mb-5" style={{ paddingBottom: '110%' }}>
                        <img
                          src={imgSrc}
                          alt={col.name}
                          loading="lazy"
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-500" />
                        {col.products_count > 0 && (
                          <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 font-body text-xs tracking-[0.15em] text-white">
                            {col.products_count} pieces
                          </div>
                        )}
                      </div>
                      <h3 className="font-display text-xl font-medium mb-1 group-hover:text-[#c9a96e] transition-colors">
                        {col.name}
                      </h3>
                      {col.description && (
                        <p className="font-body text-sm text-[#6b7280] mb-3 line-clamp-2">{col.description}</p>
                      )}
                      <span className="inline-flex items-center gap-2 font-body text-xs tracking-[0.15em] text-[#c9a96e] group-hover:gap-3 transition-all">
                        EXPLORE <ArrowRight size={12} />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
