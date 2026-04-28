'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';

const SLIDES = [
  {
    season:   'Spring / Summer 2026',
    headline: ['The Art of', 'Understated', 'Luxury'],
    sub:      'New collection — arrive in radiance',
    cta:      { label: 'Explore Collection', href: '/collections' },
    img:      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=80',
  },
  {
    season:   'The Essentials Edit',
    headline: ['Effortless', 'Refined', 'Presence'],
    sub:      'Timeless pieces for the modern wardrobe',
    cta:      { label: 'Shop Essentials', href: '/shop' },
    img:      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1600&q=80',
  },
];

export default function HomeHero() {
  const [current, setCurrent] = useState(0);
  const containerRef          = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target:  containerRef,
    offset:  ['start start', 'end start'],
  });
  // Clamp parallax to avoid overscroll artifacts
  const y       = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  useEffect(() => {
    const id = setInterval(() => setCurrent((c) => (c + 1) % SLIDES.length), 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full overflow-hidden"
      style={{ height: 'calc(100vh - 88px)', minHeight: 480 }}
    >
      {/* Parallax image layer */}
      <motion.div className="absolute inset-0 z-0" style={{ y }}>
        {SLIDES.map((s, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: i === current ? 1 : 0 }}
          >
            <img
              src={s.img}
              alt=""
              className="w-full h-full object-cover"
              loading={i === 0 ? 'eager' : 'lazy'}
              // fetchPriority removed — not in all TS environments
            />
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to right, rgba(10,10,10,0.72) 0%, rgba(10,10,10,0.28) 60%, rgba(10,10,10,0.06) 100%)' }}
            />
          </div>
        ))}
      </motion.div>

      {/* Text content */}
      <motion.div
        className="relative z-10 h-full flex flex-col justify-center px-container"
        style={{ opacity }}
      >
        <motion.div
          key={current}
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl"
        >
          <p className="font-body text-xs tracking-[0.3em] mb-5 text-[#c9a96e]">
            {SLIDES[current].season}
          </p>

          <h1
            className="font-display font-light text-white mb-6 leading-tight"
            style={{ fontSize: 'clamp(2.8rem, 8vw, 6rem)', letterSpacing: '-0.02em' }}
          >
            {SLIDES[current].headline.map((line, i) => (
              <motion.span
                key={`${current}-${i}`}
                className="block"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: i * 0.12 }}
              >
                {i === 1 ? <em className="not-italic italic">{line}</em> : line}
              </motion.span>
            ))}
          </h1>

          <motion.p
            className="font-body text-base text-white/65 mb-10 max-w-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.65, delay: 0.42 }}
          >
            {SLIDES[current].sub}
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.55 }}
          >
            <Link
              href={SLIDES[current].cta.href}
              className="inline-flex items-center justify-center px-10 py-4 font-body text-xs tracking-[0.2em] font-medium text-white transition-opacity hover:opacity-80"
              style={{ background: '#c9a96e' }}
            >
              {SLIDES[current].cta.label}
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center px-10 py-4 border border-white/40 font-body text-xs tracking-[0.2em] font-medium text-white hover:bg-white/10 transition-all"
            >
              SHOP ALL
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Slide indicator dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className="transition-all duration-300"
            style={{
              width:      i === current ? 28 : 8,
              height:     2,
              background: i === current ? '#c9a96e' : 'rgba(255,255,255,0.4)',
            }}
          />
        ))}
      </div>

      {/* Scroll hint */}
      <motion.div
        className="absolute bottom-8 right-8 z-20 hidden md:flex flex-col items-center gap-2"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="font-body text-[9px] tracking-[0.25em] text-white/40 writing-mode-vertical">SCROLL</span>
        <div className="w-px h-10 bg-gradient-to-b from-white/40 to-transparent" />
      </motion.div>
    </section>
  );
}
