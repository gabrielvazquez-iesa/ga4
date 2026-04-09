import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface PremiumKPIProps {
  label: string;
  value: string | number;
  trend?: number;
  icon: any; // Using any to avoid LucideIcon export issue in some environments
  color: string;
  loading?: boolean;
}

export const PremiumKPI: React.FC<PremiumKPIProps> = ({ label, value, trend, icon: Icon, color, loading }) => {
  return (
    <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 p-6 rounded-2xl backdrop-blur-sm shadow-sm relative overflow-hidden group transition-all duration-300 hover:shadow-md">
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity ${color.replace('text-', 'bg-')}/10`} />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color.replace('text-', 'bg-')}/20 shadow-inner`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-bold ${trend >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
              {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        
        <div>
          <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tighter">
            {loading ? <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" /> : value}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 uppercase tracking-wider">{label}</p>
        </div>
      </div>
    </div>
  );
};
