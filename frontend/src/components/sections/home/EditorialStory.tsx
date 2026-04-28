'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function EditorialStory() {
  return (
    <section className="py-section" style={{ background: '#0a0a0a' }}>
      <div className="px-container max-w-full mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-center">
          {/* Image panel */}
          <motion.div
            className="relative overflow-hidden"
            style={{ height: 'clamp(400px, 70vh, 700px)' }}
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <img
              src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=80"
              alt="Artisan craftsmanship"
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.03]"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/0 to-black/50" />
          </motion.div>

          {/* Text panel */}
          <motion.div
            className="p-10 md:p-16 lg:p-20"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <p className="font-body text-xs tracking-[0.3em] text-[#c9a96e] mb-5">THE MAISON</p>
            <h2 className="font-display text-4xl md:text-5xl font-light text-white leading-tight mb-6">
              Crafted with<br /><em>intention</em>
            </h2>
            <p className="font-body text-sm text-white/50 leading-relaxed mb-6">
              Every TANTA piece begins with a singular question: what does the wearer deserve to feel? The answer is always the same — extraordinary.
            </p>
            <p className="font-body text-sm text-white/50 leading-relaxed mb-10">
              We partner with the finest ateliers across Europe and Asia to source materials that honour both the environment and the artisan tradition.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/about"
                className="inline-flex items-center justify-center px-8 py-3.5 border border-[#c9a96e] text-[#c9a96e] font-body text-xs tracking-[0.2em] hover:bg-[#c9a96e] hover:text-white transition-all"
              >
                OUR STORY
              </Link>
              <Link
                href="/sustainability"
                className="inline-flex items-center justify-center px-8 py-3.5 border border-white/20 text-white/60 font-body text-xs tracking-[0.2em] hover:border-white/60 hover:text-white transition-all"
              >
                SUSTAINABILITY
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
