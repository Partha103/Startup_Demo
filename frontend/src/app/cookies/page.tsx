export default function CookiesPage() {
  const types = [
    { name: 'Essential', required: true, desc: 'Required for the site to function — session authentication, cart state, and region preference.' },
    { name: 'Functional', required: false, desc: 'Remember your preferences across visits, such as recently viewed items.' },
    { name: 'Analytics', required: false, desc: 'Help us understand how visitors use the site so we can improve it. Data is anonymised.' },
  ];
  return (
    <div style={{ background: 'var(--color-ivory)' }}>
      <div className="px-container py-16 border-b border-[#e5e0d8]" style={{ background: '#0a0a0a' }}>
        <p className="font-body text-xs tracking-[0.25em] text-[#c9a96e] mb-3">LEGAL</p>
        <h1 className="font-display text-4xl font-light text-white">Cookie Policy</h1>
      </div>
      <div className="px-container py-14 max-w-3xl mx-auto">
        <p className="font-body text-sm text-[#6b7280] leading-relaxed mb-10">
          We use cookies to provide a smooth, personalised experience. This page explains what we use and why.
        </p>
        <div className="space-y-4 mb-10">
          {types.map(({ name, required, desc }) => (
            <div key={name} className="p-5 bg-white border border-[#e5e0d8]">
              <div className="flex items-center gap-3 mb-2">
                <p className="font-body text-sm font-medium">{name}</p>
                <span className={`px-2 py-0.5 font-body text-[10px] rounded-full ${required ? 'bg-[#0a0a0a] text-white' : 'bg-[#f7f4ef] text-[#6b7280] border border-[#e5e0d8]'}`}>
                  {required ? 'Always on' : 'Optional'}
                </span>
              </div>
              <p className="font-body text-sm text-[#6b7280]">{desc}</p>
            </div>
          ))}
        </div>
        <p className="font-body text-sm text-[#6b7280]">To manage your preferences, email <a href="mailto:privacy@tanta.fashion" className="text-[#c9a96e] hover:underline">privacy@tanta.fashion</a>.</p>
      </div>
    </div>
  );
}
