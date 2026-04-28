export default function TermsPage() {
  const sections = [
    { title: 'Acceptance of terms', body: 'By using the TANTA website and placing an order, you agree to these Terms of Service. Please read them carefully.' },
    { title: 'Products and pricing', body: 'All prices are shown in your selected currency and include applicable taxes. We reserve the right to correct pricing errors and cancel orders placed at an incorrect price.' },
    { title: 'Orders and payment', body: 'Orders are accepted subject to availability. Payment is processed via Stripe. You authorise us to charge the selected payment method for the full order amount.' },
    { title: 'Shipping and delivery', body: 'Delivery times are estimates and not guaranteed. Title and risk of loss passes to you on delivery. We are not responsible for delays caused by customs or other circumstances beyond our control.' },
    { title: 'Returns and refunds', body: 'Our full returns policy is available at /returns. Refunds are processed to the original payment method within 3–10 business days of receiving the return.' },
    { title: 'Intellectual property', body: 'All content on this site — including images, text, and design — is the property of TANTA and may not be reproduced without express written consent.' },
    { title: 'Limitation of liability', body: 'To the fullest extent permitted by law, TANTA\'s liability for any claim arising from these terms is limited to the amount paid for the relevant order.' },
    { title: 'Governing law', body: 'These terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.' },
  ];
  return (
    <div style={{ background: 'var(--color-ivory)' }}>
      <div className="px-container py-16 border-b border-[#e5e0d8]" style={{ background: '#0a0a0a' }}>
        <p className="font-body text-xs tracking-[0.25em] text-[#c9a96e] mb-3">LEGAL</p>
        <h1 className="font-display text-4xl font-light text-white">Terms of Service</h1>
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
