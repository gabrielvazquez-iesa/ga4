import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api-fetch';
import { ExternalLink, Eye, Clock, FileText, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function ContentListModule({ days, filterPath }: { days: number; filterPath: string }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchList = async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`/api/ga4-content-list?days=${days}&pathFilter=${filterPath}`);
        const json = await res.json();
        if (json.data) setData(json.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (filterPath) fetchList();
  }, [days, filterPath]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}m ${s}s`;
  };

  const domain = 'https://www.iesa.edu.ve';

  return (
    <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl backdrop-blur-sm overflow-hidden flex flex-col h-full mt-6">
      <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
            <FileText className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
              Desempeño de Contenido
            </h3>
            <p className="text-sm text-slate-500">Métricas detalladas para artículos y cursos individuales.</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
          <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-950/50 text-slate-500 border-b border-slate-200 dark:border-white/10">
            <tr>
              <th className="px-6 py-4 font-bold">Título / Enlace</th>
              <th className="px-6 py-4 font-bold text-center">Vistas</th>
              <th className="px-6 py-4 font-bold text-center">Tiempo Promedio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4">
                    <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded w-1/2"></div>
                  </td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16 mx-auto"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16 mx-auto"></div></td>
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                  No se encontró contenido publicado en este período.
                </td>
              </tr>
            ) : (
              data.map((item, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 max-w-sm">
                    <div className="font-bold text-slate-900 dark:text-white mb-1 line-clamp-2" title={item.title}>
                      {item.title || 'Sin Título'}
                    </div>
                    <a
                      href={`${domain}${item.path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
                      title="Abrir página en IESA"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      {item.path}
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <div className="flex items-center gap-2 font-bold bg-slate-100 dark:bg-slate-800/50 rounded-lg py-1.5 px-3 w-fit">
                        <Eye className="w-4 h-4 text-slate-500" />
                        <span className="text-slate-900 dark:text-white">{item.views.toLocaleString()}</span>
                      </div>
                      <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.trend > 0 ? 'text-emerald-600 bg-emerald-500/10' : 
                        item.trend < 0 ? 'text-rose-600 bg-rose-500/10' : 
                        'text-slate-500 bg-slate-500/10'
                      }`}>
                        {item.trend > 0 ? <TrendingUp className="w-3 h-3" /> : item.trend < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                        {item.trend > 0 && '+'}{item.trend === 0 ? 'Igual' : `${item.trend.toFixed(1)}%`}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2 font-medium bg-slate-100 dark:bg-slate-800/50 rounded-lg py-1.5 px-3 w-fit mx-auto text-slate-700 dark:text-slate-300">
                      <Clock className="w-4 h-4 text-amber-500" />
                      {formatTime(item.avgDuration)}
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
