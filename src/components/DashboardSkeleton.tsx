import React from 'react';

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-white/5"></div>
      
      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-white/5"></div>
        ))}
      </div>
      
      {/* Chart Skeleton */}
      <div className="h-[450px] bg-slate-200 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-white/5"></div>
    </div>
  );
}
