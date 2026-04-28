'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Loader, Lock, CheckCircle } from 'lucide-react';
import { ApiError, createOrder, createStripeCheckout, getCart, getCurrentUser, getProduct } from '@/lib/api';
import type { CartItem, Product, ShippingAddress } from '@/types/api';
import { useRouter } from 'next/navigation';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';

interface LineItem extends CartItem { name: string; unitPrice: number; image?: string; }

function unitPrice(p: Product | undefined, item: CartItem) {
  if (!p) return 0;
  return p.variants.find((v) => v.size === item.size && v.color === item.color)?.price ?? p.price;
}

const STEPS = ['Bag', 'Shipping', 'Payment'];

export default function CheckoutPage() {
  const router = useRouter();
  const { format, stripeAmount, stripeCurrency, region } = useCurrencyFormatter();

  const [step, setStep]             = useState(0);
  const [items, setItems]           = useState<LineItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [notAuthed, setNotAuthed]   = useState(false);
  const [address, setAddress]       = useState<ShippingAddress>({
    name: '', address: '', city: '', postal_code: '', country: 'United States',
  });

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [user, cart] = await Promise.all([getCurrentUser(), getCart()]);
        if (!active) return;

        const ids = [...new Set(cart.map((i) => i.product_id))];
        const results = await Promise.allSettled(ids.map((id) => getProduct(id)));
        if (!active) return;

        const pMap = new Map<number, Product>();
        results.forEach((r, idx) => { if (r.status === 'fulfilled') pMap.set(ids[idx], r.value); });

        setItems(cart.map((i) => ({
          ...i,
          name: pMap.get(i.product_id)?.name ?? 'Product',
          unitPrice: unitPrice(pMap.get(i.product_id), i),
          image: pMap.get(i.product_id)?.images?.[0],
        })));
        setAddress((prev) => ({ ...prev, name: user.name ?? '' }));
      } catch (err) {
        if (!active) return;
        if (err instanceof ApiError && err.statusCode === 401) {
          setNotAuthed(true);
        } else {
          setError('Unable to load your cart. Please try again.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, []);

  // USD subtotals (backend stores prices in USD)
  const usdSubtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const usdShipping = usdSubtotal >= 250 ? 0 : 15;
  const usdTotal    = usdSubtotal + usdShipping;

  const handlePlaceOrder = async () => {
    if (!address.name || !address.address || !address.city) {
      setError('Please fill in all shipping fields.'); return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const orderPayload = {
        items: items.map((i) => ({
          product_id: i.product_id, name: i.name, quantity: i.quantity,
          price: i.unitPrice, size: i.size, color: i.color,
        })),
        total_amount: usdTotal,          // Always USD in database
        shipping_address: address,
        payment_method: 'stripe',
      };
      const { order_id } = await createOrder(orderPayload);

      // ── Stripe receives LOCAL currency amount ──
      const { checkout_url } = await createStripeCheckout({
        order_id,
        amount: stripeAmount(usdTotal),   // converted to local currency smallest unit
        currency: stripeCurrency,          // local currency code (e.g. 'inr', 'gbp')
      });
      window.location.href = checkout_url;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Payment could not be initiated. Please try again.');
      }
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-ivory)' }}>
        <Loader size={28} className="animate-spin text-[#c9a96e]" />
      </div>
    );
  }

  if (notAuthed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 p-8" style={{ background: 'var(--color-ivory)' }}>
        <Lock size={32} className="text-[#c9a96e]" />
        <h2 className="font-display text-2xl">Please sign in to checkout</h2>
        <Link href="/auth" className="px-8 py-3 bg-[#0a0a0a] text-white font-body text-xs tracking-[0.2em]">SIGN IN</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-container" style={{ background: 'var(--color-ivory)' }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <Link href="/shop" className="inline-flex items-center gap-2 font-body text-xs text-[#6b7280] hover:text-[#0a0a0a] mb-6 transition-colors">
            <ArrowLeft size={14} /> Continue shopping
          </Link>
          <div className="flex items-end justify-between">
            <h1 className="font-display text-3xl font-light">Checkout</h1>
            {/* Active currency indicator */}
            <div className="flex items-center gap-2 bg-[#f7f4ef] border border-[#e5e0d8] px-4 py-2">
              <span style={{ fontSize: 16 }}>{region.flag}</span>
              <span className="font-body text-xs text-[#6b7280]">Paying in</span>
              <span className="font-body text-xs font-medium text-[#0a0a0a]">{region.currency}</span>
            </div>
          </div>
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-0 mb-12">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center">
              <button
                onClick={() => i < step && setStep(i)}
                className={`flex items-center gap-2 font-body text-xs tracking-[0.1em] transition-colors ${i <= step ? 'text-[#0a0a0a]' : 'text-[#6b7280]'}`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${i < step ? 'bg-[#c9a96e] text-white' : i === step ? 'bg-[#0a0a0a] text-white' : 'bg-[#e5e0d8] text-[#6b7280]'}`}>
                  {i < step ? <CheckCircle size={12} /> : i + 1}
                </span>
                {label}
              </button>
              {i < STEPS.length - 1 && <div className="w-12 h-px bg-[#e5e0d8] mx-3" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* ── Left panel ── */}
          <div className="lg:col-span-3">
            {error && (
              <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-600 font-body text-sm rounded">{error}</div>
            )}

            {/* Step 0 — Bag summary */}
            {step === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <h2 className="font-display text-xl font-medium mb-6">Your Bag</h2>
                {items.map((item) => (
                  <div key={item.cart_item_id} className="flex gap-4 p-4 bg-white border border-[#e5e0d8]">
                    {item.image
                      ? <img src={item.image} alt={item.name} className="w-16 h-20 object-cover flex-shrink-0" />
                      : <div className="w-16 h-20 bg-[#f7f4ef] flex-shrink-0" />}
                    <div className="flex-1">
                      <h4 className="font-display text-sm font-medium">{item.name}</h4>
                      <p className="font-body text-xs text-[#6b7280] mt-0.5">{item.size} · {item.color}</p>
                      <div className="flex justify-between mt-2">
                        <span className="font-body text-xs text-[#6b7280]">Qty: {item.quantity}</span>
                        {/* Price shown in local currency */}
                        <span className="font-body text-sm font-medium">{format(item.unitPrice * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={() => setStep(1)} className="w-full mt-4 py-4 bg-[#0a0a0a] text-white font-body text-xs tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-[#1a1a1a] transition-colors">
                  CONTINUE TO SHIPPING <ArrowRight size={14} />
                </button>
              </motion.div>
            )}

            {/* Step 1 — Shipping */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="font-display text-xl font-medium mb-6">Shipping Address</h2>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { key: 'name',        label: 'Full Name',     type: 'text', placeholder: 'Your name' },
                    { key: 'address',     label: 'Street Address',type: 'text', placeholder: '123 Rue de la Paix' },
                    { key: 'city',        label: 'City',          type: 'text', placeholder: 'Paris' },
                    { key: 'postal_code', label: 'Postal Code',   type: 'text', placeholder: '75001' },
                    { key: 'country',     label: 'Country',       type: 'text', placeholder: 'France' },
                  ].map(({ key, label, type, placeholder }) => (
                    <div key={key}>
                      <label className="block font-body text-xs tracking-[0.15em] text-[#6b7280] mb-2 uppercase">{label}</label>
                      <input
                        type={type}
                        placeholder={placeholder}
                        value={(address as any)[key]}
                        onChange={(e) => setAddress((p) => ({ ...p, [key]: e.target.value }))}
                        className="w-full px-4 py-3.5 border border-[#e5e0d8] focus:border-[#c9a96e] outline-none font-body text-sm bg-white"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(0)} className="px-6 py-4 border border-[#e5e0d8] font-body text-xs tracking-[0.15em] hover:border-[#0a0a0a] transition-colors">
                    BACK
                  </button>
                  <button onClick={() => setStep(2)} className="flex-1 py-4 bg-[#0a0a0a] text-white font-body text-xs tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-[#1a1a1a] transition-colors">
                    CONTINUE TO PAYMENT <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2 — Payment */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="font-display text-xl font-medium mb-6">Payment</h2>

                {/* Currency info card */}
                <div className="p-4 border border-[#c9a96e]/40 bg-[#f7f4ef] mb-4 flex items-start gap-3">
                  <span style={{ fontSize: 20 }}>{region.flag}</span>
                  <div>
                    <p className="font-body text-xs font-medium text-[#0a0a0a] mb-0.5">
                      You will be charged in <strong>{region.currency}</strong>
                    </p>
                    <p className="font-body text-xs text-[#6b7280]">
                      Total: <strong className="text-[#0a0a0a]">{format(usdTotal)}</strong>
                      {region.currency !== 'USD' && (
                        <span className="ml-1 text-[#9a7a42]">(≈ ${usdTotal.toFixed(0)} USD base price)</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="p-6 bg-white border border-[#e5e0d8] mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Lock size={16} className="text-[#c9a96e]" />
                    <p className="font-body text-sm font-medium">Secure payment via Stripe</p>
                  </div>
                  <p className="font-body text-xs text-[#6b7280]">
                    You will be redirected to Stripe's secure checkout. Your card details are never stored on our servers.
                  </p>
                </div>

                <div className="p-4 bg-[#f7f4ef] border border-[#e5e0d8] mb-6 space-y-1 text-sm font-body">
                  <p className="font-medium">{address.name}</p>
                  <p className="text-[#6b7280]">{address.address}</p>
                  <p className="text-[#6b7280]">{address.city}{address.postal_code ? `, ${address.postal_code}` : ''}</p>
                  <p className="text-[#6b7280]">{address.country}</p>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="px-6 py-4 border border-[#e5e0d8] font-body text-xs tracking-[0.15em] hover:border-[#0a0a0a] transition-colors">
                    BACK
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={submitting}
                    className="flex-1 py-4 bg-[#c9a96e] hover:bg-[#b8945a] disabled:opacity-60 text-white font-body text-xs tracking-[0.2em] flex items-center justify-center gap-2 transition-colors"
                  >
                    {submitting
                      ? <><Loader size={14} className="animate-spin" /> PROCESSING…</>
                      : <><Lock size={14} /> PAY {format(usdTotal)} — {region.currency}</>}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* ── Order summary sidebar ── */}
          <div className="lg:col-span-2">
            <div className="sticky top-28 bg-white border border-[#e5e0d8] p-6">
              <h3 className="font-display text-lg font-medium mb-5">Order Summary</h3>

              {/* Currency badge */}
              <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-[#f7f4ef] border border-[#e5e0d8]">
                <span style={{ fontSize: 13 }}>{region.flag}</span>
                <span className="font-body text-[10px] tracking-[0.15em] text-[#6b7280]">
                  ALL PRICES IN {region.currency}
                </span>
              </div>

              <div className="space-y-3 mb-5">
                {items.map((i) => (
                  <div key={i.cart_item_id} className="flex justify-between font-body text-sm">
                    <span className="text-[#6b7280] line-clamp-1">{i.name} × {i.quantity}</span>
                    <span className="ml-4 whitespace-nowrap">{format(i.unitPrice * i.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#e5e0d8] pt-4 space-y-2">
                <div className="flex justify-between font-body text-sm">
                  <span className="text-[#6b7280]">Subtotal</span>
                  <span>{format(usdSubtotal)}</span>
                </div>
                <div className="flex justify-between font-body text-sm">
                  <span className="text-[#6b7280]">Shipping</span>
                  <span className={usdShipping === 0 ? 'text-[#c9a96e]' : ''}>{usdShipping === 0 ? 'Free' : format(usdShipping)}</span>
                </div>
                {usdShipping > 0 && (
                  <p className="font-body text-xs text-[#6b7280]">Free shipping on orders over {format(250)}</p>
                )}
              </div>

              <div className="border-t border-[#e5e0d8] mt-4 pt-4 flex justify-between font-body font-semibold">
                <span>Total</span>
                <div className="text-right">
                  <span className="block">{format(usdTotal)}</span>
                  {region.currency !== 'USD' && (
                    <span className="font-body text-[10px] font-normal text-[#9a7a42]">≈ ${usdTotal.toFixed(0)} USD</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
