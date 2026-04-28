export default function PressPage() {
  return (
    <div style={{ background: 'var(--color-ivory)' }}>
      <div className="px-container py-16 border-b border-[#e5e0d8]" style={{ background: '#0a0a0a' }}>
        <p className="font-body text-xs tracking-[0.25em] text-[#c9a96e] mb-3">MEDIA</p>
        <h1 className="font-display text-4xl font-light text-white">Press & Media</h1>
      </div>
      <div className="px-container py-14 max-w-3xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {[
            { label: 'Press enquiries', email: 'press@tanta.fashion', detail: 'For editorial coverage, interview requests, and product loans.' },
            { label: 'Brand assets',    email: 'press@tanta.fashion', detail: 'High-resolution images, brand guidelines, and product photography available on request.' },
          ].map(({ label, email, detail }) => (
            <div key={label} className="p-6 bg-white border border-[#e5e0d8]">
              <p className="font-body text-xs tracking-[0.15em] text-[#c9a96e] mb-2">{label.toUpperCase()}</p>
              <a href={`mailto:${email}`} className="font-body text-sm font-medium hover:text-[#c9a96e] transition-colors block mb-1">{email}</a>
              <p className="font-body text-sm text-[#6b7280]">{detail}</p>
            </div>
          ))}
        </div>
        <div className="p-6 bg-[#f7f4ef] border border-[#e5e0d8]">
          <p className="font-body text-xs tracking-[0.15em] text-[#c9a96e] mb-2">PRESS RESPONSE TIME</p>
          <p className="font-body text-sm text-[#6b7280]">We aim to respond to all media enquiries within 48 business hours. For urgent editorial deadlines, please indicate your deadline in the subject line.</p>
        </div>
      </div>
    </div>
  );
}
