import { useState, useEffect, useMemo } from 'react';
import { apiFetch } from '../lib/api-fetch';
import { MousePointer2, RefreshCw, Download, Copy, FileSpreadsheet, Filter, Search, Calendar, Facebook } from 'lucide-react';
import { nativeToast as toast } from './NativeToaster';

interface MetaAdsRow {
  source: string;
  medium: string;
  campaign: string;
  content: string;
  term: string;
  sessions: number;
  users: number;
}

export default function MetaAdsReport() {
  const [data, setData] = useState<MetaAdsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/ga4-meta-ads');
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json.data || []);
    } catch (e: any) {
      setError(e.message);
      toast.error("Error al cargar datos de Meta Ads");
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    return data.filter(item => 
      item.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.campaign.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const downloadExcel = async () => {
    if (filteredData.length === 0) return;
    const [XLSX, { saveAs }] = await Promise.all([
      import('xlsx'),
      import('file-saver')
    ]);

    const wsData = [
      ["REPORTE META ADS - LANDING PAGE"],
      ["Página:", "/publish/comunicaciones/meta-ads.html"],
      ["Generado el:", new Date().toLocaleDateString()],
      [],
      ["SOURCE", "MEDIUM", "CAMPAIGN", "CONTENT", "TERM", "USERS", "SESSIONS"]
    ];

    filteredData.forEach(item => {
      wsData.push([
        item.source,
        item.medium,
        item.campaign,
        item.content,
        item.term,
        item.users,
        item.sessions
      ]);
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "MetaAds");
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(blob, `MetaAds_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success("Excel descargado correctamente");
  };

  const copyToClipboard = () => {
    if (filteredData.length === 0) return;
    const textHeader = "Source\tMedium\tCampaign\tContent\tTerm\tUsers\tSessions";
    const textRows = filteredData.map(item => 
      `${item.source}\t${item.medium}\t${item.campaign}\t${item.content}\t${item.term}\t${item.users}\t${item.sessions}`
    ).join('\n');
    const fullText = `${textHeader}\n${textRows}`;

    navigator.clipboard.writeText(fullText).then(() => {
      toast.success("Copiado al portapapeles");
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
      
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-slate-900/60 dark:to-slate-900/40 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-xl backdrop-blur-md">
        <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6 items-start md:items-center">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-blue-600/10 dark:bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-600/20 shadow-inner">
              <Facebook className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-none mb-1">Rendimiento Meta Ads Landing</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm flex items-center gap-2">
                 <MousePointer2 className="w-4 h-4" /> /publish/comunicaciones/meta-ads.html
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={fetchData}
              disabled={loading}
              className="p-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 rounded-xl transition-all"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-5 py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-black rounded-xl transition-all shadow-lg shadow-indigo-500/20"
            >
              <Copy className="w-4 h-4" /> Copiar
            </button>
            <button 
              onClick={downloadExcel}
              className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl transition-all shadow-lg shadow-emerald-600/20"
            >
              <FileSpreadsheet className="w-4 h-4" /> Excel
            </button>
          </div>
        </div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl" />
      </div>

      {/* Filters */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          type="text" 
          placeholder="Filtrar por source, campaña o contenido..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-2xl outline-none text-sm font-bold shadow-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
        />
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 rounded-[2rem] overflow-hidden shadow-xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-white/5">
                <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-wider">Source / Medium</th>
                <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-wider">Campaign</th>
                <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-wider">Ad Content</th>
                <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-wider">Term</th>
                <th className="px-6 py-4 font-black text-slate-900 dark:text-white uppercase tracking-wider text-right bg-blue-500/5">Users</th>
                <th className="px-6 py-4 font-black text-slate-900 dark:text-white uppercase tracking-wider text-right bg-blue-500/10">Sessions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-6"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full w-full"></div></td>
                  </tr>
                ))
              ) : filteredData.length > 0 ? (
                filteredData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-900 dark:text-white">{item.source}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">{item.medium}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">{item.campaign}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-[10px] font-bold italic">{item.content}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-[10px]">{item.term}</td>
                    <td className="px-6 py-4 text-right font-mono font-black text-blue-600 dark:text-blue-400 bg-blue-500/5">{item.users.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-mono font-black text-blue-700 dark:text-blue-300 bg-blue-500/10">{item.sessions.toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <p className="text-slate-500 dark:text-slate-400 font-bold">No se encontraron datos para los filtros aplicados.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
