'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const GARMENT_TYPES = ['Tops & Dresses', 'Trousers & Skirts', 'Outerwear', 'Footwear'] as const;
type GarmentType = typeof GARMENT_TYPES[number];

const SIZE_TABLES: Record<GarmentType, { headers: string[]; rows: string[][] }> = {
  'Tops & Dresses': {
    headers: ['Size', 'UK', 'EU', 'US', 'Bust (cm)', 'Waist (cm)', 'Hips (cm)'],
    rows: [
      ['XS', '6',  '34', '2',  '80–83',   '62–65',   '88–91'],
      ['S',  '8',  '36', '4',  '84–87',   '66–69',   '92–95'],
      ['M',  '10', '38', '6',  '88–91',   '70–73',   '96–99'],
      ['L',  '12', '40', '8',  '92–95',   '74–77',   '100–103'],
      ['XL', '14', '42', '10', '96–100',  '78–82',   '104–108'],
      ['XXL','16', '44', '12', '101–106', '83–88',   '109–114'],
    ],
  },
  'Trousers & Skirts': {
    headers: ['Size', 'UK', 'EU', 'US', 'Waist (cm)', 'Hips (cm)', 'Inseam (cm)'],
    rows: [
      ['XS', '6',  '34', '26', '62–65',   '88–91',  '76'],
      ['S',  '8',  '36', '28', '66–69',   '92–95',  '77'],
      ['M',  '10', '38', '30', '70–73',   '96–99',  '78'],
      ['L',  '12', '40', '32', '74–77',   '100–103','79'],
      ['XL', '14', '42', '34', '78–82',   '104–108','80'],
      ['XXL','16', '44', '36', '83–88',   '109–114','81'],
    ],
  },
  'Outerwear': {
    headers: ['Size', 'UK', 'EU', 'US', 'Chest (cm)', 'Shoulder (cm)', 'Sleeve (cm)'],
    rows: [
      ['XS', '6–8',   '34–36', '2–4',   '84–87',   '36–37',  '58–59'],
      ['S',  '8–10',  '36–38', '4–6',   '88–91',   '38–39',  '60–61'],
      ['M',  '10–12', '38–40', '6–8',   '92–95',   '40–41',  '62–63'],
      ['L',  '12–14', '40–42', '8–10',  '96–100',  '42–43',  '63–64'],
      ['XL', '14–16', '42–44', '10–12', '101–106', '44–45',  '64–65'],
    ],
  },
  'Footwear': {
    headers: ['EU', 'UK', 'US (Women)', 'US (Men)', 'Foot length (cm)'],
    rows: [
      ['35', '2.5', '5',   '3.5', '22.0'],
      ['36', '3',   '5.5', '4',   '22.5'],
      ['37', '4',   '6.5', '5',   '23.5'],
      ['38', '5',   '7.5', '6',   '24.0'],
      ['39', '5.5', '8',   '6.5', '24.5'],
      ['40', '6.5', '9',   '7.5', '25.5'],
      ['41', '7',   '9.5', '8',   '26.0'],
      ['42', '8',   '10.5','9',   '26.5'],
    ],
  },
};

const HOW_TO_MEASURE = [
  { label: 'Bust',     tip: 'Measure around the fullest part of your chest, keeping the tape parallel to the floor.' },
  { label: 'Waist',    tip: 'Measure around your natural waist — the narrowest part of your torso, usually above the navel.' },
  { label: 'Hips',     tip: 'Stand with feet together and measure around the fullest part of your hips and seat.' },
  { label: 'Inseam',   tip: 'Measure from the crotch seam to the bottom of the ankle along the inner leg.' },
  { label: 'Foot',     tip: 'Stand on paper, trace your foot, and measure from heel to longest toe.' },
];

export default function SizeGuidePage() {
  const [activeType, setActiveType] = useState<GarmentType>('Tops & Dresses');
  const table = SIZE_TABLES[activeType];

  return (
    <div style={{ background: 'var(--color-ivory)' }}>
      {/* Header */}
      <div className="px-container py-14 border-b border-[#e5e0d8]" style={{ background: '#0a0a0a' }}>
        <motion.p className="font-body text-xs tracking-[0.25em] text-[#c9a96e] mb-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          FITTING GUIDE
        </motion.p>
        <motion.h1 className="font-display text-4xl font-light text-white" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          Size Guide
        </motion.h1>
        <motion.p className="font-body text-sm text-white/40 mt-3 max-w-lg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          All TANTA garments are designed with a considered, intentional fit. Use this guide to find your perfect size.
        </motion.p>
      </div>

      <div className="px-container py-12 max-w-5xl mx-auto">

        {/* Tab selector */}
        <div className="flex flex-wrap gap-2 mb-10">
          {GARMENT_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`px-5 py-2.5 font-body text-xs tracking-[0.1em] border transition-all ${
                activeType === type
                  ? 'bg-[#0a0a0a] text-white border-[#0a0a0a]'
                  : 'border-[#e5e0d8] hover:border-[#0a0a0a]'
              }`}
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Size table */}
        <motion.div key={activeType} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div className="overflow-x-auto mb-12">
            <table className="w-full bg-white border border-[#e5e0d8]">
              <thead>
                <tr className="bg-[#0a0a0a]">
                  {table.headers.map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-body text-[10px] tracking-[0.15em] text-white/60">{h.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, i) => (
                  <tr key={i} className={`border-t border-[#f0ede8] ${i % 2 === 0 ? '' : 'bg-[#fafaf8]'} hover:bg-[#f7f4ef] transition-colors`}>
                    {row.map((cell, j) => (
                      <td key={j} className={`px-4 py-3 font-body text-sm ${j === 0 ? 'font-medium text-[#c9a96e]' : 'text-[#0a0a0a]'}`}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* How to measure */}
        <div className="border-t border-[#e5e0d8] pt-10">
          <h2 className="font-display text-2xl font-light mb-8">How to measure</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {HOW_TO_MEASURE.map(({ label, tip }) => (
              <div key={label} className="flex gap-4 p-5 bg-white border border-[#e5e0d8]">
                <div className="w-1 flex-shrink-0 bg-[#c9a96e]" />
                <div>
                  <p className="font-body text-xs tracking-[0.15em] font-medium mb-1">{label.toUpperCase()}</p>
                  <p className="font-body text-sm text-[#6b7280] leading-relaxed">{tip}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fit note */}
        <div className="mt-10 p-6 bg-[#f7f4ef] border border-[#e5e0d8]">
          <p className="font-body text-xs tracking-[0.15em] text-[#c9a96e] mb-2">TANTA FIT NOTE</p>
          <p className="font-body text-sm text-[#6b7280] leading-relaxed">
            If you are between sizes, we recommend sizing up for outerwear and sizing down for close-fitting pieces. Our size charts reflect the garment's intended fit — for tailored pieces this is slim, for knitwear it is relaxed. Product pages specify the model's measurements and the size worn.
          </p>
        </div>
      </div>
    </div>
  );
}
