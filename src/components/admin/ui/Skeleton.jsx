/** Portfolio Admin CMS — Copyright (C) 2026 Pratik Singh (AGPL-3.0). */
"use client";

export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-md bg-white/[0.06] ${className}`} />;
}

// Placeholder grid shown while a section's data loads.
export function CardGridSkeleton({ count = 6 }) {
  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/10 bg-white/[0.02] p-3"
          >
            <Skeleton className="mb-3 h-32 w-full" />
            <Skeleton className="mb-2 h-4 w-2/3" />
            <Skeleton className="h-3 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
