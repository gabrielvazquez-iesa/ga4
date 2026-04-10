import { useState, useEffect, useMemo } from 'react';
import { apiFetch } from '../lib/api-fetch';
import { Target, Clock, MousePointerClick, Search, Users, ExternalLink, ChevronLeft, ChevronRight, Activity } from 'lucide-react';

export default function EngagementModule({ days, filterPath }: { days: number; filterPath?: string }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchEngagement = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch(`/api/ga4-engagement?days=${days}${filterPath ? `&pathFilter=${filterPath}` : ''}`);
        const json = await res.json();
        if (json.error) throw new Error(json.error);
        if (json.data) setData(json.data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'No se pudieron cargar los datos de engagement.');
      } finally {
        setLoading(false);
      }
    };
    fetchEngagement();
  }, [days, filterPath]);

  // Filter and Paginate
  const filteredData = useMemo(() => {
    return data.filter(item => 
      item.path.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  return (
    <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-xl backdrop-blur-xl overflow-hidden flex flex-col w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shadow-lg shadow-orange-500/10 text-orange-500">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Engagement de Contenido</h3>
            <p className="text-sm text-slate-500 font-medium">Páginas de mayor impacto y retención</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar página..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 py-3 pl-11 pr-4 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500/30 dark:text-white transition-all"
          />
        </div>
      </div>

      <div className="overflow-x-auto -mx-2">
        <table className="w-full text-sm text-left border-separate border-spacing-y-2">
          <thead>
            <tr className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em]">
              <th className="px-6 py-4">Página (URL)</th>
              <th className="px-6 py-4">Usuarios</th>
              <th className="px-6 py-4">T. Promedio</th>
              <th className="px-6 py-4">Rebote</th>
              <th className="px-6 py-4">Efectividad</th>
              <th className="px-6 py-4 text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={6} className="px-6 py-4">
                    <div className="h-12 bg-slate-100 dark:bg-white/5 rounded-2xl w-full"></div>
                  </td>
                </tr>
              ))
            ) : error ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-red-400 font-medium bg-red-500/10 rounded-3xl border border-red-500/20">{error}</td></tr>
            ) : filteredData.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium italic bg-slate-50 dark:bg-white/5 rounded-3xl">No se encontraron resultados para "{searchTerm}"</td></tr>
            ) : (
              paginatedData.map((row, i) => (
                <tr key={i} className="group bg-white/40 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all duration-300">
                  <td className="px-6 py-4 first:rounded-l-2xl">
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-slate-900 dark:text-slate-100 truncate max-w-[300px]" title={row.path}>{row.path}</span>
                      <span className="text-[10px] text-slate-500 truncate">{window.location.origin}{row.path}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 font-black dark:text-white">
                      <Users className="w-3.5 h-3.5 text-blue-400" />
                      {row.users.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {Math.floor(row.avgDuration)}s
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase ${
                      row.bounceRate < 40 ? 'bg-emerald-500/10 text-emerald-500' : 
                      row.bounceRate < 70 ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      <Activity className="w-3 h-3" />
                      {(row.bounceRate * 1).toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 min-w-[150px]">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-slate-200 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${row.score > 70 ? 'bg-blue-500' : row.score > 40 ? 'bg-indigo-500' : 'bg-slate-500'}`} 
                          style={{ width: `${row.score}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-black dark:text-white w-6">{row.score}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right last:rounded-r-2xl">
                    <a 
                      href={row.path} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-500 hover:bg-blue-600 hover:text-white transition-all duration-300"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between pt-8 border-t border-slate-200 dark:border-white/5 mt-4">
          <p className="text-xs text-slate-500 font-bold">
            Mostrando <span className="text-slate-900 dark:text-white">{(currentPage-1)*itemsPerPage + 1}</span> a <span className="text-slate-900 dark:text-white">{Math.min(currentPage*itemsPerPage, filteredData.length)}</span> de {filteredData.length} páginas
          </p>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4 dark:text-white" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${
                    currentPage === i + 1 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                      : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4 dark:text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
