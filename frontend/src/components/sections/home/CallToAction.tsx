'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CallToAction() {
  return (
    <section className="relative overflow-hidden py-32 grain" style={{ background: '#0a0a0a' }}>
      {/* Subtle gold radial */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(201,169,110,0.08) 0%, transparent 70%)' }} />

      <div className="px-container max-w-3xl mx-auto text-center relative z-10">
        <motion.p
          className="font-body text-xs tracking-[0.3em] text-[#c9a96e] mb-5"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          THE TANTA PROMISE
        </motion.p>

        <motion.h2
          className="font-display font-light text-white mb-6 leading-tight"
          style={{ fontSize: 'clamp(2rem,6vw,3.5rem)' }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          Dress with intention.<br />
          <em className="gold-shimmer">Live with radiance.</em>
        </motion.h2>

        <motion.p
          className="font-body text-sm text-white/40 max-w-lg mx-auto mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Each TANTA piece is a quiet declaration — that you value the exceptional, the considered, the beautifully made.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Link
            href="/shop"
            className="px-12 py-4 font-body text-xs tracking-[0.25em] font-medium text-black transition-all hover:opacity-80"
            style={{ background: '#c9a96e' }}
          >
            SHOP THE COLLECTION
          </Link>
          <Link
            href="/auth"
            className="px-12 py-4 border border-white/30 font-body text-xs tracking-[0.25em] font-medium text-white/70 hover:text-white hover:border-white/60 transition-all"
          >
            CREATE ACCOUNT
          </Link>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          className="mt-16 flex flex-wrap items-center justify-center gap-10 text-white/20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {['Free Returns', 'Secure Checkout', 'Authenticity Guaranteed', 'Carbon-Neutral Shipping'].map((badge) => (
            <span key={badge} className="font-body text-xs tracking-[0.15em]">{badge}</span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
