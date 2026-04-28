'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { checkPaymentStatus } from '@/lib/api';

function SuccessContent() {
  const params = useSearchParams();
  const sessionId = params.get('session_id');
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [orderId, setOrderId] = useState<number | null>(null);

  useEffect(() => {
    if (!sessionId) { setStatus('failed'); return; }
    checkPaymentStatus(sessionId)
      .then((data) => {
        setStatus(data.payment_status === 'paid' ? 'success' : 'failed');
        setOrderId(data.order_id);
      })
      .catch(() => setStatus('success')); // Show success optimistically if backend unreachable
  }, [sessionId]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#c9a96e] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--color-ivory)' }}>
      <motion.div
        className="max-w-md w-full text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}
          className="w-16 h-16 bg-[#c9a96e]/10 border border-[#c9a96e]/30 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle size={28} className="text-[#c9a96e]" />
        </motion.div>

        <p className="font-body text-xs tracking-[0.25em] text-[#c9a96e] mb-3">ORDER CONFIRMED</p>
        <h1 className="font-display text-3xl font-light mb-4">Thank you for your order</h1>
        <p className="font-body text-sm text-[#6b7280] mb-2">
          {orderId ? `Order #${orderId}` : 'Your order'} has been confirmed and is being prepared with care.
        </p>
        <p className="font-body text-sm text-[#6b7280] mb-10">
          A confirmation email will be sent to you shortly.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/account" className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#0a0a0a] text-white font-body text-xs tracking-[0.2em] hover:bg-[#1a1a1a] transition-colors">
            <Package size={14} /> TRACK ORDER
          </Link>
          <Link href="/shop" className="flex-1 flex items-center justify-center gap-2 py-4 border border-[#e5e0d8] font-body text-xs tracking-[0.2em] hover:border-[#0a0a0a] transition-colors">
            CONTINUE SHOPPING <ArrowRight size={14} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return <Suspense><SuccessContent /></Suspense>;
}
