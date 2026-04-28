'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, X, Check, ChevronDown, MapPin } from 'lucide-react';
import { REGIONS, matchRegionByCountry, getGroupedRegions, type Region } from '@/lib/regions';
import { useStore, loadRegion } from '@/store/store';

// ── IP detection ──────────────────────────────────────────────────────────────

async function detectRegionByIP(): Promise<Region | null> {
  try {
    // Bug fix: AbortSignal.timeout() not universally available; use manual abort
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    const data = await res.json() as { country_code?: string };
    return data.country_code ? matchRegionByCountry(data.country_code) : null;
  } catch {
    return null;
  }
}

// ── First-visit modal ─────────────────────────────────────────────────────────

function RegionModal() {
  const { region, setRegion, regionModalOpen, setRegionModal, setRegionInitialised } = useStore();
  const [selected, setSelected]   = useState<Region>(region);
  const [detecting, setDetecting] = useState(false);
  const [detected, setDetected]   = useState<Region | null>(null);
  const grouped = getGroupedRegions();

  useEffect(() => {
    if (!regionModalOpen) return;
    let active = true;
    setDetecting(true);
    detectRegionByIP().then((r) => {
      if (!active) return;
      if (r) { setDetected(r); setSelected(r); }
      setDetecting(false);
    });
    return () => { active = false; };
  }, [regionModalOpen]);

  const confirm = () => {
    setRegion(selected);
    setRegionModal(false);
    setRegionInitialised(true);
  };

  const dismiss = () => {
    setRegionModal(false);
    setRegionInitialised(true);
  };

  return (
    <AnimatePresence>
      {regionModalOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismiss}
          />
          <div className="fixed inset-0 z-[201] flex items-center justify-center p-4">
            <motion.div
              className="w-full max-w-lg bg-white shadow-2xl overflow-hidden"
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-8 py-6 border-b border-[#e5e0d8]">
                <div className="flex items-center gap-3">
                  <Globe size={18} className="text-[#c9a96e]" />
                  <div>
                    <p className="font-display text-lg font-light">Choose your region</p>
                    <p className="font-body text-xs text-[#6b7280] mt-0.5">Prices shown in your local currency</p>
                  </div>
                </div>
                <button onClick={dismiss} className="p-1.5 hover:opacity-60 transition-opacity">
                  <X size={18} />
                </button>
              </div>

              {/* IP suggestion banner */}
              {!detecting && detected && detected.code !== region.code && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-[#f7f4ef] border-b border-[#e5e0d8] px-8 py-3 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-2">
                    <MapPin size={13} className="text-[#c9a96e] flex-shrink-0" />
                    <span className="font-body text-xs text-[#6b7280]">
                      We detected <strong className="text-[#0a0a0a]">{detected.name}</strong> from your location
                    </span>
                  </div>
                  <button
                    onClick={() => setSelected(detected)}
                    className={`flex-shrink-0 font-body text-xs tracking-[0.1em] px-3 py-1.5 border transition-all ${
                      selected.code === detected.code
                        ? 'bg-[#0a0a0a] text-white border-[#0a0a0a]'
                        : 'border-[#c9a96e] text-[#c9a96e] hover:bg-[#c9a96e] hover:text-white'
                    }`}
                  >
                    {selected.code === detected.code ? '✓ Selected' : 'USE THIS'}
                  </button>
                </motion.div>
              )}
              {detecting && (
                <div className="bg-[#f7f4ef] border-b border-[#e5e0d8] px-8 py-3 flex items-center gap-2">
                  <div className="w-3 h-3 border border-[#c9a96e] border-t-transparent rounded-full animate-spin" />
                  <span className="font-body text-xs text-[#6b7280]">Detecting your location…</span>
                </div>
              )}

              {/* Region list */}
              <div className="px-8 py-4 max-h-[340px] overflow-y-auto">
                {Object.entries(grouped).map(([continent, regions]) => (
                  <div key={continent} className="mb-5">
                    <p className="font-body text-[10px] tracking-[0.2em] text-[#c9a96e] mb-3">{continent.toUpperCase()}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {regions.map((r) => (
                        <button
                          key={r.code}
                          onClick={() => setSelected(r)}
                          className={`flex items-center gap-3 px-4 py-3 border text-left transition-all ${
                            selected.code === r.code
                              ? 'border-[#0a0a0a] bg-[#0a0a0a] text-white'
                              : 'border-[#e5e0d8] hover:border-[#c9a96e]'
                          }`}
                        >
                          <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}>{r.flag}</span>
                          <div className="min-w-0">
                            <p className={`font-body text-xs font-medium leading-tight truncate ${selected.code === r.code ? 'text-white' : ''}`}>
                              {r.name}
                            </p>
                            <p className={`font-body text-[10px] mt-0.5 ${selected.code === r.code ? 'text-white/70' : 'text-[#6b7280]'}`}>
                              {r.symbol} {r.currency}
                            </p>
                          </div>
                          {selected.code === r.code && <Check size={12} className="ml-auto flex-shrink-0 text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Confirm footer */}
              <div className="px-8 py-5 border-t border-[#e5e0d8] flex items-center justify-between gap-4">
                <p className="font-body text-xs text-[#6b7280]">
                  Change anytime from the top navigation bar.
                </p>
                <button
                  onClick={confirm}
                  className="px-8 py-3 bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white font-body text-xs tracking-[0.2em] transition-colors whitespace-nowrap"
                >
                  CONFIRM — {selected.symbol} {selected.currency}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Navbar dropdown ───────────────────────────────────────────────────────────

export function RegionDropdown() {
  const { region, setRegion } = useStore();
  const [open, setOpen]       = useState(false);
  const [search, setSearch]   = useState('');
  const ref                   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); setSearch(''); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const filtered = search.trim()
    ? REGIONS.filter((r) =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.currency.toLowerCase().includes(search.toLowerCase())
      )
    : REGIONS;

  const select = (r: Region) => { setRegion(r); setOpen(false); setSearch(''); };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1.5 font-body text-xs tracking-[0.1em] hover:text-[#c9a96e] transition-colors"
        aria-label="Change region"
        aria-expanded={open}
      >
        <span style={{ fontSize: 14, lineHeight: 1 }}>{region.flag}</span>
        <span className="hidden sm:inline">{region.currency}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={12} />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute right-0 top-full mt-3 w-72 bg-white border border-[#e5e0d8] shadow-xl z-50"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.2 }}
          >
            {/* Search */}
            <div className="p-3 border-b border-[#e5e0d8]">
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search region or currency…"
                className="w-full px-3 py-2 bg-[#f7f4ef] border border-[#e5e0d8] focus:border-[#c9a96e] outline-none font-body text-xs"
              />
            </div>

            {/* Current */}
            <div className="px-3 pt-2 pb-1">
              <p className="font-body text-[10px] tracking-[0.15em] text-[#c9a96e] mb-2">CURRENT</p>
              <div className="flex items-center gap-3 px-3 py-2.5 bg-[#0a0a0a] text-white">
                <span style={{ fontSize: 14 }}>{region.flag}</span>
                <div>
                  <p className="font-body text-xs font-medium">{region.name}</p>
                  <p className="font-body text-[10px] text-white/60">{region.symbol} {region.currency}</p>
                </div>
                <Check size={12} className="ml-auto" />
              </div>
            </div>

            {/* List */}
            <div className="max-h-60 overflow-y-auto px-3 pb-3">
              {filtered.length === 0 ? (
                <p className="font-body text-xs text-[#6b7280] py-4 text-center">No regions found</p>
              ) : (
                filtered.filter((r) => r.code !== region.code).map((r) => (
                  <button
                    key={r.code}
                    onClick={() => select(r)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#f7f4ef] transition-colors text-left group/item"
                  >
                    <span style={{ fontSize: 14 }}>{r.flag}</span>
                    <div>
                      <p className="font-body text-xs font-medium group-hover/item:text-[#c9a96e] transition-colors">{r.name}</p>
                      <p className="font-body text-[10px] text-[#6b7280]">{r.symbol} {r.currency}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Region initialiser ────────────────────────────────────────────────────────

export function RegionInitialiser() {
  const { setRegion, setRegionModal, setRegionInitialised, regionInitialised } = useStore();

  useEffect(() => {
    if (regionInitialised) return;
    // Hydrate from localStorage
    const stored = loadRegion();
    setRegion(stored);
    setRegionInitialised(true);

    // Show modal only on first ever visit
    try {
      const hasVisited = localStorage.getItem('tanta_visited');
      if (!hasVisited) {
        localStorage.setItem('tanta_visited', '1');
        const id = setTimeout(() => setRegionModal(true), 1500);
        return () => clearTimeout(id);
      }
    } catch { /* localStorage may be unavailable */ }
  }, [regionInitialised, setRegion, setRegionModal, setRegionInitialised]);

  return null;
}

// ── Currency changed toast ────────────────────────────────────────────────────

export function CurrencyChangedToast() {
  const { region } = useStore();
  const [prev, setPrev]       = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (prev === null) { setPrev(region.currency); return; }
    if (prev !== region.currency) {
      setPrev(region.currency);
      setVisible(true);
      const id = setTimeout(() => setVisible(false), 2800);
      return () => clearTimeout(id);
    }
  }, [region.currency, prev]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-3 bg-[#0a0a0a] text-white px-5 py-3 shadow-xl pointer-events-none"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3 }}
        >
          <span style={{ fontSize: 16 }}>{region.flag}</span>
          <span className="font-body text-xs tracking-[0.1em]">
            Prices now in <strong>{region.currency}</strong> ({region.symbol})
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Default export: full region system ───────────────────────────────────────

export default function RegionSystem() {
  return (
    <>
      <RegionInitialiser />
      <RegionModal />
      <CurrencyChangedToast />
    </>
  );
}
