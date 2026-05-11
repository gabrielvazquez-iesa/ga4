import React, { useState, useEffect, useMemo } from 'react';
import { apiFetch } from '../lib/api-fetch';
import { MousePointer2, RefreshCw, Download, Copy, FileSpreadsheet, Filter, Search, Calendar, Facebook } from 'lucide-react';
import { nativeToast as toast } from './NativeToaster';

interface MetaAdsRow {
  curso: string;
  source: string;
  medium: string;
  campaign: string;
  content: string;
  term: string;
  sessions: number;
  users: number;
}

interface GroupedCourse {
  curso: string;
  users: number;
  sessions: number;
  details: MetaAdsRow[];
}

export default function MetaAdsReport() {
  const [data, setData] = useState<MetaAdsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCourses, setExpandedCourses] = useState<string[]>([]);

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

  const groupedData = useMemo(() => {
    const map = new Map<string, GroupedCourse>();
    
    data.forEach(item => {
      const existing = map.get(item.curso);
      if (existing) {
        existing.users += item.users;
        existing.sessions += item.sessions;
        existing.details.push(item);
      } else {
        map.set(item.curso, {
          curso: item.curso,
          users: item.users,
          sessions: item.sessions,
          details: [item]
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => b.sessions - a.sessions);
  }, [data]);

  const filteredGroupedData = useMemo(() => {
    return groupedData.filter(group => 
      group.curso.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.details.some(d => 
        d.campaign.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [groupedData, searchTerm]);

  const top6 = useMemo(() => groupedData.slice(0, 6), [groupedData]);

  const toggleExpand = (curso: string) => {
    setExpandedCourses(prev => 
      prev.includes(curso) ? prev.filter(c => c !== curso) : [...prev, curso]
    );
  };

  const downloadExcel = async () => {
    if (filteredGroupedData.length === 0) return;
    const [XLSX, { saveAs }] = await Promise.all([
      import('xlsx'),
      import('file-saver')
    ]);

    const wsData = [
      ["REPORTE META ADS - CURSOS AGRUPADOS"],
      ["Generado el:", new Date().toLocaleDateString()],
      [],
      ["CURSO", "USERS TOTAL", "SESSIONS TOTAL", "DETALLE UTM (CAMPAIGN / SOURCE / CONTENT)"]
    ];

    filteredGroupedData.forEach(item => {
      wsData.push([
        item.curso,
        item.users,
        item.sessions,
        item.details.map(d => `${d.campaign} (${d.source})`).join(' | ')
      ]);
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "MetaAds_Grouped");
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(blob, `MetaAds_Grouped_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success("Excel descargado correctamente");
  };

  const copyToClipboard = () => {
    if (filteredGroupedData.length === 0) return;
    const textHeader = "Curso\tUsers\tSessions";
    const textRows = filteredGroupedData.map(item => 
      `${item.curso}\t${item.users}\t${item.sessions}`
    ).join('\n');
    const fullText = `${textHeader}\n${textRows}`;

    navigator.clipboard.writeText(fullText).then(() => {
      toast.success("Resumen copiado al portapapeles");
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
      
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-slate-900/60 dark:to-slate-900/40 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-xl backdrop-blur-md">
        <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6 items-start md:items-center">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-blue-600/10 dark:bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-600/20 shadow-inner">
              <Facebook className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-none mb-1">Rendimiento por Cursos</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm flex items-center gap-2">
                 <MousePointer2 className="w-4 h-4" /> Resumen consolidado Meta Ads
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

      {/* Top 6 Visual Highlights */}
      {!loading && top6.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {top6.map((course, idx) => (
            <div 
              key={course.curso} 
              className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 p-5 rounded-[2rem] shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 group relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-3">
                   <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                     idx === 0 ? 'bg-amber-400 text-amber-900' : 
                     idx === 1 ? 'bg-slate-300 text-slate-700' : 
                     idx === 2 ? 'bg-orange-400 text-orange-950' : 
                     'bg-blue-500/10 text-blue-500'
                   }`}>
                     #{idx + 1}
                   </div>
                   <div className="text-right">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sesiones</p>
                     <p className="text-lg font-black text-blue-600 dark:text-blue-400">{course.sessions.toLocaleString()}</p>
                   </div>
                </div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white line-clamp-2 leading-tight h-8 mb-2 group-hover:text-blue-500 transition-colors">
                  {course.curso}
                </h4>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5">
                   <p className="text-[10px] font-bold text-slate-500">Usuarios</p>
                   <p className="text-xs font-black text-slate-700 dark:text-slate-300">{course.users.toLocaleString()}</p>
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-all" />
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          type="text" 
          placeholder="Buscar curso, campaña o contenido..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-2xl outline-none text-sm font-bold shadow-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
        />
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-white/5">
                <th className="w-12 px-6 py-5"></th>
                <th className="px-6 py-5 font-black text-slate-900 dark:text-white uppercase tracking-wider bg-blue-500/5">Curso / Actividad (Agrupado)</th>
                <th className="px-6 py-5 font-black text-slate-400 uppercase tracking-wider text-center">Campañas</th>
                <th className="px-6 py-5 font-black text-slate-900 dark:text-white uppercase tracking-wider text-right bg-blue-500/5 border-l border-slate-200 dark:border-white/5">Total Users</th>
                <th className="px-6 py-5 font-black text-slate-900 dark:text-white uppercase tracking-wider text-right bg-blue-500/10">Total Sessions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-6"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full w-full"></div></td>
                  </tr>
                ))
              ) : filteredGroupedData.length > 0 ? (
                filteredGroupedData.map((group, idx) => (
                  <React.Fragment key={group.curso}>
                    <tr 
                      onClick={() => toggleExpand(group.curso)}
                      className={`hover:bg-slate-50 dark:hover:bg-white/5 transition-all group cursor-pointer ${expandedCourses.includes(group.curso) ? 'bg-blue-50/50 dark:bg-blue-500/5' : ''}`}
                    >
                      <td className="px-6 py-5 text-center">
                        <div className={`transition-transform duration-300 ${expandedCourses.includes(group.curso) ? 'rotate-180' : ''}`}>
                           <Filter className="w-4 h-4 text-slate-400" />
                        </div>
                      </td>
                      <td className="px-6 py-5 bg-blue-500/5">
                        <div className="flex items-center gap-3">
                           <div className={`w-2 h-2 rounded-full ${idx < 3 ? 'bg-blue-500 animate-pulse' : 'bg-slate-400'}`} />
                           <span className="font-black text-blue-600 dark:text-blue-400 text-sm">{group.curso}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                         <span className="px-3 py-1 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 rounded-full font-black text-[10px]">
                           {group.details.length} UTMs
                         </span>
                      </td>
                      <td className="px-6 py-5 text-right font-mono font-black text-blue-600 dark:text-blue-400 bg-blue-500/5 border-l border-slate-200 dark:border-white/5">
                        {group.users.toLocaleString()}
                      </td>
                      <td className="px-6 py-5 text-right font-mono font-black text-blue-700 dark:text-blue-300 bg-blue-500/10">
                        {group.sessions.toLocaleString()}
                      </td>
                    </tr>
                    
                    {/* Expanded Detail View */}
                    {expandedCourses.includes(group.curso) && (
                      <tr className="bg-slate-50/80 dark:bg-slate-950/40 border-l-4 border-blue-500 animate-in slide-in-from-left duration-300">
                        <td colSpan={5} className="p-0">
                          <div className="overflow-x-auto">
                            <table className="w-full text-[10px] border-t border-slate-200 dark:border-white/10">
                               <thead className="bg-slate-100/50 dark:bg-white/5">
                                 <tr>
                                   <th className="px-10 py-3 font-bold text-slate-400 uppercase tracking-tighter">Campaign</th>
                                   <th className="px-6 py-3 font-bold text-slate-400 uppercase tracking-tighter">Source / Medium</th>
                                   <th className="px-6 py-3 font-bold text-slate-400 uppercase tracking-tighter">Ad Content</th>
                                   <th className="px-6 py-3 font-bold text-slate-400 uppercase tracking-tighter text-right">Users</th>
                                   <th className="px-6 py-3 font-bold text-slate-400 uppercase tracking-tighter text-right">Sessions</th>
                                 </tr>
                               </thead>
                               <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                 {group.details.map((detail, dIdx) => (
                                   <tr key={dIdx} className="hover:bg-white dark:hover:bg-white/5 transition-colors">
                                     <td className="px-10 py-3 font-black text-slate-700 dark:text-slate-300 max-w-[250px] truncate">{detail.campaign}</td>
                                     <td className="px-6 py-3">
                                        <span className="font-bold text-slate-900 dark:text-white">{detail.source}</span>
                                        <span className="ml-2 text-slate-400 opacity-60">/ {detail.medium}</span>
                                     </td>
                                     <td className="px-6 py-3 text-slate-400 italic truncate max-w-[150px]">{detail.content}</td>
                                     <td className="px-6 py-3 text-right font-mono font-bold text-slate-500">{detail.users.toLocaleString()}</td>
                                     <td className="px-6 py-3 text-right font-mono font-bold text-slate-500">{detail.sessions.toLocaleString()}</td>
                                   </tr>
                                 ))}
                               </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
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
