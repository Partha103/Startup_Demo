'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { searchProducts } from '@/lib/api';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';
import type { Product } from '@/types/api';
import Link from 'next/link';

export function SearchBar() {
  const [isOpen, setIsOpen]           = useState(false);
  const [query, setQuery]             = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [loading, setLoading]         = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router   = useRouter();
  const { format } = useCurrencyFormatter();

  // Debounced suggestions
  useEffect(() => {
    if (!query.trim()) { setSuggestions([]); return; }
    let active = true;
    setLoading(true);
    const id = setTimeout(async () => {
      try {
        const results = await searchProducts(query);
        if (active) setSuggestions(results.slice(0, 5));
      } catch { /* silent */ }
      finally   { if (active) setLoading(false); }
    }, 280);
    return () => { active = false; clearTimeout(id); };
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [isOpen]);

  // Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') { setIsOpen(false); setQuery(''); } };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      setQuery('');
    }
  };

  const handleSuggestionClick = () => { setIsOpen(false); setQuery(''); };

  const PLACEHOLDER_IMGS = [
    'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=80&q=60',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=80&q=60',
  ];

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-1.5 hover:opacity-60 transition-opacity"
        aria-label="Open search"
      >
        <Search size={18} />
      </button>

      {/* Full-screen overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsOpen(false); setQuery(''); }}
            />

            <motion.div
              className="fixed top-0 left-0 right-0 z-[101] bg-white shadow-2xl"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="max-w-3xl mx-auto px-6 py-5">
                <form onSubmit={handleSubmit} className="flex items-center gap-4">
                  <Search size={20} className="text-[#c9a96e] flex-shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for pieces, collections, fabrics…"
                    className="flex-1 font-body text-lg outline-none placeholder:text-[#d0ccc5] bg-transparent"
                  />
                  {query && (
                    <button type="button" onClick={() => setQuery('')} className="p-1 hover:opacity-60">
                      <X size={18} className="text-[#6b7280]" />
                    </button>
                  )}
                  <button type="button" onClick={() => { setIsOpen(false); setQuery(''); }}
                    className="font-body text-xs tracking-[0.15em] text-[#6b7280] hover:text-[#0a0a0a] transition-colors ml-2">
                    ESC
                  </button>
                </form>

                {/* Suggestions */}
                <AnimatePresence>
                  {(suggestions.length > 0 || loading) && (
                    <motion.div
                      className="mt-4 border-t border-[#e5e0d8] pt-4"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      {loading && !suggestions.length && (
                        <div className="py-4 flex justify-center">
                          <div className="w-4 h-4 border-2 border-[#c9a96e] border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}

                      <div className="space-y-1">
                        {suggestions.map((product, idx) => (
                          <Link
                            key={product.product_id}
                            href={`/product/${product.product_id}`}
                            onClick={handleSuggestionClick}
                          >
                            <motion.div
                              className="flex items-center gap-4 px-3 py-3 hover:bg-[#f7f4ef] transition-colors group"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.04 }}
                            >
                              <div className="w-10 h-12 bg-[#f0ede8] flex-shrink-0 overflow-hidden">
                                <img
                                  src={product.images?.[0] ?? PLACEHOLDER_IMGS[idx % 2]}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-body text-sm font-medium text-[#0a0a0a] group-hover:text-[#c9a96e] transition-colors truncate">
                                  {product.name}
                                </p>
                                <p className="font-body text-xs text-[#6b7280] capitalize">{product.category}</p>
                              </div>
                              <p className="font-body text-sm text-[#0a0a0a] flex-shrink-0">{format(product.price)}</p>
                              <ArrowRight size={14} className="text-[#c9a96e] opacity-0 group-hover:opacity-100 transition-opacity" />
                            </motion.div>
                          </Link>
                        ))}
                      </div>

                      {suggestions.length > 0 && query && (
                        <div className="mt-3 pt-3 border-t border-[#f0ede8]">
                          <button
                            onClick={handleSubmit}
                            className="font-body text-xs tracking-[0.15em] text-[#c9a96e] hover:text-[#9a7a42] transition-colors flex items-center gap-2"
                          >
                            View all results for "{query}" <ArrowRight size={12} />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Empty state */}
                {!query && !loading && (
                  <div className="mt-4 pt-4 border-t border-[#e5e0d8]">
                    <p className="font-body text-xs tracking-[0.15em] text-[#6b7280] mb-3">POPULAR SEARCHES</p>
                    <div className="flex flex-wrap gap-2">
                      {['Cashmere', 'Silk dress', 'Tailored blazer', 'Leather tote', 'Merino'].map((term) => (
                        <button
                          key={term}
                          onClick={() => setQuery(term)}
                          className="px-4 py-1.5 border border-[#e5e0d8] font-body text-xs hover:border-[#c9a96e] hover:text-[#c9a96e] transition-all"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
