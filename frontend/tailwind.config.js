/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // LUMIÈRE Brand Palette
        'lumiere-black':    '#0a0a0a',
        'lumiere-white':    '#fafafa',
        'lumiere-ivory':    '#fffef9',
        'lumiere-cream':    '#f7f4ef',
        'lumiere-charcoal': '#1a1a1a',
        'lumiere-slate':    '#2a2a2a',
        'lumiere-gold':     '#c9a96e',
        'lumiere-gold-lt':  '#e8d5a3',
        'lumiere-gold-dk':  '#9a7a42',
        'lumiere-muted':    '#6b7280',
        'lumiere-border':   '#e5e0d8',

        // Keep rebellion aliases for backward compatibility with any remaining components
        'rebellion-black':    '#0a0a0a',
        'rebellion-white':    '#fafafa',
        'rebellion-cream':    '#f7f4ef',
        'rebellion-charcoal': '#1a1a1a',
        'rebellion-slate':    '#2a2a2a',
        'rebellion-red':      '#c9a96e',   // remapped to gold
        'rebellion-gold':     '#c9a96e',

        background: '#fffef9',
        foreground: '#0a0a0a',
        muted: '#6b7280',
        'muted-foreground': '#9ca3af',
        border: '#e5e0d8',
        destructive: '#dc2626',
      },
      fontFamily: {
        display: ['var(--font-heading)', 'serif'],
        body:    ['var(--font-body)', 'sans-serif'],
        mono:    ['var(--font-mono)', 'monospace'],
      },
      fontSize: {
        xs:   ['0.75rem',  { lineHeight: '1rem' }],
        sm:   ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem',     { lineHeight: '1.5rem' }],
        lg:   ['1.125rem', { lineHeight: '1.75rem' }],
        xl:   ['1.25rem',  { lineHeight: '1.75rem' }],
        '2xl':['1.5rem',   { lineHeight: '2rem' }],
        '3xl':['1.875rem', { lineHeight: '2.25rem' }],
        '4xl':['2.25rem',  { lineHeight: '2.5rem' }],
        '5xl':['3rem',     { lineHeight: '1.1' }],
        '6xl':['3.75rem',  { lineHeight: '1' }],
        '7xl':['4.5rem',   { lineHeight: '1' }],
      },
      letterSpacing: {
        tighter: '-0.02em',
        tight:   '-0.01em',
        normal:  '0em',
        wide:    '0.02em',
        wider:   '0.05em',
        widest:  '0.15em',
      },
      boxShadow: {
        sm:      '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md:      '0 4px 6px -1px rgba(0, 0, 0, 0.08)',
        lg:      '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl:      '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        '2xl':   '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
        luxury:  '0 20px 60px rgba(0, 0, 0, 0.12)',
        gold:    '0 4px 20px rgba(201, 169, 110, 0.25)',
      },
      spacing: {
        section:   'clamp(4rem, 10vw, 8rem)',
        container: 'clamp(1.25rem, 4vw, 3rem)',
      },
      animation: {
        'fade-in':  'fadeIn 0.6s ease-out',
        'fade-out': 'fadeOut 0.4s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'shimmer':  'shimmer 4s linear infinite',
        'float':    'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        fadeOut: { '0%': { opacity: '1' }, '100%': { opacity: '0' } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        shimmer: { '0%': { backgroundPosition: '-200% center' }, '100%': { backgroundPosition: '200% center' } },
        float:   { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-8px)' } },
      },
    },
  },
  plugins: [],
};
