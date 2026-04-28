'use client';

import Link from 'next/link';
import { Instagram, Twitter, Mail } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FOOTER_SECTIONS, BRAND } from '@/lib/constants';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#0a0a0a] text-[#fafafa]">
      {/* Newsletter */}
      <div className="border-b border-white/10 px-container max-w-full mx-auto py-16">
        <motion.div
          className="max-w-xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <p className="font-body text-xs tracking-[0.2em] text-[#c9a96e] mb-3">THE TANTA EDIT</p>
          <h3 className="font-display text-3xl font-light tracking-tight mb-4">
            Stay in the light
          </h3>
          <p className="font-body text-sm text-white/50 mb-6">
            First access to new collections, exclusive events, and curated style guides — delivered to your inbox.
          </p>

          {subscribed ? (
            <p className="font-body text-sm text-[#c9a96e] tracking-wide">
              ✦ Thank you. You are now part of the TANTA inner circle.
            </p>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-0">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="flex-1 bg-white/5 text-white placeholder:text-white/30 px-5 py-3 border border-white/20 border-r-0 outline-none focus:border-[#c9a96e] transition-colors font-body text-sm"
              />
              <button
                type="submit"
                className="bg-[#c9a96e] hover:bg-[#b8945a] text-white px-8 py-3 font-body text-xs tracking-[0.2em] font-medium transition-colors whitespace-nowrap"
              >
                SUBSCRIBE
              </button>
            </form>
          )}
        </motion.div>
      </div>

      {/* Links */}
      <div className="px-container max-w-full mx-auto py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <p className="font-display text-2xl tracking-[0.3em] mb-4 text-[#c9a96e]">{BRAND.name}</p>
            <p className="font-body text-xs text-white/40 leading-relaxed mb-6">
              {BRAND.description}
            </p>
            <div className="flex gap-3">
              <a href={BRAND.instagram} target="_blank" rel="noopener noreferrer" className="p-2 border border-white/20 hover:border-[#c9a96e] hover:text-[#c9a96e] transition-colors rounded">
                <Instagram size={15} />
              </a>
              <a href="#" className="p-2 border border-white/20 hover:border-[#c9a96e] hover:text-[#c9a96e] transition-colors rounded">
                <Twitter size={15} />
              </a>
              <a href={`mailto:${BRAND.email}`} className="p-2 border border-white/20 hover:border-[#c9a96e] hover:text-[#c9a96e] transition-colors rounded">
                <Mail size={15} />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-body text-xs tracking-[0.2em] font-semibold mb-6 text-white/60">SHOP</h4>
            <ul className="space-y-3">
              {FOOTER_SECTIONS.shop.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="font-body text-sm text-white/50 hover:text-[#c9a96e] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="font-body text-xs tracking-[0.2em] font-semibold mb-6 text-white/60">CARE</h4>
            <ul className="space-y-3">
              {FOOTER_SECTIONS.customer.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="font-body text-sm text-white/50 hover:text-[#c9a96e] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-body text-xs tracking-[0.2em] font-semibold mb-6 text-white/60">MAISON</h4>
            <ul className="space-y-3">
              {FOOTER_SECTIONS.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="font-body text-sm text-white/50 hover:text-[#c9a96e] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t border-white/10 pt-8">
          <p className="font-body text-xs text-white/30">
            © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-6 font-body text-xs text-white/30">
            <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy Policy</Link>
            <Link href="/terms"   className="hover:text-white/60 transition-colors">Terms of Service</Link>
            <Link href="/cookies" className="hover:text-white/60 transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
