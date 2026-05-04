import { useState, useEffect, useMemo } from 'react';
import { apiFetch } from '../lib/api-fetch';
import { supabase } from '../lib/supabase';
import { Copy, Globe, RefreshCw, AlertTriangle, ExternalLink, Search, Download, Calendar, Settings, X, Plus, Trash2, Eye, EyeOff, Check, Filter, FileSpreadsheet } from 'lucide-react';
import { nativeToast as toast } from './NativeToaster';
// Excel and file-saver are imported dynamically to avoid SSR issues

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
  id: string;
  name: string;
  hostname: string;
  propertyName: string;
  isMain: boolean;
  y2025: YearData;
  y2026: YearData;
}

interface DBProperty {
  id: string;
  name: string;
  property_id: string;
}

export default function EcosystemReport() {
  const [data, setData] = useState<EcosystemItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncErrors, setSyncErrors] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // UI State
  const [showSettings, setShowSettings] = useState(false);
  const [showVisibilityModal, setShowVisibilityModal] = useState(false);
  const [dbProperties, setDbProperties] = useState<DBProperty[]>([]);
  const [newPropName, setNewPropName] = useState('');
  const [newPropId, setNewPropId] = useState('');
  const [savingProp, setSavingProp] = useState(false);
  
  // Filtering/Selection State
  const [hiddenHostnames, setHiddenHostnames] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('ecosystem_hidden_ids');
    if (saved) setHiddenHostnames(JSON.parse(saved));
    
    fetchData();
    fetchProperties();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/ga4-ecosystem');
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      
      if (json.errors && json.errors.length > 0) {
        setSyncErrors(json.errors);
      } else {
        setSyncErrors([]);
      }

      setData(json.data || []);
    } catch (e: any) {
      setError(e.message);
      toast.error("Error crítico al cargar el ecosistema");
    } finally {
      setLoading(false);
    }
  };

  const fetchProperties = async () => {
    const { data } = await supabase.from('ga4_properties').select('*').order('created_at', { ascending: false });
    setDbProperties(data || []);
  };

  const addProperty = async () => {
    if (!newPropName || !newPropId) return;
    const cleanId = newPropId.trim();
    if (!/^\d+$/.test(cleanId)) {
      toast.error("El ID de propiedad debe ser solo números.");
      return;
    }

    setSavingProp(true);
    const { error } = await supabase.from('ga4_properties').insert({
      name: newPropName.trim(),
      property_id: cleanId
    });
    if (error) {
      toast.error("No se pudo guardar: " + error.message);
    } else {
      toast.success("Propiedad registrada correctamente");
      setNewPropName('');
      setNewPropId('');
      fetchProperties();
      fetchData();
    }
    setSavingProp(false);
  };

  const deleteProperty = async (id: string) => {
    const { error } = await supabase.from('ga4_properties').delete().eq('id', id);
    if (error) toast.error("Error al eliminar");
    else {
      fetchProperties();
      fetchData();
    }
  };

  const toggleVisibility = (id: string) => {
    const newHidden = hiddenHostnames.includes(id) 
      ? hiddenHostnames.filter(h => h !== id)
      : [...hiddenHostnames, id];
    setHiddenHostnames(newHidden);
    localStorage.setItem('ecosystem_hidden_ids', JSON.stringify(newHidden));
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const filteredData = useMemo(() => {
    return data.filter(item => 
      !hiddenHostnames.includes(item.id) &&
      (item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.hostname.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [data, hiddenHostnames, searchTerm]);

  const exportData = selectedIds.length > 0 
    ? filteredData.filter(item => selectedIds.includes(item.id))
    : filteredData;

  const downloadExcel = async () => {
    if (exportData.length === 0) return;

    // Dynamically import libraries to avoid SSR issues
    const [XLSX, { saveAs }] = await Promise.all([
      import('xlsx'),
      import('file-saver')
    ]);

    // Build worksheet data
    const wsData = [
      ["REPORTE COMPARATIVO ECOSISTEMA DIGITAL - IESA"],
      ["Generado el:", new Date().toLocaleDateString()],
      [],
      ["", "", "PERÍODO 2025", "", "", "", "", "PERÍODO 2026 (ACTUAL)", "", "", "", ""],
      ["SITIO / DOMINIO", "PROPIEDAD GA4", "USUARIOS", "T. PROMEDIO", "ORGÁNICO", "DIRECTO", "REFERIDOS", "USUARIOS", "T. PROMEDIO", "ORGÁNICO", "DIRECTO", "REFERIDOS"]
    ];

    exportData.forEach(item => {
      wsData.push([
        item.hostname,
        item.propertyName,
        item.y2025.users,
        item.y2025.avgDurationFormatted,
        item.y2025.organic,
        item.y2025.direct,
        item.y2025.referral,
        item.y2026.users,
        item.y2026.avgDurationFormatted,
        item.y2026.organic,
        item.y2026.direct,
        item.y2026.referral
      ]);
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Style adjustments (basic)
    ws['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 10 }];

    XLSX.utils.book_append_sheet(wb, ws, "Ecosistema");
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(blob, `Ecosistema_IESA_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success("Excel descargado correctamente");
  };

  const copyToClipboard = () => {
    if (exportData.length === 0) return;

    // Create an HTML table string for the clipboard
    const htmlHeader = `
      <table border="1" style="border-collapse: collapse; font-family: Arial, sans-serif; font-size: 11px;">
        <tr style="background-color: #1e293b; color: white; font-weight: bold;">
          <th rowspan="2" style="padding: 10px;">Sitio / Domino</th>
          <th rowspan="2" style="padding: 10px;">Propiedad</th>
          <th colspan="5" style="padding: 5px; background-color: #312e81; text-align: center;">Período 2025</th>
          <th colspan="5" style="padding: 5px; background-color: #064e3b; text-align: center;">Período 2026</th>
        </tr>
        <tr style="background-color: #334155; color: white; font-weight: bold;">
          <th style="padding: 5px;">Users</th><th style="padding: 5px;">Time</th><th style="padding: 5px;">Org</th><th style="padding: 5px;">Dir</th><th style="padding: 5px;">Ref</th>
          <th style="padding: 5px;">Users</th><th style="padding: 5px;">Time</th><th style="padding: 5px;">Org</th><th style="padding: 5px;">Dir</th><th style="padding: 5px;">Ref</th>
        </tr>
    `;

    const htmlRows = exportData.map(item => `
      <tr>
        <td style="padding: 5px; font-weight: bold;">${item.hostname}</td>
        <td style="padding: 5px; color: #6366f1;">${item.propertyName}</td>
        <td style="padding: 5px; text-align: right;">${item.y2025.users.toLocaleString()}</td>
        <td style="padding: 5px; text-align: right;">${item.y2025.avgDurationFormatted}</td>
        <td style="padding: 5px; text-align: right;">${item.y2025.organic.toLocaleString()}</td>
        <td style="padding: 5px; text-align: right;">${item.y2025.direct.toLocaleString()}</td>
        <td style="padding: 5px; text-align: right;">${item.y2025.referral.toLocaleString()}</td>
        <td style="padding: 5px; text-align: right; background-color: #ecfdf5; font-weight: bold;">${item.y2026.users.toLocaleString()}</td>
        <td style="padding: 5px; text-align: right; background-color: #ecfdf5; font-weight: bold;">${item.y2026.avgDurationFormatted}</td>
        <td style="padding: 5px; text-align: right; background-color: #ecfdf5; font-weight: bold;">${item.y2026.organic.toLocaleString()}</td>
        <td style="padding: 5px; text-align: right; background-color: #ecfdf5; font-weight: bold;">${item.y2026.direct.toLocaleString()}</td>
        <td style="padding: 5px; text-align: right; background-color: #ecfdf5; font-weight: bold;">${item.y2026.referral.toLocaleString()}</td>
      </tr>
    `).join('');

    const htmlFooter = `</table>`;
    const fullHtml = htmlHeader + htmlRows + htmlFooter;

    // Fallback for plain text
    const textHeader = "Sitio\tPropiedad\tUsers 25\tTime 25\tOrg 25\tDir 25\tRef 25\tUsers 26\tTime 26\tOrg 26\tDir 26\tRef 26";
    const textRows = exportData.map(item => 
      `${item.hostname}\t${item.propertyName}\t${item.y2025.users}\t${item.y2025.avgDurationFormatted}\t${item.y2025.organic}\t${item.y2025.direct}\t${item.y2025.referral}\t${item.y2026.users}\t${item.y2026.avgDurationFormatted}\t${item.y2026.organic}\t${item.y2026.direct}\t${item.y2026.referral}`
    ).join('\n');
    const fullText = `${textHeader}\n${textRows}`;

    // Write to clipboard as both HTML and plain text
    const blobHtml = new Blob([fullHtml], { type: 'text/html' });
    const blobText = new Blob([fullText], { type: 'text/plain' });
    
    const data = [new ClipboardItem({ 'text/html': blobHtml, 'text/plain': blobText })];

    navigator.clipboard.write(data).then(() => {
      toast.success(`Copiado con formato para Excel (${exportData.length} sitios)`);
    }).catch(err => {
      console.error('Error al copiar HTML', err);
      // Fallback only text
      navigator.clipboard.writeText(fullText).then(() => toast.success("Copiado (Solo texto)"));
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-black rounded-[3rem] p-12 text-white shadow-2xl border border-white/5">
        <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-8 items-start lg:items-center">
          <div className="flex items-center gap-7">
            <div className="w-20 h-20 bg-blue-500/20 rounded-[2rem] flex items-center justify-center backdrop-blur-2xl border border-blue-500/30 shadow-inner">
              <Globe className="w-10 h-10 text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight leading-none mb-2">Ecosistema Digital</h1>
              <p className="text-slate-400 font-medium flex items-center gap-2">
                 <Calendar className="w-4 h-4" /> Comparativa Histórica 2025 vs 2026
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
             <button 
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black rounded-2xl transition-all"
            >
              <Settings className="w-5 h-5" /> Configurar Propiedades
            </button>
            <button 
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-600/30 active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} /> Actualizar Data
            </button>
          </div>
        </div>
        <div className="absolute -top-32 -right-32 w-[30rem] h-[30rem] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-32 -left-32 w-[30rem] h-[30rem] bg-indigo-600/10 rounded-full blur-[120px]" />
      </div>
      
      {/* Sync Error Banner */}
      {syncErrors.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-[2rem] flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-sm animate-in slide-in-from-top duration-500">
           <div className="flex items-center gap-4 text-amber-600 dark:text-amber-400">
              <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-tight">Problemas de Sincronización</p>
                <p className="text-xs font-medium opacity-80">{syncErrors.length} cuenta(s) presentan errores. Puedes eliminarlas desde configuración.</p>
              </div>
           </div>
           <div className="flex items-center gap-2">
              <button 
                onClick={() => setSyncErrors([])}
                className="px-4 py-2.5 text-amber-600 dark:text-amber-400 text-xs font-black rounded-xl hover:bg-amber-500/10 transition-colors"
              >
                Ignorar
              </button>
              <button 
                onClick={() => setShowSettings(true)}
                className="px-6 py-2.5 bg-amber-500 text-white text-xs font-black rounded-xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20"
              >
                Gestionar Cuentas
              </button>
           </div>
        </div>
      )}

      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-4 relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por dominio o propiedad..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-3xl outline-none text-sm font-black shadow-lg focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>

        <div className="lg:col-span-8 flex flex-col sm:flex-row justify-end items-center gap-3">
           <div className="flex bg-slate-100 dark:bg-slate-950 p-2 rounded-2xl border border-slate-200 dark:border-white/5 w-full sm:w-auto">
             <button 
               onClick={() => setSelectedIds([])}
               className={`flex-1 px-5 py-2.5 text-xs font-black rounded-xl transition-all ${selectedIds.length === 0 ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-lg' : 'text-slate-500'}`}
             >
               Ver Todos
             </button>
             <button 
               onClick={() => setSelectedIds(filteredData.map(i => i.id))}
               className={`flex-1 px-5 py-2.5 text-xs font-black rounded-xl transition-all ${selectedIds.length > 0 ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-lg' : 'text-slate-500'}`}
             >
               Seleccionar visibles
             </button>
           </div>
           
           <button 
            onClick={() => setShowVisibilityModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-5 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white font-black rounded-3xl border border-slate-200 dark:border-white/10 transition-all hover:bg-white/10"
          >
            <Filter className="w-5 h-5" /> Filtros
          </button>

           <div className="flex gap-2 w-full sm:w-auto">
             <button 
              onClick={copyToClipboard}
              disabled={loading || exportData.length === 0}
              className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-5 bg-indigo-500 hover:bg-indigo-400 text-white font-black rounded-3xl transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50 active:scale-95"
              title="Copiar con formato para Excel"
            >
              <Copy className="w-5 h-5" /> Copiar ({exportData.length})
            </button>
            <button 
              onClick={downloadExcel}
              disabled={loading || exportData.length === 0}
              className="flex items-center justify-center p-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-3xl transition-all shadow-xl shadow-emerald-600/20 disabled:opacity-50 active:scale-95"
              title="Descargar archivo Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-6 h-6" />
            </button>
           </div>
        </div>
      </div>

      {/* Table Area */}
      <div className="w-full">
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-white/5">
                  <th rowSpan={2} className="w-14 px-7 py-5"></th>
                  <th rowSpan={2} className="px-7 py-5 font-black text-slate-900 dark:text-white uppercase tracking-widest border-r border-slate-200 dark:border-white/5 sticky left-0 z-20 bg-inherit shadow-[4px_0_10px_rgba(0,0,0,0.05)]">Sitio / Propiedad</th>
                  <th colSpan={5} className="px-7 py-4 font-black text-center text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] border-r border-slate-200 dark:border-white/5 bg-indigo-500/5">Rendimiento Anual 2025</th>
                  <th colSpan={5} className="px-7 py-4 font-black text-center text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] bg-emerald-500/5">Rendimiento Actual 2026</th>
                </tr>
                <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-white/10">
                  <th className="px-4 py-3 font-black text-slate-400 text-right border-r border-slate-200 dark:border-white/5">Users</th>
                  <th className="px-4 py-3 font-black text-slate-400 text-right border-r border-slate-200 dark:border-white/5">Time</th>
                  <th className="px-4 py-3 font-black text-slate-400 text-right border-r border-slate-200 dark:border-white/5">Org</th>
                  <th className="px-4 py-3 font-black text-slate-400 text-right border-r border-slate-200 dark:border-white/5">Dir</th>
                  <th className="px-4 py-3 font-black text-slate-400 text-right border-r border-slate-200 dark:border-white/5">Ref</th>
                  
                  <th className="px-4 py-3 font-black text-emerald-600/50 text-right border-r border-slate-200 dark:border-white/5 bg-emerald-500/5">Users</th>
                  <th className="px-4 py-3 font-black text-emerald-600/50 text-right border-r border-slate-200 dark:border-white/5 bg-emerald-500/5">Time</th>
                  <th className="px-4 py-3 font-black text-emerald-600/50 text-right border-r border-slate-200 dark:border-white/5 bg-emerald-500/5">Org</th>
                  <th className="px-4 py-3 font-black text-emerald-600/50 text-right border-r border-slate-200 dark:border-white/5 bg-emerald-500/5">Dir</th>
                  <th className="px-4 py-3 font-black text-emerald-600/50 text-right bg-emerald-500/5">Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {loading ? (
                  Array(10).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={12} className="px-7 py-7"><div className="h-5 bg-slate-100 dark:bg-slate-800 rounded-full w-full"></div></td>
                    </tr>
                  ))
                ) : filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group ${selectedIds.includes(item.id) ? 'bg-indigo-50/50 dark:bg-indigo-500/10' : ''}`}
                    >
                      <td className="px-7 py-5">
                        <button 
                          onClick={() => toggleSelection(item.id)}
                          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${selectedIds.includes(item.id) ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'border-slate-300 dark:border-white/10 bg-white dark:bg-transparent'}`}
                        >
                          {selectedIds.includes(item.id) && <Check className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="px-7 py-5 border-r border-slate-200 dark:border-white/5 sticky left-0 z-10 bg-inherit group-hover:bg-slate-50 dark:group-hover:bg-slate-800/80 transition-colors shadow-[4px_0_10px_rgba(0,0,0,0.02)]">
                        <div className="flex flex-col">
                          <span className="font-black text-slate-900 dark:text-white truncate max-w-[350px] text-xs mb-0.5">{item.hostname}</span>
                          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest opacity-80">{item.propertyName}</span>
                        </div>
                      </td>
                      
                      <td className="px-4 py-5 text-right font-mono text-slate-500 border-r border-slate-200 dark:border-white/5">{item.y2025.users.toLocaleString()}</td>
                      <td className="px-4 py-5 text-right font-mono text-slate-500 border-r border-slate-200 dark:border-white/5">{item.y2025.avgDurationFormatted}</td>
                      <td className="px-4 py-5 text-right font-mono text-slate-500 border-r border-slate-200 dark:border-white/5">{item.y2025.organic.toLocaleString()}</td>
                      <td className="px-4 py-5 text-right font-mono text-slate-500 border-r border-slate-200 dark:border-white/5">{item.y2025.direct.toLocaleString()}</td>
                      <td className="px-4 py-5 text-right font-mono text-slate-500 border-r border-slate-200 dark:border-white/5">{item.y2025.referral.toLocaleString()}</td>
                      
                      <td className="px-4 py-5 text-right font-mono font-black text-emerald-600 dark:text-emerald-400 border-r border-slate-200 dark:border-white/5 bg-emerald-500/5">{item.y2026.users.toLocaleString()}</td>
                      <td className="px-4 py-5 text-right font-mono font-black text-emerald-600 dark:text-emerald-400 border-r border-slate-200 dark:border-white/5 bg-emerald-500/5">{item.y2026.avgDurationFormatted}</td>
                      <td className="px-4 py-5 text-right font-mono font-black text-emerald-600 dark:text-emerald-400 border-r border-slate-200 dark:border-white/5 bg-emerald-500/5">{item.y2026.organic.toLocaleString()}</td>
                      <td className="px-4 py-5 text-right font-mono font-black text-emerald-600 dark:text-emerald-400 border-r border-slate-200 dark:border-white/5 bg-emerald-500/5">{item.y2026.direct.toLocaleString()}</td>
                      <td className="px-4 py-5 text-right font-mono font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">{item.y2026.referral.toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={12} className="px-7 py-40 text-center">
                       <div className="w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                         <Globe className="w-12 h-12 text-slate-300 dark:text-slate-700" />
                       </div>
                       <p className="text-slate-500 dark:text-slate-400 font-black text-lg">No hay datos filtrados para mostrar.</p>
                       <button onClick={() => { setSearchTerm(''); setHiddenHostnames([]); }} className="mt-4 text-indigo-500 text-sm font-black uppercase tracking-widest hover:underline">Restablecer filtros del ecosistema</button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Visibility Modal */}
      {showVisibilityModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-white dark:bg-slate-900 border border-white/10 w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
              <div className="p-10 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                 <div>
                   <h2 className="text-2xl font-black text-slate-900 dark:text-white">Filtrar Dominios</h2>
                   <p className="text-slate-500 text-xs font-bold mt-1">Habilita o desactiva la visibilidad de los sitios en la tabla.</p>
                 </div>
                 <button onClick={() => setShowVisibilityModal(false)} className="w-12 h-12 flex items-center justify-center bg-white dark:bg-white/5 rounded-2xl shadow-xl hover:scale-105 transition-all">
                    <X className="w-6 h-6" />
                 </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 space-y-2">
                 {data.map(item => (
                  <button 
                    key={item.id}
                    onClick={() => toggleVisibility(item.id)}
                    className={`w-full flex items-center justify-between p-5 rounded-[1.5rem] transition-all text-left group border ${hiddenHostnames.includes(item.id) ? 'bg-slate-50 dark:bg-white/5 border-transparent opacity-50' : 'bg-white dark:bg-slate-800/50 border-slate-100 dark:border-white/5 hover:border-indigo-500/50 hover:shadow-lg'}`}
                  >
                    <div className="truncate pr-4">
                      <p className={`text-sm font-black truncate ${hiddenHostnames.includes(item.id) ? 'line-through text-slate-400' : 'text-slate-900 dark:text-slate-200'}`}>{item.hostname}</p>
                      <p className="text-[10px] text-slate-400 font-bold truncate uppercase tracking-widest">{item.propertyName}</p>
                    </div>
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${hiddenHostnames.includes(item.id) ? 'bg-slate-200 dark:bg-white/10 text-slate-500' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'}`}>
                      {hiddenHostnames.includes(item.id) ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </div>
                  </button>
                ))}
              </div>
              <div className="p-8 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center">
                 <button onClick={() => { setHiddenHostnames([]); localStorage.removeItem('ecosystem_hidden_ids'); }} className="text-xs font-black text-indigo-500 hover:underline uppercase tracking-widest">Restablecer todos</button>
                 <button onClick={() => setShowVisibilityModal(false)} className="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/30 hover:bg-indigo-500 transition-all">Aplicar Cambios</button>
              </div>
           </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-2xl animate-in fade-in duration-400">
           <div className="bg-white dark:bg-slate-900 border border-white/10 w-full max-w-2xl rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
              <div className="p-10 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/30 dark:bg-white/5">
                 <div>
                   <h2 className="text-3xl font-black text-slate-900 dark:text-white">Gestión de Cuentas</h2>
                   <p className="text-slate-500 text-sm font-medium mt-1">Configura las propiedades de GA4 de todo tu ecosistema.</p>
                 </div>
                 <button onClick={() => setShowSettings(false)} className="w-14 h-14 flex items-center justify-center bg-white dark:bg-white/5 rounded-3xl shadow-xl hover:scale-105 transition-all">
                    <X className="w-6 h-6" />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-10">
                {/* Alert for permissions */}
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-[2.5rem] p-8 flex gap-6 text-amber-600 dark:text-amber-400">
                   <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center shrink-0">
                     <AlertTriangle className="w-6 h-6" />
                   </div>
                   <div className="text-xs">
                      <p className="font-black mb-1 text-base">Atención: Permisos en Google Analytics</p>
                      <p className="opacity-90 leading-relaxed text-sm">
                        Para que la data aparezca, la cuenta de servicio debe tener acceso en GA4 a cada propiedad:
                      </p>
                      <div className="mt-4 flex items-center gap-3">
                        <code className="flex-1 p-4 bg-white/10 rounded-2xl font-mono text-center text-amber-500 select-all border border-amber-500/30 text-sm font-bold truncate">
                           {import.meta.env.GA4_CLIENT_EMAIL || 'Configurando...'}
                        </code>
                      </div>
                      <p className="mt-3 opacity-90 italic">Asegúrate de que el ID de propiedad sea numérico y correcto.</p>
                   </div>
                </div>

                {/* Add Form */}
                <div className="bg-slate-50 dark:bg-white/5 p-8 rounded-[2.5rem] space-y-5 border border-slate-200 dark:border-white/5 shadow-inner">
                  <h4 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-500">Nueva Propiedad</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nombre Descriptivo</label>
                       <input 
                        type="text" 
                        placeholder="Ej. Panama, IESA Blog" 
                        value={newPropName}
                        onChange={e => setNewPropName(e.target.value)}
                        className="w-full px-5 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl outline-none text-sm font-bold shadow-sm focus:ring-2 focus:ring-indigo-500/30"
                      />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Property ID (Números)</label>
                       <input 
                        type="text" 
                        placeholder="ID de 9 dígitos" 
                        value={newPropId}
                        onChange={e => setNewPropId(e.target.value)}
                        className="w-full px-5 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl outline-none text-sm font-bold shadow-sm focus:ring-2 focus:ring-indigo-500/30"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={addProperty}
                    disabled={savingProp || !newPropName || !newPropId}
                    className="w-full flex items-center justify-center gap-3 py-5 bg-slate-900 dark:bg-indigo-600 hover:scale-[1.02] text-white font-black rounded-2xl transition-all disabled:opacity-50 shadow-2xl active:scale-95"
                  >
                    {savingProp ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />} 
                    Vincular Nueva Propiedad
                  </button>
                </div>

                {/* List */}
                <div className="space-y-5">
                  <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Propiedades Activas</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center justify-between p-6 bg-slate-100/50 dark:bg-white/5 rounded-3xl border border-dashed border-slate-300 dark:border-white/10">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center font-bold">1</div>
                        <div>
                          <p className="text-sm font-black">IESA Principal (Dashboard)</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Propiedad base vinculada por sistema</p>
                        </div>
                      </div>
                      <span className="px-4 py-1.5 bg-indigo-500 text-white text-[10px] font-black rounded-lg shadow-lg shadow-indigo-500/20">SISTEMA</span>
                    </div>
                    {dbProperties.map((prop, idx) => (
                      <div key={prop.id} className="flex items-center justify-between p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-3xl hover:shadow-xl transition-all group">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-slate-100 dark:bg-white/5 text-slate-400 group-hover:text-indigo-500 rounded-xl flex items-center justify-center font-bold transition-colors">{idx + 2}</div>
                           <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white">{prop.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">ID: {prop.property_id}</p>
                          </div>
                        </div>
                        <button onClick={() => deleteProperty(prop.id)} className="p-3 text-rose-500 bg-rose-500/5 hover:bg-rose-500 hover:text-white rounded-2xl transition-all shadow-sm">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                    {dbProperties.length === 0 && (
                      <div className="text-center py-16 border-2 border-dashed border-slate-100 dark:border-white/5 rounded-3xl">
                        <FileSpreadsheet className="w-10 h-10 mx-auto text-slate-200 dark:text-slate-800 mb-4" />
                        <p className="text-slate-400 font-bold text-sm italic">No hay cuentas adicionales. Agrega la primera arriba.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-10 border-t border-slate-100 dark:border-white/5 flex justify-end bg-slate-50/30 dark:bg-white/5">
                <button onClick={() => setShowSettings(false)} className="px-12 py-5 bg-indigo-600 text-white font-black rounded-3xl transition-all shadow-2xl shadow-indigo-600/30 hover:bg-indigo-500 active:scale-95">
                  Confirmar y Guardar
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
