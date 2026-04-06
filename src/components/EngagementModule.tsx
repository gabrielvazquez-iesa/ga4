import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api-fetch';
import { Target, Clock, MousePointerClick } from 'lucide-react';

export default function EngagementModule({ days, filterPath }: { days: number; filterPath?: string }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEngagement = async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`/api/ga4-engagement?days=${days}${filterPath ? `&pathFilter=${filterPath}` : ''}`);
        const json = await res.json();
        if (json.data) setData(json.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEngagement();
  }, [days]);

  return (
    <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-sm overflow-hidden flex flex-col h-full">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
          <Target className="w-4 h-4 text-orange-400" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white leading-tight">Engagement de Contenido</h3>
          <p className="text-xs text-slate-500">Páginas de mayor impacto y conversiones</p>
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-white/5 border-y border-slate-200 dark:border-white/10">
            <tr>
              <th className="px-4 py-3 font-semibold">URL Path</th>
              <th className="px-4 py-3 font-semibold">T. Promedio</th>
              <th className="px-4 py-3 font-semibold">Interacciones</th>
              <th className="px-4 py-3 font-semibold">Score Efectividad</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse border-b border-slate-100 dark:border-white/5">
                  <td className="px-4 py-3"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div></td>
                  <td className="px-4 py-3"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div></td>
                  <td className="px-4 py-3"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div></td>
                  <td className="px-4 py-3"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div></td>
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">No hay datos disponibles.</td></tr>
            ) : (
              data.map((row, i) => (
                <tr key={i} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300 max-w-[200px] truncate" title={row.path}>
                    {row.path}
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> {Math.floor(row.avgDuration)}s</div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1"><MousePointerClick className="w-3 h-3" /> {row.events}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${row.score > 70 ? 'bg-emerald-500' : row.score > 40 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                          style={{ width: `${row.score}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold w-6">{row.score}</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
