'use client';

import { ReactNode } from 'react';

// Zustand works without a provider — this is a placeholder
// in case server-side store initialization is needed later.
export function StoreProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
