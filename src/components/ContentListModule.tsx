import { useState, useEffect, useMemo, useRef } from 'react';
import { apiFetch } from '../lib/api-fetch';
import { ExternalLink, Eye, Clock, FileText, TrendingUp, TrendingDown, Minus, Search, SlidersHorizontal } from 'lucide-react';

export default function ContentListModule({ days, filterPath }: { days: number; filterPath: string }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Nuevos estados
  const [searchQuery, setSearchQuery] = useState('');
  const [limit, setLimit] = useState<number>(30);
  const [sortBy, setSortBy] = useState<string>('views-desc');

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

  const processedData = useMemo(() => {
    let result = data;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => 
        (item.title && item.title.toLowerCase().includes(q)) || 
        (item.path && item.path.toLowerCase().includes(q))
      );
    }

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'views-desc': return b.views - a.views;
        case 'views-asc': return a.views - b.views;
        case 'time-desc': return b.avgDuration - a.avgDuration;
        case 'time-asc': return a.avgDuration - b.avgDuration;
        case 'date-desc':
        case 'date-asc':
          const getDateVal = (p: string) => {
            if (!p) return 0;
            const match = p.match(/\/(\d{4})\/(\d{2})\//);
            return match ? parseInt(match[1]) * 100 + parseInt(match[2]) : 0;
          };
          const valA = getDateVal(a.path);
          const valB = getDateVal(b.path);
          if (valA === valB) return b.views - a.views; // fallback to views
          return sortBy === 'date-desc' ? valB - valA : valA - valB;
        default: return 0;
      }
    });

    return result.slice(0, limit);
  }, [data, searchQuery, sortBy, limit]);

  return (
    <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl backdrop-blur-sm overflow-hidden flex flex-col h-full mt-6">
      <div className="p-6 border-b border-slate-200 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
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
        
        {/* Controles de Filtrado */}
        <div className="flex items-center gap-3 w-full md:w-auto overflow-visible z-50">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar publicación..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 py-2.5 pl-9 pr-4 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>
          
          <div className="w-36 hidden sm:block">
            <CustomSelect 
              value={sortBy}
              onChange={setSortBy}
              options={[
                { value: 'views-desc', label: 'Más Vistos' },
                { value: 'views-asc', label: 'Menos Vistos' },
                { value: 'date-desc', label: 'Más Reciente' },
                { value: 'date-asc', label: 'Más Antiguo' },
                { value: 'time-desc', label: 'Mayor Tiempo' }
              ]}
            />
          </div>
          
          <div className="w-24 hidden sm:block">
            <CustomSelect 
              value={limit.toString()}
              onChange={(v) => setLimit(parseInt(v))}
              options={[
                { value: '30', label: 'Top 30' },
                { value: '50', label: 'Top 50' },
                { value: '100', label: 'Top 100' }
              ]}
            />
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
            ) : processedData.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                  {searchQuery ? 'No hay resultados para tu búsqueda.' : 'No se encontró contenido publicado en este período.'}
                </td>
              </tr>
            ) : (
              processedData.map((item, i) => (
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

interface SelectOption { value: string; label: string; }
function CustomSelect({ value, onChange, options }: {
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 py-2.5 px-3 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
      >
        <span className="truncate mr-2">{selected?.label}</span>
        <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className="absolute z-[100] right-0 w-[140%] mt-2 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
          {options.map(o => (
            <button
              key={o.value}
              type="button"
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                o.value === value
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold border-l-2 border-blue-500'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 font-medium border-l-2 border-transparent'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
