import { create } from 'zustand';
import type { User } from '@/types/api';
import {
  DEFAULT_REGION,
  REGION_STORAGE_KEY,
  getRegionByCode,
  type Region,
} from '@/lib/regions';

// ── Helpers ──────────────────────────────────────────────────────────────────

function loadRegion(): Region {
  if (typeof window === 'undefined') return DEFAULT_REGION;
  try {
    const stored = localStorage.getItem(REGION_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as { code?: string };
      const found  = parsed?.code ? getRegionByCode(parsed.code) : undefined;
      if (found) return found;
    }
  } catch { /* ignore */ }
  return DEFAULT_REGION;
}

function persistRegion(region: Region): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(REGION_STORAGE_KEY, JSON.stringify({ code: region.code }));
  } catch { /* ignore */ }
}

// ── Store ─────────────────────────────────────────────────────────────────────

interface StoreState {
  // Cart
  cartCount:    number;
  setCartCount: (count: number) => void;

  // Auth
  user:            User | null;
  setUser:         (user: User | null) => void;
  isAuthenticated: boolean;

  // UI
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  isMenuOpen:  boolean;
  setMenuOpen:  (open: boolean) => void;

  // Region / currency
  region:           Region;
  setRegion:        (region: Region) => void;
  regionModalOpen:  boolean;
  setRegionModal:   (open: boolean) => void;
  regionInitialised: boolean;
  setRegionInitialised: (v: boolean) => void;
}

export const useStore = create<StoreState>()((set) => ({
  cartCount:    0,
  setCartCount: (count) => set({ cartCount: count }),

  user:            null,
  setUser:         (user) => set({ user, isAuthenticated: !!user }),
  isAuthenticated: false,

  isCartOpen: false,
  setCartOpen: (open) => set({ isCartOpen: open }),
  isMenuOpen:  false,
  setMenuOpen:  (open) => set({ isMenuOpen: open }),

  // Region — loaded from localStorage on first render (client only)
  region:     DEFAULT_REGION,
  setRegion:  (region) => {
    persistRegion(region);
    set({ region });
  },
  regionModalOpen:     false,
  setRegionModal:      (open) => set({ regionModalOpen: open }),
  regionInitialised:   false,
  setRegionInitialised:(v) => set({ regionInitialised: v }),
}));

// Re-export for convenience
export { loadRegion };
