import React from 'react';

export const SkeletonLoader: React.FC<{ className?: string }> = ({ className = 'h-6 w-full' }) => {
  return (
    <div
      className={`skeleton-shimmer ${className}`}
      style={{
        backgroundColor: 'var(--surface-sunken)',
      }}
    />
  );
};

export const CompoundCardSkeleton: React.FC = () => {
  return (
    <div className="space-y-10 py-4">
      <div className="space-y-3 border-b-2 border-[var(--ink)] pb-8">
        <SkeletonLoader className="h-4 w-48" />
        <SkeletonLoader className="h-14 w-80" />
        <SkeletonLoader className="h-4 w-96" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5">
          <SkeletonLoader className="h-72 w-full" />
        </div>
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="pt-3 border-t border-[var(--divider)] space-y-2">
              <SkeletonLoader className="h-3 w-28" />
              <SkeletonLoader className="h-9 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
