'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

const METHODS = [
  { name: 'Standard Delivery',     time: '3–5 business days',  price: '$15.00',  note: 'Free on orders over $250' },
  { name: 'Express Delivery',      time: '1–2 business days',  price: '$25.00',  note: null },
  { name: 'Next Day Delivery',     time: 'Order by 12pm local',price: '$40.00',  note: null },
  { name: 'International Delivery',time: '5–10 business days', price: 'From $30',note: 'Free on orders over $500. Duties may apply.' },
];
const FAQS = [
  { q: 'Will I receive a tracking number?', a: 'Yes — a tracking link is emailed within 24 hours of dispatch.' },
  { q: 'Can I change my delivery address?', a: 'Address changes can be made within 2 hours of ordering. Email orders@tanta.fashion immediately.' },
  { q: 'What if no one is home?', a: 'Our couriers will attempt delivery three times, then leave the parcel at a local collection point.' },
  { q: 'Do you ship to my country?', a: 'We ship to 60+ countries. Select your region at checkout to view available options and costs.' },
];
export default function ShippingPage() {
  return (
    <div style={{ background: 'var(--color-ivory)' }}>
      <div className="px-container py-16 border-b border-[#e5e0d8]" style={{ background: '#0a0a0a' }}>
        <p className="font-body text-xs tracking-[0.25em] text-[#c9a96e] mb-3">DELIVERY</p>
        <h1 className="font-display text-4xl font-light text-white">Shipping Information</h1>
      </div>
      <div className="px-container py-14 max-w-4xl mx-auto">
        <h2 className="font-display text-2xl font-light mb-6">Delivery options</h2>
        <div className="space-y-px mb-12">
          {METHODS.map(({ name, time, price, note }) => (
            <div key={name} className="bg-white p-5 grid grid-cols-1 md:grid-cols-3 gap-2">
              <div><p className="font-body text-sm font-medium">{name}</p><p className="font-body text-xs text-[#6b7280]">{time}</p></div>
              <div><p className="font-body text-sm font-medium text-[#c9a96e]">{price}</p>{note && <p className="font-body text-xs text-green-600">{note}</p>}</div>
              <p className="font-body text-xs text-[#6b7280]">Fully tracked · Carbon-neutral shipping</p>
            </div>
          ))}
        </div>
        <h2 className="font-display text-2xl font-light mb-6">Questions</h2>
        <div className="space-y-4 mb-10">
          {FAQS.map(({ q, a }) => (
            <div key={q} className="p-5 bg-white border border-[#e5e0d8]">
              <p className="font-body text-sm font-medium mb-1">{q}</p>
              <p className="font-body text-sm text-[#6b7280]">{a}</p>
            </div>
          ))}
        </div>
        <p className="font-body text-sm text-[#6b7280]">Still have questions? <a href="mailto:orders@tanta.fashion" className="text-[#c9a96e] hover:underline">Contact us</a></p>
      </div>
    </div>
  );
}
