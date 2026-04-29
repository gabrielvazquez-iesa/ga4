import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api-fetch';
import { Copy, Globe, RefreshCw, AlertTriangle, ExternalLink, Search, Download, Calendar } from 'lucide-react';
import { nativeToast as toast } from './NativeToaster';

interface YearData {
  organic: number;
  direct: number;
  referral: number;
  users: number;
  avgDuration: number;
  avgDurationFormatted: string;
  totalSessions: number;
}

interface EcosystemItem {
  name: string;
  y2025: YearData;
  y2026: YearData;
}

export default function EcosystemReport() {
  const [data, setData] = useState<EcosystemItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/ga4-ecosystem');
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json.data || []);
    } catch (e: any) {
      setError(e.message);
      toast.error("Error al cargar el ecosistema digital");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = data.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyToClipboard = () => {
    if (filteredData.length === 0) return;

    const header = "Sitio\tUsuarios 25\tTiempo 25\tOrg 25\tDir 25\tRef 25\tUsuarios 26\tTiempo 26\tOrg 26\tDir 26\tRef 26";
    const rows = filteredData.map(item => 
      `${item.name}\t${item.y2025.users}\t${item.y2025.avgDurationFormatted}\t${item.y2025.organic}\t${item.y2025.direct}\t${item.y2025.referral}\t${item.y2026.users}\t${item.y2026.avgDurationFormatted}\t${item.y2026.organic}\t${item.y2026.direct}\t${item.y2026.referral}`
    ).join('\n');

    const fullText = `${header}\n${rows}`;

    navigator.clipboard.writeText(fullText).then(() => {
      toast.success("¡Datos comparativos copiados!");
    }).catch(err => {
      console.error('Error al copiar', err);
      toast.error("Error al copiar los datos");
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-slate-900 to-black rounded-3xl p-8 text-white shadow-2xl border border-white/5">
        <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-6 items-start lg:items-center">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-blue-500/30 shadow-inner">
              <Globe className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Comparativa Ecosistema Digital</h1>
              <p className="text-slate-400 text-sm mt-1">Análisis de rendimiento anual: 2025 vs 2026 (Actualidad).</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-900 font-bold rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Actualizar Reporte
            </button>
          </div>
        </div>
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl" />
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/80 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-white/10 backdrop-blur-md">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Filtrar por dominio..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-100 dark:bg-white/5 border-none rounded-xl outline-none text-sm"
          />
        </div>

        <button 
          onClick={copyToClipboard}
          disabled={loading || filteredData.length === 0}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20"
        >
          <Copy className="w-4 h-4" /> Copiar para Excel (2025-2026)
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-xl backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-950/80 border-b border-slate-200 dark:border-white/5">
                <th rowSpan={2} className="px-6 py-4 font-bold text-slate-900 dark:text-white uppercase tracking-wider border-r border-slate-200 dark:border-white/5 sticky left-0 z-20 bg-inherit">Sitio / Hostname</th>
                <th colSpan={5} className="px-6 py-2 font-black text-center text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border-r border-slate-200 dark:border-white/5 bg-indigo-500/5">Período 2025</th>
                <th colSpan={5} className="px-6 py-2 font-black text-center text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-500/5">Período 2026 (Actual)</th>
              </tr>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-white/10">
                <th className="px-4 py-3 font-bold text-slate-500 text-right border-r border-slate-200 dark:border-white/5">Usuarios</th>
                <th className="px-4 py-3 font-bold text-slate-500 text-right border-r border-slate-200 dark:border-white/5">T. Promedio</th>
                <th className="px-4 py-3 font-bold text-slate-500 text-right border-r border-slate-200 dark:border-white/5">Orgánico</th>
                <th className="px-4 py-3 font-bold text-slate-500 text-right border-r border-slate-200 dark:border-white/5">Directo</th>
                <th className="px-4 py-3 font-bold text-slate-500 text-right border-r border-slate-200 dark:border-white/5">Referidos</th>
                
                <th className="px-4 py-3 font-bold text-slate-500 text-right border-r border-slate-200 dark:border-white/5 bg-emerald-500/5">Usuarios</th>
                <th className="px-4 py-3 font-bold text-slate-500 text-right border-r border-slate-200 dark:border-white/5 bg-emerald-500/5">T. Promedio</th>
                <th className="px-4 py-3 font-bold text-slate-500 text-right border-r border-slate-200 dark:border-white/5 bg-emerald-500/5">Orgánico</th>
                <th className="px-4 py-3 font-bold text-slate-500 text-right border-r border-slate-200 dark:border-white/5 bg-emerald-500/5">Directo</th>
                <th className="px-4 py-3 font-bold text-slate-500 text-right bg-emerald-500/5">Referidos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4 border-r border-slate-200 dark:border-white/5"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-32"></div></td>
                    {Array(10).fill(0).map((_, j) => (
                      <td key={j} className="px-4 py-4 border-r border-slate-200 dark:border-white/5 last:border-r-0"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-12 ml-auto"></div></td>
                    ))}
                  </tr>
                ))
              ) : filteredData.length > 0 ? (
                filteredData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white border-r border-slate-200 dark:border-white/5 sticky left-0 z-10 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-2">
                        {item.name}
                        {item.name.includes('.') && <ExternalLink className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                      </div>
                    </td>
                    
                    {/* 2025 Data */}
                    <td className="px-4 py-4 text-right font-mono border-r border-slate-200 dark:border-white/5">{item.y2025.users.toLocaleString()}</td>
                    <td className="px-4 py-4 text-right font-mono border-r border-slate-200 dark:border-white/5">{item.y2025.avgDurationFormatted}</td>
                    <td className="px-4 py-4 text-right font-mono border-r border-slate-200 dark:border-white/5">{item.y2025.organic.toLocaleString()}</td>
                    <td className="px-4 py-4 text-right font-mono border-r border-slate-200 dark:border-white/5">{item.y2025.direct.toLocaleString()}</td>
                    <td className="px-4 py-4 text-right font-mono border-r border-slate-200 dark:border-white/5">{item.y2025.referral.toLocaleString()}</td>
                    
                    {/* 2026 Data */}
                    <td className="px-4 py-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 border-r border-slate-200 dark:border-white/5 bg-emerald-500/5">{item.y2026.users.toLocaleString()}</td>
                    <td className="px-4 py-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 border-r border-slate-200 dark:border-white/5 bg-emerald-500/5">{item.y2026.avgDurationFormatted}</td>
                    <td className="px-4 py-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 border-r border-slate-200 dark:border-white/5 bg-emerald-500/5">{item.y2026.organic.toLocaleString()}</td>
                    <td className="px-4 py-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 border-r border-slate-200 dark:border-white/5 bg-emerald-500/5">{item.y2026.direct.toLocaleString()}</td>
                    <td className="px-4 py-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">{item.y2026.referral.toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="px-6 py-20 text-center text-slate-500 italic">No hay datos disponibles para mostrar.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 flex gap-4 text-amber-600 dark:text-amber-400 text-sm">
        <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center shrink-0">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold mb-1">Notas del Reporte Anual</h4>
          <p className="opacity-80">
            Este reporte permite comparar el rendimiento del ecosistema digital entre el año fiscal 2025 y lo transcurrido del 2026. 
            Las métricas de "Tiempo Promedio" y "Usuarios" son valores consolidados por propiedad y hostname.
          </p>
        </div>
      </div>
    </div>
  );
}
