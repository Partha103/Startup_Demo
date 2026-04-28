'use client';

/** Reusable skeleton shimmer components in the TANTA design language. */

export function ProductSkeleton() {
  return (
    <div className="space-y-3">
      <div className="bg-[#f0ede8] animate-pulse" style={{ paddingBottom: '133%', position: 'relative' }} />
      <div className="h-2.5 bg-[#f0ede8] animate-pulse rounded w-1/3" />
      <div className="h-3.5 bg-[#f0ede8] animate-pulse rounded w-3/4" />
      <div className="h-3.5 bg-[#f0ede8] animate-pulse rounded w-1/2" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}

export function CartItemSkeleton() {
  return (
    <div className="flex gap-4">
      <div className="w-20 h-24 bg-[#f0ede8] animate-pulse flex-shrink-0" />
      <div className="flex-1 space-y-2.5 py-1">
        <div className="h-3.5 bg-[#f0ede8] animate-pulse rounded w-3/4" />
        <div className="h-3 bg-[#f0ede8] animate-pulse rounded w-1/2" />
        <div className="h-3 bg-[#f0ede8] animate-pulse rounded w-1/3 mt-2" />
      </div>
    </div>
  );
}

export function CartSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-5">
      {Array.from({ length: count }).map((_, i) => (
        <CartItemSkeleton key={i} />
      ))}
    </div>
  );
}

export function CollectionCardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="bg-[#f0ede8] animate-pulse" style={{ paddingBottom: '110%' }} />
      <div className="h-4 bg-[#f0ede8] animate-pulse rounded w-2/3" />
      <div className="h-3 bg-[#f0ede8] animate-pulse rounded w-full" />
      <div className="h-3 bg-[#f0ede8] animate-pulse rounded w-1/3" />
    </div>
  );
}

export function TextLineSkeleton({ width = 'full' }: { width?: string }) {
  return <div className={`h-3.5 bg-[#f0ede8] animate-pulse rounded w-${width}`} />;
}

export function PageHeaderSkeleton() {
  return (
    <div className="py-12 border-b border-[#e5e0d8] px-container">
      <div className="h-3 bg-[#f0ede8] animate-pulse rounded w-24 mb-4" />
      <div className="h-10 bg-[#f0ede8] animate-pulse rounded w-64" />
    </div>
  );
}
