'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Share2, ChevronDown, Minus, Plus, ArrowLeft, Loader, Check } from 'lucide-react';
import { addToCart, addToWishlist, ApiError, getCart, getProduct, getWishlist, removeFromWishlist, getProducts } from '@/lib/api';
import type { Product } from '@/types/api';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';
import { useStore } from '@/store/store';
import Link from 'next/link';
import ProductCard from '@/components/common/ProductCard';

const PLACEHOLDER_IMGS = [
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=80',
];

export default function ProductPage() {
  const params    = useParams<{ id: string }>();
  const productId = params?.id ?? '';
  const router    = useRouter();

  const [product, setProduct]             = useState<Product | null>(null);
  const [related, setRelated]             = useState<Product[]>([]);
  const [loading, setLoading]             = useState(true);
  const [notFound, setNotFound]           = useState(false);
  const [selectedSize, setSelectedSize]   = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity]           = useState(1);
  const [favorited, setFavorited]         = useState(false);
  const [currentImg, setCurrentImg]       = useState(0);
  const [addMsg, setAddMsg]               = useState<string | null>(null);
  const [addError, setAddError]           = useState<string | null>(null);
  const [submitting, setSubmitting]       = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>('description');
  const [copied, setCopied]              = useState(false);

  const { setCartCount, setCartOpen } = useStore();
  const { format } = useCurrencyFormatter();

  useEffect(() => {
    if (!productId) return;
    let active = true;
    const load = async () => {
      setLoading(true);
      setNotFound(false);
      setAddMsg(null);
      setAddError(null);
      try {
        const [data, wishlist, allProducts] = await Promise.all([
          getProduct(productId),
          getWishlist().catch((e: unknown) => (e instanceof ApiError && e.statusCode === 401 ? [] : [])),
          getProducts().catch(() => [] as Product[]),
        ]);
        if (!active) return;
        setProduct(data);
        setSelectedSize(data.sizes[0] ?? '');
        setSelectedColor(data.colors[0] ?? '');
        setCurrentImg(0);
        setQuantity(1);
        setFavorited(wishlist.some((i) => i.product_id === data.product_id));
        setRelated(
          allProducts
            .filter((p) => p.product_id !== data.product_id && p.category === data.category)
            .slice(0, 4)
        );
      } catch (err) {
        if (!active) return;
        if (err instanceof ApiError && err.statusCode === 404) setNotFound(true);
        else setAddError('Unable to load product. Please try again.');
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [productId]);

  const selectedVariant = product?.variants.find(
    (v) => v.size === selectedSize && v.color === selectedColor
  );
  const displayPrice = selectedVariant?.price ?? product?.price ?? 0;
  const inStock      = selectedVariant
    ? selectedVariant.available_stock > 0
    : (product?.total_available ?? 0) > 0;

  const images = product?.images?.length
    ? product.images
    : PLACEHOLDER_IMGS.slice(0, 3).map(
        (_, i) => PLACEHOLDER_IMGS[(Number(productId) % PLACEHOLDER_IMGS.length + i) % PLACEHOLDER_IMGS.length]
      );

  const handleAddToCart = useCallback(async () => {
    if (!product || !selectedSize || !selectedColor) {
      setAddError('Please select a size and colour.'); return;
    }
    setSubmitting(true); setAddMsg(null); setAddError(null);
    try {
      await addToCart({ product_id: product.product_id, size: selectedSize, color: selectedColor, quantity });
      const cart = await getCart();
      setCartCount(cart.reduce((s, i) => s + i.quantity, 0));
      setAddMsg('Added to your bag');
      setCartOpen(true);
      setTimeout(() => setAddMsg(null), 3000);
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 401) router.push('/auth');
      else setAddError(err instanceof ApiError ? err.message : 'Could not add to bag. Please try again.');
    } finally { setSubmitting(false); }
  }, [product, selectedSize, selectedColor, quantity, setCartCount, setCartOpen, router]);

  const handleWishlist = useCallback(async () => {
    if (!product) return;
    try {
      favorited ? await removeFromWishlist(product.product_id) : await addToWishlist(product.product_id);
      setFavorited((p) => !p);
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 401) router.push('/auth');
    }
  }, [favorited, product, router]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* fallback: do nothing */ }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-ivory)' }}>
        <Loader size={28} className="animate-spin text-[#c9a96e]" />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: 'var(--color-ivory)' }}>
        <p className="font-display text-2xl font-light">Product not found</p>
        <Link href="/shop" className="font-body text-sm text-[#c9a96e] hover:underline">Back to shop</Link>
      </div>
    );
  }

  const accordions = [
    { id: 'description', label: 'Description',    content: product.description },
    { id: 'details',     label: 'Product Details', content: [product.fabric && `Fabric: ${product.fabric}`, product.fit && `Fit: ${product.fit}`, `Category: ${product.category}`].filter(Boolean).join('\n') },
    { id: 'shipping',    label: 'Shipping & Returns', content: 'Complimentary shipping on orders over $250. Standard delivery in 3–5 business days. Free returns within 30 days of delivery.' },
    { id: 'care',        label: 'Care Guide',     content: 'Dry clean recommended. Store in the garment bag provided. Iron on low heat with a pressing cloth. Do not tumble dry.' },
  ];

  return (
    <div style={{ background: 'var(--color-ivory)' }}>
      {/* Breadcrumb */}
      <div className="px-container py-4 flex items-center gap-2 font-body text-xs text-[#6b7280] border-b border-[#e5e0d8]">
        <Link href="/" className="hover:text-[#0a0a0a] transition-colors">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-[#0a0a0a] transition-colors">Shop</Link>
        <span>/</span>
        {product.category && (
          <>
            <Link href={`/shop?category=${product.category}`} className="hover:text-[#0a0a0a] transition-colors capitalize">
              {product.category}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-[#0a0a0a] line-clamp-1">{product.name}</span>
      </div>

      {/* Main */}
      <div className="px-container py-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-20">

          {/* ── Images ── */}
          <div className="flex gap-3">
            {/* Thumbnails — desktop */}
            <div className="hidden md:flex flex-col gap-2 w-[72px] flex-shrink-0">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImg(i)}
                  className={`relative overflow-hidden transition-all ${i === currentImg ? 'ring-2 ring-[#c9a96e]' : 'ring-1 ring-[#e5e0d8] hover:ring-[#c9a96e]'}`}
                  style={{ paddingBottom: '120%' }}
                >
                  <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Main image */}
            <div className="flex-1 relative overflow-hidden bg-[#f0ede8]" style={{ paddingBottom: '125%' }}>
              {images.map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt={i === currentImg ? product.name : ""}
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-350"
                  style={{ opacity: i === currentImg ? 1 : 0 }}
                  loading={i === 0 ? "eager" : "lazy"}
                />
              ))}

              {/* Mobile dots */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 md:hidden">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImg(i)}
                      className="transition-all"
                      style={{
                        width:      i === currentImg ? 20 : 6,
                        height:     2,
                        background: i === currentImg ? '#c9a96e' : 'rgba(0,0,0,0.3)',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Product info ── */}
          <div className="lg:sticky lg:top-[100px] lg:self-start">
            <Link href="/shop" className="inline-flex items-center gap-1 font-body text-xs text-[#6b7280] hover:text-[#0a0a0a] transition-colors mb-5 md:hidden">
              <ArrowLeft size={12} /> Back
            </Link>

            <p className="font-body text-xs tracking-[0.2em] text-[#c9a96e] mb-2">{product.category?.toUpperCase()}</p>
            <h1 className="font-display text-3xl md:text-4xl font-light tracking-tight mb-3">{product.name}</h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-5">
              <p className="font-body text-2xl font-light">{format(displayPrice)}</p>
              {selectedVariant && displayPrice !== product.price && (
                <p className="font-body text-sm text-[#6b7280]">({format(product.price)} base)</p>
              )}
            </div>

            {/* Stock pill */}
            <div className="flex items-center gap-2 mb-6">
              <div className={`w-2 h-2 rounded-full ${inStock ? 'bg-green-500' : 'bg-red-400'}`} />
              <span className="font-body text-xs tracking-[0.1em] text-[#6b7280]">
                {inStock
                  ? (selectedVariant ? `${selectedVariant.available_stock} left` : 'In Stock')
                  : 'Sold Out'}
              </span>
            </div>

            {/* Colour */}
            {product.colors.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-body text-xs tracking-[0.15em] text-[#6b7280]">COLOUR</p>
                  <p className="font-body text-xs font-medium text-[#0a0a0a]">{selectedColor}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 border font-body text-xs transition-all ${
                        selectedColor === color
                          ? 'border-[#0a0a0a] bg-[#0a0a0a] text-white'
                          : 'border-[#e5e0d8] hover:border-[#0a0a0a]'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size */}
            {product.sizes.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-body text-xs tracking-[0.15em] text-[#6b7280]">SIZE</p>
                  <Link href="/size-guide" className="font-body text-xs text-[#c9a96e] hover:underline">
                    Size Guide
                  </Link>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => {
                    const v = product.variants.find((vv) => vv.size === size && vv.color === selectedColor);
                    const available = v ? v.available_stock > 0 : true;
                    return (
                      <button
                        key={size}
                        onClick={() => available && setSelectedSize(size)}
                        disabled={!available}
                        className={`w-12 h-12 border font-body text-xs transition-all ${
                          selectedSize === size
                            ? 'border-[#0a0a0a] bg-[#0a0a0a] text-white'
                            : available
                              ? 'border-[#e5e0d8] hover:border-[#0a0a0a]'
                              : 'border-[#e5e0d8] text-[#d0ccc5] cursor-not-allowed line-through'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-5">
              <div className="flex items-center border border-[#e5e0d8]">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="p-3 hover:bg-[#f7f4ef] transition-colors">
                  <Minus size={13} />
                </button>
                <span className="w-10 text-center font-body text-sm">{quantity}</span>
                <button onClick={() => setQuantity((q) => q + 1)} className="p-3 hover:bg-[#f7f4ef] transition-colors">
                  <Plus size={13} />
                </button>
              </div>
            </div>

            {/* Feedback */}
            <AnimatePresence>
              {addMsg && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mb-4 px-4 py-3 bg-[#f7f4ef] border border-[#c9a96e]/50 text-[#9a7a42] font-body text-sm flex items-center gap-2">
                  <Check size={13} /> {addMsg}
                </motion.div>
              )}
            </AnimatePresence>
            {addError && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 font-body text-sm">{addError}</div>
            )}

            {/* CTA row */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={submitting || !inStock}
                className="flex-1 py-4 bg-[#0a0a0a] hover:bg-[#1a1a1a] disabled:opacity-50 text-white font-body text-xs tracking-[0.2em] transition-all flex items-center justify-center gap-2"
              >
                {submitting ? <><Loader size={13} className="animate-spin" /> ADDING…</> : inStock ? 'ADD TO BAG' : 'SOLD OUT'}
              </button>
              <button
                onClick={handleWishlist}
                className={`p-4 border transition-all ${favorited ? 'border-[#c9a96e] bg-[#c9a96e]/5' : 'border-[#e5e0d8] hover:border-[#c9a96e]'}`}
                aria-label="Wishlist"
              >
                <Heart size={17} className={favorited ? 'fill-[#c9a96e] stroke-[#c9a96e]' : ''} />
              </button>
              <button
                onClick={handleShare}
                className="p-4 border border-[#e5e0d8] hover:border-[#0a0a0a] transition-all relative"
                aria-label="Share"
              >
                {copied ? <Check size={17} className="text-[#c9a96e]" /> : <Share2 size={17} />}
              </button>
            </div>

            {/* Accordions */}
            <div className="border-t border-[#e5e0d8]">
              {accordions.map(({ id, label, content }) => (
                <div key={id} className="border-b border-[#e5e0d8]">
                  <button
                    onClick={() => setOpenAccordion(openAccordion === id ? null : id)}
                    className="w-full flex items-center justify-between py-4 font-body text-xs tracking-[0.15em] hover:text-[#c9a96e] transition-colors text-left"
                  >
                    {label.toUpperCase()}
                    <motion.div animate={{ rotate: openAccordion === id ? 180 : 0 }} transition={{ duration: 0.22 }}>
                      <ChevronDown size={14} />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {openAccordion === id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden"
                      >
                        <p className="font-body text-sm text-[#6b7280] leading-relaxed pb-5 whitespace-pre-line">{content}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <section className="mt-24 pt-12 border-t border-[#e5e0d8]">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="font-body text-xs tracking-[0.25em] text-[#c9a96e] mb-2">YOU MAY ALSO LIKE</p>
                <h2 className="font-display text-3xl font-light">Complete the Look</h2>
              </div>
              <Link href="/shop" className="hidden md:flex items-center gap-2 font-body text-xs tracking-[0.15em] hover:text-[#c9a96e] transition-colors">
                VIEW ALL →
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p, i) => (
                <ProductCard key={p.product_id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
