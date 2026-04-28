'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ReturnsPage() {
  return (
    <div style={{ background: 'var(--color-ivory)' }}>
      <div className="px-container py-16 border-b border-[#e5e0d8]" style={{ background: '#0a0a0a' }}>
        <p className="font-body text-xs tracking-[0.25em] text-[#c9a96e] mb-3">CARE</p>
        <h1 className="font-display text-4xl font-light text-white">Returns & Exchanges</h1>
      </div>
      <div className="px-container py-14 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
          {[
            { label: 'Return window',  value: '30 days', detail: 'from delivery date' },
            { label: 'Refund method',  value: 'Original',detail: 'payment method' },
            { label: 'Exchange',       value: 'Free',    detail: 'one exchange per order' },
          ].map(({ label, value, detail }) => (
            <div key={label} className="bg-white border border-[#e5e0d8] p-6 text-center">
              <p className="font-body text-xs tracking-[0.15em] text-[#6b7280] mb-2">{label.toUpperCase()}</p>
              <p className="font-display text-3xl font-light text-[#c9a96e] mb-1">{value}</p>
              <p className="font-body text-xs text-[#6b7280]">{detail}</p>
            </div>
          ))}
        </div>
        {[
          { title: 'How to start a return', body: 'Email returns@tanta.fashion with your order number and reason. We will send a prepaid label within 24 hours.' },
          { title: 'Condition requirements', body: 'Items must be unworn, unwashed, and in original packaging with all tags attached. Final-sale items and made-to-measure pieces cannot be returned.' },
          { title: 'Refund timeline', body: 'Once we receive your return, we process refunds within 3 business days. Allow 5–10 business days for funds to appear in your account.' },
          { title: 'International returns', body: 'We provide prepaid return labels for all supported regions. Customs duties on international returns are not refunded.' },
        ].map(({ title, body }) => (
          <div key={title} className="flex gap-5 p-5 bg-white border border-[#e5e0d8] mb-4">
            <div className="w-1 flex-shrink-0 bg-[#c9a96e]" />
            <div><p className="font-body text-sm font-medium mb-1">{title}</p><p className="font-body text-sm text-[#6b7280]">{body}</p></div>
          </div>
        ))}
        <p className="font-body text-sm text-[#6b7280] mt-8">Need help? <a href="mailto:returns@tanta.fashion" className="text-[#c9a96e] hover:underline">returns@tanta.fashion</a></p>
      </div>
    </div>
  );
}
