import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Poppins, JetBrains_Mono } from 'next/font/google';
import '@/styles/globals.css';
import { RootLayoutClient } from './layout-client';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['400', '500', '600', '700', '800'],
});

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500', '600', '700'],
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'TANTA | Luxury Fashion House',
  description: 'Modern Luxury, Timeless Style. Discover TANTA — contemporary fashion crafted for those who live boldly.',
  openGraph: {
    title: 'TANTA',
    description: 'Modern Luxury, Timeless Style',
    type: 'website',
    url: 'https://tanta.style',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0a0a0a',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${poppins.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased" style={{ background: 'var(--color-ivory)', color: 'var(--color-black)' }} suppressHydrationWarning>
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}
