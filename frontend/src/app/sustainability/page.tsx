'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const PILLARS = [
  {
    number: '01',
    title: 'Materials',
    body: 'We use only certified sustainable fibres — GOTS-organic cotton, RCS-recycled cashmere, OEKO-TEX certified silk. Every material is traceable from field to finished garment.',
    stat: '100%', statLabel: 'certified sustainable fibres by 2026',
  },
  {
    number: '02',
    title: 'Production',
    body: 'Our atelier partners run on renewable energy, pay living wages, and are audited annually by independent third parties. We publish audit summaries on our supplier page.',
    stat: '12',  statLabel: 'partner ateliers, all verified',
  },
  {
    number: '03',
    title: 'Packaging',
    body: 'All packaging is FSC-certified, recycled, or compostable. Poly bags are replaced with organic cotton dust covers. Zero single-use plastic in every shipment.',
    stat: '0',   statLabel: 'single-use plastic per order',
  },
  {
    number: '04',
    title: 'Carbon',
    body: 'We offset 100% of our shipping emissions through verified reforestation projects. By 2027, our goal is to reach net-zero across our full supply chain.',
    stat: '100%', statLabel: 'shipping carbon offset today',
  },
];

export default function SustainabilityPage() {
  return (
    <div style={{ background: 'var(--color-ivory)' }}>

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: '#0a0a0a', minHeight: '55vh' }}>
        <img
          src="https://images.unsplash.com/photo-1470309864661-68328b2cd0a5?auto=format&fit=crop&w=1600&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a0a0a]" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-container py-32">
          <motion.p className="font-body text-xs tracking-[0.3em] text-[#c9a96e] mb-4"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            OUR COMMITMENT
          </motion.p>
          <motion.h1 className="font-display font-light text-white mb-5"
            style={{ fontSize: 'clamp(2.5rem,7vw,5rem)' }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            Sustainability
          </motion.h1>
          <motion.p className="font-body text-base text-white/50 max-w-xl"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            Luxury and responsibility are not opposites. At TANTA, every decision considers its impact on people and planet.
          </motion.p>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-section px-container max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#e5e0d8]">
          {PILLARS.map(({ number, title, body, stat, statLabel }, i) => (
            <motion.div key={title} className="bg-white p-10"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <p className="font-body text-[10px] tracking-[0.25em] text-[#c9a96e] mb-4">{number}</p>
              <h2 className="font-display text-2xl font-light mb-4">{title}</h2>
              <p className="font-body text-sm text-[#6b7280] leading-relaxed mb-8">{body}</p>
              <div className="border-t border-[#e5e0d8] pt-6">
                <p className="font-display text-4xl font-light text-[#c9a96e] mb-1">{stat}</p>
                <p className="font-body text-xs text-[#6b7280]">{statLabel}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Report link */}
      <section className="py-16 px-container text-center border-t border-[#e5e0d8]">
        <p className="font-body text-xs tracking-[0.2em] text-[#c9a96e] mb-4">ANNUAL IMPACT REPORT</p>
        <h2 className="font-display text-2xl font-light mb-5">Read our full sustainability report</h2>
        <p className="font-body text-sm text-[#6b7280] max-w-lg mx-auto mb-8">
          Every year we publish a comprehensive report on our environmental and social impact — including full supply chain disclosure.
        </p>
        <Link href="mailto:sustainability@tanta.fashion"
          className="px-10 py-3.5 border border-[#0a0a0a] font-body text-xs tracking-[0.2em] hover:bg-[#0a0a0a] hover:text-white transition-all">
          REQUEST THE REPORT
        </Link>
      </section>
    </div>
  );
}
