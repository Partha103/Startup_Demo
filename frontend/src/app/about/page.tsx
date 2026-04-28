'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const VALUES = [
  { title: 'Craftsmanship',   body: 'Every piece is hand-finished and quality-checked in our partner ateliers across Europe and Asia.' },
  { title: 'Sustainability',  body: 'We source only certified sustainable fabrics and offset 100% of our shipping carbon emissions.' },
  { title: 'Transparency',    body: 'We publish our full supplier list and the cost breakdown of every garment on request.' },
  { title: 'Timelessness',    body: 'We design pieces to be worn for decades, not seasons. No fast fashion, no disposable trends.' },
];

export default function AboutPage() {
  return (
    <div style={{ background: 'var(--color-ivory)' }}>

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: '#0a0a0a', minHeight: '60vh' }}>
        <img
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a0a0a]" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-container py-32">
          <motion.p
            className="font-body text-xs tracking-[0.3em] text-[#c9a96e] mb-4"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          >
            THE MAISON
          </motion.p>
          <motion.h1
            className="font-display font-light text-white mb-5"
            style={{ fontSize: 'clamp(2.5rem,7vw,5rem)' }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.7 }}
          >
            About TANTA
          </motion.h1>
          <motion.p
            className="font-body text-base text-white/50 max-w-xl"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.6 }}
          >
            Where light meets luxury. A fashion house built on the belief that clothing should be extraordinary.
          </motion.p>
        </div>
      </section>

      {/* Story */}
      <section className="py-section px-container max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <p className="font-body text-xs tracking-[0.2em] text-[#c9a96e] mb-4">OUR STORY</p>
            <h2 className="font-display text-3xl font-light mb-5">Born from a desire for the exceptional</h2>
            <p className="font-body text-sm text-[#6b7280] leading-relaxed mb-4">
              TANTA was founded in 2019 with a single conviction: that every person deserves to wear something made to the highest possible standard — without compromise.
            </p>
            <p className="font-body text-sm text-[#6b7280] leading-relaxed">
              We work directly with the finest mills and ateliers in Italy, France, Portugal, and Japan to source and produce each piece. No middlemen. No shortcuts. Just exceptional clothing.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <img
              src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=700&q=80"
              alt="Atelier"
              className="w-full aspect-[3/4] object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-section px-container" style={{ background: '#0a0a0a' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="font-body text-xs tracking-[0.25em] text-[#c9a96e] mb-3">WHAT WE STAND FOR</p>
            <h2 className="font-display text-3xl font-light text-white">Our values</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10">
            {VALUES.map(({ title, body }, i) => (
              <motion.div
                key={title}
                className="p-10 bg-[#0a0a0a]"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              >
                <p className="font-body text-xs tracking-[0.2em] text-[#c9a96e] mb-3">0{i + 1}</p>
                <h3 className="font-display text-xl font-light text-white mb-3">{title}</h3>
                <p className="font-body text-sm text-white/40 leading-relaxed">{body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-container text-center">
        <p className="font-body text-xs tracking-[0.25em] text-[#c9a96e] mb-4">READY TO EXPERIENCE TANTA?</p>
        <h2 className="font-display text-3xl font-light mb-8">Discover the collection</h2>
        <Link href="/shop" className="px-12 py-4 bg-[#0a0a0a] text-white font-body text-xs tracking-[0.2em] hover:bg-[#1a1a1a] transition-colors">
          SHOP NOW
        </Link>
      </section>
    </div>
  );
}
