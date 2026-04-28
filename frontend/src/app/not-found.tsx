import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-center px-6"
      style={{ background: 'var(--color-ivory)' }}
    >
      <p className="font-body text-xs tracking-[0.3em] text-[#c9a96e] mb-4">404</p>
      <h1 className="font-display text-5xl font-light mb-4">Page not found</h1>
      <p className="font-body text-sm text-[#6b7280] max-w-sm mb-10">
        The page you are looking for may have moved, or perhaps it never existed at all.
      </p>
      <div className="flex gap-4">
        <Link
          href="/"
          className="px-10 py-3.5 bg-[#0a0a0a] text-white font-body text-xs tracking-[0.2em] hover:bg-[#1a1a1a] transition-colors"
        >
          RETURN HOME
        </Link>
        <Link
          href="/shop"
          className="px-10 py-3.5 border border-[#e5e0d8] font-body text-xs tracking-[0.2em] hover:border-[#0a0a0a] transition-colors"
        >
          SHOP ALL
        </Link>
      </div>
    </div>
  );
}
