'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { getCollections, slugifyCollectionName } from '@/lib/api';
import type { Collection } from '@/types/api';

const FALLBACK_IMGS = [
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80',
];

export default function FeaturedCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    let active = true;
    getCollections()
      .then((data) => { if (active) setCollections(data.slice(0, 3)); })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <section className="py-section px-container" style={{ background: 'var(--color-ivory)' }}>

      <motion.div
        className="flex items-end justify-between mb-14"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div>
          <p className="font-body text-xs tracking-[0.25em] text-[#c9a96e] mb-2">THE COLLECTIONS</p>
          <h2 className="font-display text-4xl md:text-5xl font-light tracking-tight">Curated for You</h2>
        </div>
        <Link
          href="/collections"
          className="hidden md:flex items-center gap-2 font-body text-xs tracking-[0.15em] hover:text-[#c9a96e] transition-colors"
        >
          VIEW ALL <ArrowRight size={13} />
        </Link>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-[#f0ede8] animate-pulse rounded-sm"
              style={{ height: i === 1 ? 700 : 580 }} />
          ))}
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-body text-sm text-[#6b7280]">Collections coming soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {collections.map((col, idx) => {
            // Bug fix: always resolve a valid image string
            const imgSrc = (typeof col.image === 'string' && col.image.trim())
              ? col.image
              : FALLBACK_IMGS[idx % FALLBACK_IMGS.length];

            return (
              <motion.div
                key={col.collection_id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.12 }}
                viewport={{ once: true }}
              >
                <Link href={`/collection/${slugifyCollectionName(col.name)}`}>
                  <div className="group cursor-pointer">
                    {/* Image */}
                    <div
                      className="relative overflow-hidden mb-5"
                      style={{ height: idx === 1 ? 700 : 580 }}
                    >
                      <img
                        src={imgSrc}
                        alt={col.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-500" />

                      {/* Piece count badge */}
                      {col.products_count > 0 && (
                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white font-body text-xs tracking-widest px-3 py-1.5">
                          {col.products_count} PIECES
                        </div>
                      )}
                    </div>

                    {/* Text */}
                    <h3 className="font-display text-xl font-medium mb-1 group-hover:text-[#c9a96e] transition-colors">
                      {col.name}
                    </h3>
                    {col.description && (
                      <p className="font-body text-sm text-[#6b7280] mb-3 line-clamp-2">
                        {col.description}
                      </p>
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
    </section>
  );
}
