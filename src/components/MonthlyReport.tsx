import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Copy, Calendar, ShieldCheck, AlertTriangle, CheckCircle2, Download, FileSpreadsheet, RefreshCw, X, Search } from 'lucide-react';
import { nativeToast as toast } from './NativeToaster';

export default function MonthlyReport() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Por defecto, seleccionar el mes anterior (que es cuando típicamente se reporta)
  const today = new Date();
  today.setMonth(today.getMonth() - 1);
  const defaultMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  
  const [month, setMonth] = useState(defaultMonth);

  useEffect(() => { checkAdmin(); }, []);
  useEffect(() => { if (isAdmin) fetchData(); }, [month, isAdmin]);

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const email = session?.user?.email || '';
    const admin = ['admin@iesa.edu.ve', 'gabriel.vazquez@iesa.edu.ve'].includes(email.toLowerCase());
    setIsAdmin(admin);
    if (!admin) setLoading(false);
  };

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg('');
    setData(null);
    try {
      const res = await apiFetch(`/api/monthly-report?month=${month}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      
      setData(json.data);
      if (json.data.gscError) {
         toast.warning("Error de Search Console: " + json.data.gscError);
      }
    } catch (e: any) {
      setErrorMsg(e.message);
      toast.error("Error al cargar el reporte mensual");
    } finally {
      setLoading(false);
    }
  };

  const downloadExcel = async () => {
    if (!data) return;

    const [XLSX, { saveAs }] = await Promise.all([
      import('xlsx'),
      import('file-saver')
    ]);

    const wsData = [
      ["REPORTE GERENCIAL MENSUAL - IESA"],
      ["Período:", month],
      ["Generado el:", new Date().toLocaleDateString()],
      [],
      ["MÉTRICA", "VALOR"],
      ["Páginas vistas", data.vistas],
      ["Tasa de rebote", data.rebote],
      ["User engagement", data.userEngagement],
      ["Sesión iniciada", data.sesiones],
      ["Usuarios nuevos", data.nuevosUsers],
      ["Usuarios recurrentes", data.recurrentes],
      ["Scroll", data.scroll],
      ["Tiempo promedio (min)", data.formattedTime],
      [],
      ["SEARCH CONSOLE"],
      ["Clics", data.clics],
      ["CTR", data.ctr],
      ["Impresiones", data.impresiones],
      [],
      ["CANALES"],
      ["Usuarios Directos", data.direct],
      ["Búsquedas Orgánicas", data.organic],
      ["Búsquedas Pagas", data.paid],
      ["Tráfico Orgánico Redes Sociales", data.social],
      ["Referidos externos", data.referral]
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = [{ wch: 40 }, { wch: 20 }];

    XLSX.utils.book_append_sheet(wb, ws, "Reporte Mensual");
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(blob, `Reporte_Gerencial_${month}_IESA.xlsx`);
    toast.success("Excel descargado correctamente");
  };

  const copyToClipboard = () => {
    if (!data) return;
    
    // Create an HTML table for formatted Excel pasting
    const htmlContent = `
      <table border="1" style="border-collapse: collapse; font-family: Arial, sans-serif; font-size: 11px;">
        <tr style="background-color: #1e293b; color: white; font-weight: bold;">
          <th style="padding: 8px;">Métrica</th>
          <th style="padding: 8px;">Valor (${month})</th>
        </tr>
        <tr><td style="padding: 5px;">Páginas vistas</td><td style="padding: 5px; text-align: right;">${data.vistas.toLocaleString()}</td></tr>
        <tr><td style="padding: 5px;">Tasa de rebote</td><td style="padding: 5px; text-align: right;">${data.rebote}</td></tr>
        <tr><td style="padding: 5px;">User engagement</td><td style="padding: 5px; text-align: right;">${data.userEngagement.toLocaleString()}</td></tr>
        <tr><td style="padding: 5px;">Sesión iniciada</td><td style="padding: 5px; text-align: right;">${data.sesiones.toLocaleString()}</td></tr>
        <tr><td style="padding: 5px;">Usuarios nuevos</td><td style="padding: 5px; text-align: right;">${data.nuevosUsers.toLocaleString()}</td></tr>
        <tr><td style="padding: 5px;">Usuarios recurrentes</td><td style="padding: 5px; text-align: right;">${data.recurrentes.toLocaleString()}</td></tr>
        <tr><td style="padding: 5px;">Scroll</td><td style="padding: 5px; text-align: right;">${data.scroll.toLocaleString()}</td></tr>
        <tr><td style="padding: 5px;">Tiempo promedio (min)</td><td style="padding: 5px; text-align: right;">${data.formattedTime}</td></tr>
        <tr style="background-color: #f8fafc; font-weight: bold;"><td colspan="2" style="padding: 5px;">Search Console</td></tr>
        <tr><td style="padding: 5px;">Clics</td><td style="padding: 5px; text-align: right;">${data.clics.toLocaleString()}</td></tr>
        <tr><td style="padding: 5px;">CTR</td><td style="padding: 5px; text-align: right;">${data.ctr}</td></tr>
        <tr><td style="padding: 5px;">Impresiones</td><td style="padding: 5px; text-align: right;">${data.impresiones.toLocaleString()}</td></tr>
        <tr style="background-color: #f8fafc; font-weight: bold;"><td colspan="2" style="padding: 5px;">Canales de Tráfico</td></tr>
        <tr><td style="padding: 5px;">Directo</td><td style="padding: 5px; text-align: right;">${data.direct.toLocaleString()}</td></tr>
        <tr><td style="padding: 5px;">Orgánico</td><td style="padding: 5px; text-align: right;">${data.organic.toLocaleString()}</td></tr>
        <tr><td style="padding: 5px;">Pago</td><td style="padding: 5px; text-align: right;">${data.paid.toLocaleString()}</td></tr>
        <tr><td style="padding: 5px;">Social</td><td style="padding: 5px; text-align: right;">${data.social.toLocaleString()}</td></tr>
        <tr><td style="padding: 5px;">Referidos</td><td style="padding: 5px; text-align: right;">${data.referral.toLocaleString()}</td></tr>
      </table>
    `;

    // Plain text fallback (the original order required by their Excel)
    const textData = [
      data.vistas, data.rebote, data.userEngagement, data.sesiones, data.nuevosUsers,
      data.recurrentes, data.scroll, data.formattedTime, data.clics, data.ctr,
      data.impresiones, data.direct, data.organic, data.paid, data.social, data.referral
    ].join('\n');
    
    const blobHtml = new Blob([htmlContent], { type: 'text/html' });
    const blobText = new Blob([textData], { type: 'text/plain' });
    
    const clipboardData = [new ClipboardItem({ 'text/html': blobHtml, 'text/plain': blobText })];

    navigator.clipboard.write(clipboardData).then(() => {
        toast.success("¡Copiado con formato! Listo para pegar en tu Excel.");
    }).catch(err => {
        console.error('Error al copiar', err);
        navigator.clipboard.writeText(textData).then(() => toast.success("Copiado (Solo valores)"));
    });
  }

  if (!loading && !isAdmin) {
    return (
      <div className="flex justify-center py-20">
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-8 rounded-2xl max-w-md text-center">
          <ShieldCheck className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold mb-2">Acceso Restringido</h2>
          <p>El Reporte Gerencial Mensual es exclusivo para administradores del sistema.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white/50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 rounded-[3rem] p-10 shadow-xl backdrop-blur-md">
        <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-8 items-start lg:items-center">
          <div className="flex items-center gap-7">
            <div className="w-16 h-16 bg-blue-600/10 dark:bg-blue-500/20 rounded-[1.5rem] flex items-center justify-center border border-blue-600/20 shadow-inner">
              <FileSpreadsheet className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-none mb-2">Reporte Gerencial</h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                 <Calendar className="w-4 h-4" /> Integración GA4 + Search Console
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
             <div className="flex items-center gap-4 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-6 py-3 rounded-2xl transition-all shadow-sm">
                <Calendar className="w-5 h-5 text-blue-500" />
                <input 
                  type="month" 
                  value={month} 
                  onChange={e => setMonth(e.target.value)} 
                  className="bg-transparent text-lg font-black outline-none text-slate-900 dark:text-white cursor-pointer"
                />
             </div>
             <button 
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} /> Actualizar
            </button>
          </div>
        </div>
        <div className="absolute -top-32 -right-32 w-[30rem] h-[30rem] bg-blue-600/5 rounded-full blur-[120px]" />
      </div>

      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-6 rounded-[2rem] flex gap-4 items-center">
          <AlertTriangle className="w-6 h-6 shrink-0" />
          <p className="font-black">{errorMsg}</p>
        </div>
      )}

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Table/Data Column */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-md">
            <div className="p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
               <div>
                 <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Métricas Consolidadas</h3>
                 <p className="text-slate-500 text-xs font-bold mt-0.5">Valores listos para exportar al Master Excel.</p>
               </div>
               <div className="flex gap-2">
                 <button 
                  onClick={copyToClipboard}
                  disabled={!data || loading}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                  title="Copiar para Excel con formato"
                >
                  <Copy className="w-4 h-4" /> Copiar
                </button>
                <button 
                  onClick={downloadExcel}
                  disabled={!data || loading}
                  className="flex items-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                  title="Descargar archivo Excel (.xlsx)"
                >
                  <Download className="w-5 h-5" />
                </button>
               </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-950/80 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <th className="px-8 py-4 border-b border-slate-200 dark:border-white/5">Métrica del Sistema</th>
                    <th className="px-8 py-4 border-b border-slate-200 dark:border-white/5 text-right">Valor Obtenido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {loading ? (
                    Array(16).fill(0).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-8 py-5"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full w-1/2"></div></td>
                        <td className="px-8 py-5 text-right"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full w-20 ml-auto"></div></td>
                      </tr>
                    ))
                  ) : data ? (
                    <>
                      {/* GA4 Core Metrics */}
                      <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                        <td className="px-8 py-4 font-bold text-slate-600 dark:text-slate-400 group-hover:text-indigo-500 transition-colors">1. Páginas vistas</td>
                        <td className="px-8 py-4 text-right font-mono font-black text-slate-900 dark:text-white">{data.vistas.toLocaleString()}</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                        <td className="px-8 py-4 font-bold text-slate-600 dark:text-slate-400 group-hover:text-indigo-500 transition-colors">2. Tasa de rebote</td>
                        <td className="px-8 py-4 text-right font-mono font-black text-slate-900 dark:text-white">{data.rebote}</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                        <td className="px-8 py-4 font-bold text-slate-600 dark:text-slate-400 group-hover:text-indigo-500 transition-colors">3. User engagement</td>
                        <td className="px-8 py-4 text-right font-mono font-black text-slate-900 dark:text-white">{data.userEngagement.toLocaleString()}</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                        <td className="px-8 py-4 font-bold text-slate-600 dark:text-slate-400 group-hover:text-indigo-500 transition-colors">4. Sesión iniciada</td>
                        <td className="px-8 py-4 text-right font-mono font-black text-slate-900 dark:text-white">{data.sesiones.toLocaleString()}</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                        <td className="px-8 py-4 font-bold text-slate-600 dark:text-slate-400 group-hover:text-indigo-500 transition-colors">5. Usuarios nuevos</td>
                        <td className="px-8 py-4 text-right font-mono font-black text-slate-900 dark:text-white">{data.nuevosUsers.toLocaleString()}</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                        <td className="px-8 py-4 font-bold text-slate-600 dark:text-slate-400 group-hover:text-indigo-500 transition-colors">6. Usuarios recurrentes</td>
                        <td className="px-8 py-4 text-right font-mono font-black text-slate-900 dark:text-white">{data.recurrentes.toLocaleString()}</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                        <td className="px-8 py-4 font-bold text-slate-600 dark:text-slate-400 group-hover:text-indigo-500 transition-colors">7. Scroll</td>
                        <td className="px-8 py-4 text-right font-mono font-black text-slate-900 dark:text-white">{data.scroll.toLocaleString()}</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                        <td className="px-8 py-4 font-bold text-slate-600 dark:text-slate-400 group-hover:text-indigo-500 transition-colors">8. Tiempo promedio (min)</td>
                        <td className="px-8 py-4 text-right font-mono font-black text-slate-900 dark:text-white">{data.formattedTime}</td>
                      </tr>

                      {/* GSC Section Header */}
                      <tr className="bg-slate-100/50 dark:bg-white/5">
                        <td colSpan={2} className="px-8 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Search Console (Rendimiento)</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                        <td className="px-8 py-4 font-bold text-slate-600 dark:text-slate-400 group-hover:text-emerald-500 transition-colors">9. Clics (GSC)</td>
                        <td className="px-8 py-4 text-right font-mono font-black text-emerald-600 dark:text-emerald-400">{data.clics.toLocaleString()}</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                        <td className="px-8 py-4 font-bold text-slate-600 dark:text-slate-400 group-hover:text-emerald-500 transition-colors">10. CTR (GSC)</td>
                        <td className="px-8 py-4 text-right font-mono font-black text-emerald-600 dark:text-emerald-400">{data.ctr}</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                        <td className="px-8 py-4 font-bold text-slate-600 dark:text-slate-400 group-hover:text-emerald-500 transition-colors">11. Impresiones (GSC)</td>
                        <td className="px-8 py-4 text-right font-mono font-black text-emerald-600 dark:text-emerald-400">{data.impresiones.toLocaleString()}</td>
                      </tr>

                      {/* Channels Section Header */}
                      <tr className="bg-slate-100/50 dark:bg-white/5">
                        <td colSpan={2} className="px-8 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500">Distribución de Tráfico</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                        <td className="px-8 py-4 font-bold text-slate-600 dark:text-slate-400 group-hover:text-indigo-500 transition-colors">12. Usuarios Directos</td>
                        <td className="px-8 py-4 text-right font-mono font-black text-slate-900 dark:text-white">{data.direct.toLocaleString()}</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                        <td className="px-8 py-4 font-bold text-slate-600 dark:text-slate-400 group-hover:text-indigo-500 transition-colors">13. Búsquedas Orgánicas</td>
                        <td className="px-8 py-4 text-right font-mono font-black text-slate-900 dark:text-white">{data.organic.toLocaleString()}</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                        <td className="px-8 py-4 font-bold text-slate-600 dark:text-slate-400 group-hover:text-indigo-500 transition-colors">14. Búsquedas Pagas</td>
                        <td className="px-8 py-4 text-right font-mono font-black text-slate-900 dark:text-white">{data.paid.toLocaleString()}</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                        <td className="px-8 py-4 font-bold text-slate-600 dark:text-slate-400 group-hover:text-indigo-500 transition-colors">15. Tráfico Orgánico Redes Sociales</td>
                        <td className="px-8 py-4 text-right font-mono font-black text-slate-900 dark:text-white">{data.social.toLocaleString()}</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                        <td className="px-8 py-4 font-bold text-slate-600 dark:text-slate-400 group-hover:text-indigo-500 transition-colors">16. Referidos externos</td>
                        <td className="px-8 py-4 text-right font-mono font-black text-slate-900 dark:text-white">{data.referral.toLocaleString()}</td>
                      </tr>
                    </>
                  ) : (
                    <tr>
                      <td colSpan={2} className="px-8 py-40 text-center">
                         <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                           <Search className="w-10 h-10 text-slate-300" />
                         </div>
                         <p className="text-slate-500 font-black">Selecciona un mes para cargar los datos.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Help/Info Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-600/20 relative overflow-hidden group">
            <div className="relative z-10">
              <ShieldCheck className="w-12 h-12 mb-6 text-indigo-200" />
              <h4 className="text-2xl font-black mb-4">Exportación Segura</h4>
              <p className="text-indigo-100 text-sm font-medium leading-relaxed mb-6">
                El sistema formatea automáticamente los datos para que coincidan con la estructura del Excel Gerencial. 
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs font-bold bg-white/10 p-3 rounded-xl border border-white/10">
                   <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Conversión de números automática
                </div>
                <div className="flex items-center gap-3 text-xs font-bold bg-white/10 p-3 rounded-xl border border-white/10">
                   <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Formato de tiempo (Min/Seg)
                </div>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
          </div>

          {data?.gscError && (
             <div className="bg-amber-500/10 border border-amber-500/20 rounded-[2rem] p-6 flex gap-4 text-amber-600 dark:text-amber-400">
               <AlertTriangle className="w-6 h-6 shrink-0" />
               <div className="text-xs">
                  <p className="font-black uppercase tracking-widest mb-1">Search Console</p>
                  <p className="font-medium opacity-90">{data.gscError}</p>
               </div>
             </div>
          )}
        </div>

      </div>
    </div>
  );
}
