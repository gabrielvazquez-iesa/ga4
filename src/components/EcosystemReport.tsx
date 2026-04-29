import { useState, useEffect, useMemo } from 'react';
import { apiFetch } from '../lib/api-fetch';
import { supabase } from '../lib/supabase';
import { Copy, Globe, RefreshCw, AlertTriangle, ExternalLink, Search, Download, Calendar, Settings, X, Plus, Trash2, Eye, EyeOff, Check } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');
  
  // UI State
  const [showSettings, setShowSettings] = useState(false);
  const [dbProperties, setDbProperties] = useState<DBProperty[]>([]);
  const [newPropName, setNewPropName] = useState('');
  const [newPropId, setNewPropId] = useState('');
  const [savingProp, setSavingProp] = useState(false);
  
  // Filtering/Selection State
  const [hiddenHostnames, setHiddenHostnames] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    // Load hidden hostnames from localStorage
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
      setData(json.data || []);
      // Auto-select all visible items by default if none selected
      if (selectedIds.length === 0 && json.data) {
        // We'll let the user decide selection
      }
    } catch (e: any) {
      setError(e.message);
      toast.error("Error al cargar el ecosistema digital");
    } finally {
      setLoading(false);
    }
  };

  const fetchProperties = async () => {
    const { data } = await supabase.from('ga4_properties').select('*');
    setDbProperties(data || []);
  };

  const addProperty = async () => {
    if (!newPropName || !newPropId) return;
    setSavingProp(true);
    const { error } = await supabase.from('ga4_properties').insert({
      name: newPropName,
      property_id: newPropId
    });
    if (error) {
      toast.error("Error al guardar la propiedad");
    } else {
      toast.success("Propiedad añadida");
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

  // Memoized filtered data
  const filteredData = useMemo(() => {
    return data.filter(item => 
      !hiddenHostnames.includes(item.id) &&
      (item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.hostname.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [data, hiddenHostnames, searchTerm]);

  // Data for export (only selected items if any, otherwise all filtered)
  const exportData = selectedIds.length > 0 
    ? filteredData.filter(item => selectedIds.includes(item.id))
    : filteredData;

  const copyToClipboard = () => {
    if (exportData.length === 0) return;

    const header = "Sitio\tPropiedad\tUsuarios 25\tTiempo 25\tOrg 25\tDir 25\tRef 25\tUsuarios 26\tTiempo 26\tOrg 26\tDir 26\tRef 26";
    const rows = exportData.map(item => 
      `${item.hostname}\t${item.propertyName}\t${item.y2025.users}\t${item.y2025.avgDurationFormatted}\t${item.y2025.organic}\t${item.y2025.direct}\t${item.y2025.referral}\t${item.y2026.users}\t${item.y2026.avgDurationFormatted}\t${item.y2026.organic}\t${item.y2026.direct}\t${item.y2026.referral}`
    ).join('\n');

    const fullText = `${header}\n${rows}`;

    navigator.clipboard.writeText(fullText).then(() => {
      toast.success(`¡Datos de ${exportData.length} sitios copiados!`);
    }).catch(err => {
      console.error('Error al copiar', err);
      toast.error("Error al copiar los datos");
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 rounded-[2.5rem] p-10 text-white shadow-2xl border border-white/5">
        <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-8 items-start lg:items-center">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-500/20 rounded-[1.5rem] flex items-center justify-center backdrop-blur-xl border border-blue-500/30 shadow-inner">
              <Globe className="w-9 h-9 text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Ecosistema Digital</h1>
              <p className="text-slate-400 font-medium mt-1">Comparativa anual multicuenta y selección de sitios.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
             <button 
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-2xl transition-all"
            >
              <Settings className="w-4 h-4" /> Configurar Cuentas
            </button>
            <button 
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-600/30 active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Actualizar
            </button>
          </div>
        </div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px]" />
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-4 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por dominio o propiedad..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-2xl outline-none text-sm font-bold shadow-sm focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>

        <div className="lg:col-span-8 flex flex-col sm:flex-row justify-end items-center gap-3">
           <div className="flex bg-slate-100 dark:bg-slate-900/60 p-1.5 rounded-2xl border border-slate-200 dark:border-white/5 w-full sm:w-auto">
             <button 
               onClick={() => setSelectedIds([])}
               className={`flex-1 px-4 py-2 text-xs font-black rounded-xl transition-all ${selectedIds.length === 0 ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
             >
               Todos
             </button>
             <button 
               onClick={() => setSelectedIds(filteredData.map(i => i.id))}
               className="flex-1 px-4 py-2 text-xs font-black text-slate-500 rounded-xl hover:text-slate-900 dark:hover:text-white transition-all"
             >
               Seleccionar visibles
             </button>
           </div>
           
           <button 
            onClick={copyToClipboard}
            disabled={loading || exportData.length === 0}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-emerald-600/20 disabled:opacity-50 active:scale-95"
          >
            <Copy className="w-5 h-5" /> Copiar Selección ({exportData.length})
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Visibility Sidebar (Quick Filters) */}
        <div className="xl:col-span-1 space-y-4">
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm backdrop-blur-md">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center justify-between">
              Visibilidad de Sitios
              <span className="text-[10px] bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md">{data.length} total</span>
            </h3>
            <div className="max-h-[500px] overflow-y-auto space-y-1 pr-2">
              {data.map(item => (
                <button 
                  key={item.id}
                  onClick={() => toggleVisibility(item.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-left group ${hiddenHostnames.includes(item.id) ? 'opacity-40 grayscale' : 'hover:bg-slate-100 dark:hover:bg-white/5'}`}
                >
                  <div className="truncate pr-2">
                    <p className={`text-xs font-bold truncate ${hiddenHostnames.includes(item.id) ? 'line-through' : 'text-slate-900 dark:text-slate-200'}`}>{item.hostname}</p>
                    <p className="text-[10px] text-slate-400 font-medium truncate">{item.propertyName}</p>
                  </div>
                  {hiddenHostnames.includes(item.id) ? <EyeOff className="w-3.5 h-3.5 shrink-0" /> : <Eye className="w-3.5 h-3.5 shrink-0 text-indigo-500 opacity-0 group-hover:opacity-100" />}
                </button>
              ))}
            </div>
            {hiddenHostnames.length > 0 && (
              <button onClick={() => { setHiddenHostnames([]); localStorage.removeItem('ecosystem_hidden_ids'); }} className="w-full mt-4 text-[10px] font-black uppercase text-indigo-500 hover:underline">Mostrar todos</button>
            )}
          </div>
        </div>

        {/* Table View */}
        <div className="xl:col-span-3">
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 rounded-[2rem] overflow-hidden shadow-2xl backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-white/5">
                    <th rowSpan={2} className="w-12 px-6 py-4"></th>
                    <th rowSpan={2} className="px-6 py-4 font-black text-slate-900 dark:text-white uppercase tracking-wider border-r border-slate-200 dark:border-white/5 sticky left-0 z-20 bg-inherit">Sitio / Propiedad</th>
                    <th colSpan={5} className="px-6 py-3 font-black text-center text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border-r border-slate-200 dark:border-white/5 bg-indigo-500/5">Rendimiento 2025</th>
                    <th colSpan={5} className="px-6 py-3 font-black text-center text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-500/5">Rendimiento 2026 (Hoy)</th>
                  </tr>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-white/10">
                    <th className="px-4 py-3 font-bold text-slate-400 text-right border-r border-slate-200 dark:border-white/5">Users</th>
                    <th className="px-4 py-3 font-bold text-slate-400 text-right border-r border-slate-200 dark:border-white/5">Time</th>
                    <th className="px-4 py-3 font-bold text-slate-400 text-right border-r border-slate-200 dark:border-white/5">Org</th>
                    <th className="px-4 py-3 font-bold text-slate-400 text-right border-r border-slate-200 dark:border-white/5">Dir</th>
                    <th className="px-4 py-3 font-bold text-slate-400 text-right border-r border-slate-200 dark:border-white/5">Ref</th>
                    
                    <th className="px-4 py-3 font-bold text-emerald-600/60 text-right border-r border-slate-200 dark:border-white/5 bg-emerald-500/5">Users</th>
                    <th className="px-4 py-3 font-bold text-emerald-600/60 text-right border-r border-slate-200 dark:border-white/5 bg-emerald-500/5">Time</th>
                    <th className="px-4 py-3 font-bold text-emerald-600/60 text-right border-r border-slate-200 dark:border-white/5 bg-emerald-500/5">Org</th>
                    <th className="px-4 py-3 font-bold text-emerald-600/60 text-right border-r border-slate-200 dark:border-white/5 bg-emerald-500/5">Dir</th>
                    <th className="px-4 py-3 font-bold text-emerald-600/60 text-right bg-emerald-500/5">Ref</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {loading ? (
                    Array(8).fill(0).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={12} className="px-6 py-6"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full w-full"></div></td>
                      </tr>
                    ))
                  ) : filteredData.length > 0 ? (
                    filteredData.map((item) => (
                      <tr 
                        key={item.id} 
                        className={`hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group ${selectedIds.includes(item.id) ? 'bg-indigo-50/50 dark:bg-indigo-500/10' : ''}`}
                      >
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => toggleSelection(item.id)}
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${selectedIds.includes(item.id) ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 dark:border-white/10'}`}
                          >
                            {selectedIds.includes(item.id) && <Check className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                        <td className="px-6 py-4 border-r border-slate-200 dark:border-white/5 sticky left-0 z-10 bg-inherit group-hover:bg-slate-50 dark:group-hover:bg-slate-800/40 transition-colors">
                          <div className="flex flex-col">
                            <span className="font-black text-slate-900 dark:text-white truncate max-w-[200px] leading-tight mb-0.5">{item.hostname}</span>
                            <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-tighter opacity-70">{item.propertyName}</span>
                          </div>
                        </td>
                        
                        {/* 2025 Data */}
                        <td className="px-4 py-4 text-right font-mono text-slate-500 border-r border-slate-200 dark:border-white/5">{item.y2025.users.toLocaleString()}</td>
                        <td className="px-4 py-4 text-right font-mono text-slate-500 border-r border-slate-200 dark:border-white/5">{item.y2025.avgDurationFormatted}</td>
                        <td className="px-4 py-4 text-right font-mono text-slate-500 border-r border-slate-200 dark:border-white/5">{item.y2025.organic.toLocaleString()}</td>
                        <td className="px-4 py-4 text-right font-mono text-slate-500 border-r border-slate-200 dark:border-white/5">{item.y2025.direct.toLocaleString()}</td>
                        <td className="px-4 py-4 text-right font-mono text-slate-500 border-r border-slate-200 dark:border-white/5">{item.y2025.referral.toLocaleString()}</td>
                        
                        {/* 2026 Data */}
                        <td className="px-4 py-4 text-right font-mono font-black text-emerald-600 dark:text-emerald-400 border-r border-slate-200 dark:border-white/5 bg-emerald-500/5">{item.y2026.users.toLocaleString()}</td>
                        <td className="px-4 py-4 text-right font-mono font-black text-emerald-600 dark:text-emerald-400 border-r border-slate-200 dark:border-white/5 bg-emerald-500/5">{item.y2026.avgDurationFormatted}</td>
                        <td className="px-4 py-4 text-right font-mono font-black text-emerald-600 dark:text-emerald-400 border-r border-slate-200 dark:border-white/5 bg-emerald-500/5">{item.y2026.organic.toLocaleString()}</td>
                        <td className="px-4 py-4 text-right font-mono font-black text-emerald-600 dark:text-emerald-400 border-r border-slate-200 dark:border-white/5 bg-emerald-500/5">{item.y2026.direct.toLocaleString()}</td>
                        <td className="px-4 py-4 text-right font-mono font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">{item.y2026.referral.toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={12} className="px-6 py-32 text-center">
                         <Globe className="w-16 h-16 mx-auto text-slate-200 dark:text-slate-800 mb-4" />
                         <p className="text-slate-500 dark:text-slate-400 font-bold">No hay sitios visibles para mostrar.</p>
                         <button onClick={() => { setSearchTerm(''); setHiddenHostnames([]); }} className="mt-4 text-indigo-500 text-xs font-black underline">Restablecer filtros</button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-white dark:bg-slate-900 border border-white/10 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
                 <div>
                   <h2 className="text-2xl font-black text-slate-900 dark:text-white">Cuentas del Ecosistema</h2>
                   <p className="text-slate-500 text-xs mt-1">Añade otros IDs de GA4 para comparar Panama, Venezuela, etc.</p>
                 </div>
                 <button onClick={() => setShowSettings(false)} className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-white/5 rounded-2xl hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                    <X className="w-5 h-5" />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* Add Form */}
                <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-3xl space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-indigo-500">Añadir nueva propiedad</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      placeholder="Nombre (ej. Panama)" 
                      value={newPropName}
                      onChange={e => setNewPropName(e.target.value)}
                      className="px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl outline-none text-sm font-bold"
                    />
                    <input 
                      type="text" 
                      placeholder="Property ID (ej. 123456789)" 
                      value={newPropId}
                      onChange={e => setNewPropId(e.target.value)}
                      className="px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl outline-none text-sm font-bold"
                    />
                  </div>
                  <button 
                    onClick={addProperty}
                    disabled={savingProp || !newPropName || !newPropId}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl transition-all disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" /> Registrar Propiedad
                  </button>
                </div>

                {/* List */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Propiedades Registradas</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-dashed border-slate-300 dark:border-white/10">
                      <div>
                        <p className="text-sm font-black">IESA Principal (Variable .env)</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Propiedad base configurada en el servidor</p>
                      </div>
                      <span className="px-3 py-1 bg-indigo-500/10 text-indigo-500 text-[10px] font-black rounded-lg">FIJO</span>
                    </div>
                    {dbProperties.map(prop => (
                      <div key={prop.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl">
                        <div>
                          <p className="text-sm font-black">{prop.name}</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-tighter">ID: {prop.property_id}</p>
                        </div>
                        <button onClick={() => deleteProperty(prop.id)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {dbProperties.length === 0 && (
                      <p className="text-center py-8 text-slate-400 italic text-xs">No hay propiedades adicionales configuradas.</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-8 border-t border-slate-100 dark:border-white/5 flex justify-end">
                <button onClick={() => setShowSettings(false)} className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl transition-all">
                  Cerrar y Actualizar
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
