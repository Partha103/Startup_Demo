'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

const ROLES = [
  { title: 'Senior Buyer — Womenswear', location: 'London, UK', type: 'Full-time' },
  { title: 'Creative Director', location: 'Paris, France', type: 'Full-time' },
  { title: 'E-Commerce Manager', location: 'Remote', type: 'Full-time' },
  { title: 'Sustainability Lead', location: 'London, UK', type: 'Full-time' },
];
export default function CareersPage() {
  return (
    <div style={{ background: 'var(--color-ivory)' }}>
      <div className="relative overflow-hidden" style={{ background: '#0a0a0a', minHeight: '45vh' }}>
        <img src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1600&q=80" alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[45vh] text-center px-container">
          <motion.p className="font-body text-xs tracking-[0.3em] text-[#c9a96e] mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>JOIN US</motion.p>
          <motion.h1 className="font-display font-light text-white mb-4" style={{ fontSize: 'clamp(2.5rem,7vw,5rem)' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>Careers at TANTA</motion.h1>
          <motion.p className="font-body text-sm text-white/40 max-w-lg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>We are building something exceptional. If you believe in craft, beauty, and doing things the right way — we would love to hear from you.</motion.p>
        </div>
      </div>
      <div className="px-container py-14 max-w-4xl mx-auto">
        <h2 className="font-display text-2xl font-light mb-8">Open positions</h2>
        <div className="space-y-3 mb-12">
          {ROLES.map(({ title, location, type }) => (
            <div key={title} className="flex items-center justify-between p-5 bg-white border border-[#e5e0d8] hover:border-[#c9a96e] transition-all group">
              <div><p className="font-body text-sm font-medium group-hover:text-[#c9a96e] transition-colors">{title}</p><p className="font-body text-xs text-[#6b7280] mt-0.5">{location} · {type}</p></div>
              <a href={`mailto:careers@tanta.fashion?subject=Application: ${title}`} className="font-body text-xs tracking-[0.1em] text-[#c9a96e] hover:underline">APPLY →</a>
            </div>
          ))}
        </div>
        <div className="p-8 bg-[#0a0a0a] text-center">
          <p className="font-body text-sm text-white/60 mb-3">Don't see the right role?</p>
          <a href="mailto:careers@tanta.fashion" className="font-body text-sm text-[#c9a96e] hover:underline">Send us your CV and a note about what you would bring to TANTA</a>
        </div>
      </div>
    </div>
  );
}
