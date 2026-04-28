'use client';

import { ReactNode } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import { StoreProvider } from '@/store/provider';
import RegionSystem from '@/components/layout/RegionSelector';

export function RootLayoutClient({ children }: { children: ReactNode }) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  return (
    <StoreProvider>
      <GoogleOAuthProvider clientId={googleClientId}>
        {/* Region system: initialiser + first-visit modal + currency toast */}
        <RegionSystem />
        <Navigation />
        <CartDrawer />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </GoogleOAuthProvider>
    </StoreProvider>
  );
}
