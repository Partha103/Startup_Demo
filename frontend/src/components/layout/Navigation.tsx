'use client';

import Link from 'next/link';
import { Menu, ShoppingBag, User, X } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ApiError, getCart, getCurrentUser } from '@/lib/api';
import { NAVIGATION_LINKS, BRAND } from '@/lib/constants';
import { useStore } from '@/store/store';
import { RegionDropdown } from '@/components/layout/RegionSelector';
import { SearchBar } from '@/components/common/SearchBar';

export default function Navigation() {
  const [isOpen, setIsOpen]         = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { cartCount, setCartCount, setCartOpen, isCartOpen, setUser, user } = useStore();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Fixed: cleanup correctly returned from useEffect (not inside async body)
  const syncSession = useCallback(() => {
    let active = true;
    const run = async () => {
      try {
        const [cart, currentUser] = await Promise.all([
          getCart().catch((e: unknown) =>
            e instanceof ApiError && e.statusCode === 401 ? [] : Promise.reject(e)
          ),
          getCurrentUser().catch((e: unknown) =>
            e instanceof ApiError && e.statusCode === 401 ? null : Promise.reject(e)
          ),
        ]);
        if (!active) return;
        setCartCount(cart.reduce((s, i) => s + i.quantity, 0));
        setUser(currentUser);
      } catch {
        if (!active) return;
        setCartCount(0);
        setUser(null);
      }
    };
    void run();
    return () => { active = false; };
  }, [setCartCount, setUser]);

  useEffect(() => syncSession(), [syncSession]);

  const navBg = isScrolled
    ? 'bg-white/96 backdrop-blur-md shadow-sm border-b border-[#e5e0d8]'
    : 'bg-transparent';

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${navBg}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* ── Utility bar — desktop only ── */}
        <div className="hidden md:flex items-center bg-[#0a0a0a] px-container py-2 gap-4">
          {/* Left text */}
          <span className="font-body text-[10px] tracking-[0.2em] text-white/30 flex-1">
            Complimentary shipping on orders over $250
          </span>
          {/* Centre text — kept short so it never overlaps the main nav brand */}
          <span className="font-body text-[10px] tracking-[0.2em] text-white/40 flex-shrink-0">
            New Collection — Available Now
          </span>
          {/* Right: region picker */}
          <div className="flex-1 flex justify-end text-white">
            <RegionDropdown />
          </div>
        </div>

        {/* ── Main nav bar — 3-column grid so brand is always truly centred ── */}
        <div className="px-container">
          {/*
            FIX: replaced `absolute left-1/2 -translate-x-1/2` (which caused
            the brand to float over the utility bar and be overridden by link
            stacking contexts) with a 3-column CSS grid where the centre cell
            holds the brand and left/right cells hold nav links / icons.
          */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center h-16 md:h-[60px] gap-4">

            {/* ── Col 1: left nav links (desktop) + hamburger (mobile) ── */}
            <div className="flex items-center">
              {/* Mobile hamburger */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 -ml-2 hover:opacity-60 transition-opacity"
                aria-label={isOpen ? 'Close menu' : 'Open menu'}
              >
                {isOpen ? <X size={22} /> : <Menu size={22} />}
              </button>

              {/* Desktop left links */}
              <div className="hidden md:flex items-center gap-8">
                {NAVIGATION_LINKS.slice(0, 3).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="font-body text-xs font-medium tracking-[0.15em] text-[#0a0a0a] hover:text-[#c9a96e] transition-colors luxury-underline whitespace-nowrap"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* ── Col 2: Brand logo — always perfectly centred ── */}
            <Link
              href="/"
              className="font-display text-xl md:text-2xl font-bold tracking-[0.3em] text-[#0a0a0a] hover:text-[#c9a96e] transition-colors whitespace-nowrap select-none"
            >
              {BRAND.name}
            </Link>

            {/* ── Col 3: right nav links (desktop) + icons ── */}
            <div className="flex items-center justify-end gap-4 md:gap-5">
              {/* Desktop right links */}
              <div className="hidden md:flex items-center gap-8">
                {NAVIGATION_LINKS.slice(3).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="font-body text-xs font-medium tracking-[0.15em] text-[#0a0a0a] hover:text-[#c9a96e] transition-colors luxury-underline whitespace-nowrap"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Icon cluster */}
              <SearchBar />

              <Link
                href={user ? '/account' : '/auth'}
                className="hidden md:block p-1.5 hover:opacity-60 transition-opacity"
                aria-label="Account"
              >
                <User size={18} />
              </Link>

              <button
                onClick={() => setCartOpen(!isCartOpen)}
                className="relative p-1.5 hover:opacity-60 transition-opacity"
                aria-label="Open cart"
              >
                <ShoppingBag size={18} />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-[#c9a96e] text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none"
                  >
                    {cartCount > 9 ? '9+' : cartCount}
                  </motion.span>
                )}
              </button>

              {/* Mobile: region picker */}
              <div className="md:hidden">
                <RegionDropdown />
              </div>
            </div>
          </div>

          {/* ── Mobile slide-down menu ── */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                className="md:hidden overflow-hidden border-t border-[#e5e0d8]"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <nav className="bg-white py-6 px-2 space-y-1">
                  {NAVIGATION_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="block font-body text-sm font-medium tracking-[0.15em] text-[#0a0a0a] hover:text-[#c9a96e] hover:bg-[#f7f4ef] transition-all px-3 py-3 rounded"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="pt-3 mt-3 border-t border-[#e5e0d8] space-y-1">
                    <Link
                      href={user ? '/account' : '/auth'}
                      onClick={() => setIsOpen(false)}
                      className="block font-body text-sm tracking-widest hover:text-[#c9a96e] hover:bg-[#f7f4ef] transition-all px-3 py-3 rounded"
                    >
                      {user ? 'MY ACCOUNT' : 'SIGN IN'}
                    </Link>
                    <Link
                      href="/size-guide"
                      onClick={() => setIsOpen(false)}
                      className="block font-body text-sm tracking-widest hover:text-[#c9a96e] hover:bg-[#f7f4ef] transition-all px-3 py-3 rounded"
                    >
                      SIZE GUIDE
                    </Link>
                  </div>
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* Height spacer — exactly matches nav height so page content starts below */}
      <div className="h-16 md:h-[88px]" aria-hidden="true" />
    </>
  );
}
