export default function PrivacyPage() {
  const sections = [
    { title: 'Information we collect', body: 'We collect information you provide when creating an account, placing an order, or contacting us — including your name, email address, postal address, and payment details. We also collect usage data such as pages visited and items viewed, to improve your experience.' },
    { title: 'How we use your data', body: 'Your data is used to process orders, send shipping updates, and improve our services. We never sell your data to third parties. We may share necessary information with our fulfilment partners and payment processors (Stripe) solely to complete your order.' },
    { title: 'Cookies', body: 'We use essential cookies to keep you signed in and to remember your region preference. Analytics cookies (if enabled) help us understand how visitors use our site. You can manage cookie preferences at any time.' },
    { title: 'Your rights', body: 'Under GDPR and applicable laws, you have the right to access, correct, or delete your personal data. To exercise these rights, email privacy@tanta.fashion. We will respond within 30 days.' },
    { title: 'Data retention', body: 'We retain order data for 7 years for legal and accounting purposes. Account data is retained until you request deletion. Analytics data is anonymised after 26 months.' },
    { title: 'Contact', body: 'For any privacy questions, contact our Data Protection Officer at privacy@tanta.fashion.' },
  ];
  return (
    <div style={{ background: 'var(--color-ivory)' }}>
      <div className="px-container py-16 border-b border-[#e5e0d8]" style={{ background: '#0a0a0a' }}>
        <p className="font-body text-xs tracking-[0.25em] text-[#c9a96e] mb-3">LEGAL</p>
        <h1 className="font-display text-4xl font-light text-white">Privacy Policy</h1>
        <p className="font-body text-sm text-white/40 mt-3">Last updated: January 2026</p>
      </div>
      <div className="px-container py-14 max-w-3xl mx-auto">
        {sections.map(({ title, body }) => (
          <div key={title} className="mb-8">
            <h2 className="font-display text-xl font-light mb-3">{title}</h2>
            <p className="font-body text-sm text-[#6b7280] leading-relaxed">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
