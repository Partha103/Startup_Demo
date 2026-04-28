const rawBackendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.REACT_APP_BACKEND_URL ||
  'http://localhost:8080';

export const BACKEND_URL = rawBackendUrl.replace(/\/api\/?$/, '');
export const API_BASE = `${BACKEND_URL}/api`;

export const BRAND = {
  name: 'TANTA',
  tagline: 'Modern Luxury, Timeless Style',
  description: 'Contemporary fashion crafted for those who live boldly.',
  email: 'hello@tanta.style',
  instagram: 'https://instagram.com/tantastyle',
};

export const NAVIGATION_LINKS = [
  { label: 'New In',      href: '/shop?sort=new' },
  { label: 'Women',       href: '/shop?category=women' },
  { label: 'Men',         href: '/shop?category=men' },
  { label: 'Collections', href: '/collections' },
  { label: 'The Edit',    href: '/shop?sort=curated' },
];

export const CATEGORIES = [
  { id: 'dresses',    label: 'Dresses',    href: '/shop?category=dresses' },
  { id: 'basics',     label: 'Essentials', href: '/shop?category=basics' },
  { id: 'outerwear',  label: 'Outerwear',  href: '/shop?category=outerwear' },
  { id: 'trousers',   label: 'Trousers',   href: '/shop?category=trousers' },
  { id: 'accessories',label: 'Accessories',href: '/shop?category=accessories' },
];

export const FILTER_OPTIONS = {
  sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  colors: ['Ivory', 'Noir', 'Champagne', 'Taupe', 'Sage', 'Midnight'],
  priceRanges: [
    { label: 'Under $200',    min: 0,    max: 200 },
    { label: '$200 – $500',   min: 200,  max: 500 },
    { label: '$500 – $1,000', min: 500,  max: 1000 },
    { label: 'Over $1,000',   min: 1000, max: 99999 },
  ],
};

export const FOOTER_SECTIONS = {
  shop: [
    { label: 'New Arrivals',  href: '/shop?sort=new' },
    { label: 'Bestsellers',   href: '/shop?sort=bestsellers' },
    { label: 'The Edit',      href: '/shop?sort=curated' },
    { label: 'All Products',  href: '/shop' },
  ],
  customer: [
    { label: 'My Account',    href: '/account' },
    { label: 'My Orders',     href: '/account' },
    { label: 'Size Guide',    href: '/size-guide' },
    { label: 'Shipping Info', href: '/shipping' },
    { label: 'Returns',       href: '/returns' },
  ],
  company: [
    { label: 'About TANTA', href: '/about' },
    { label: 'Sustainability', href: '/sustainability' },
    { label: 'Careers',        href: '/careers' },
    { label: 'Press',          href: '/press' },
  ],
};
