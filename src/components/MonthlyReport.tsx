import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api-fetch';
import { supabase } from '../lib/supabase';
import { Copy, Calendar, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

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
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!data) return;
    
    // Exact order required by Excel
    const textData = [
      data.vistas,
      data.rebote,
      data.userEngagement,
      data.sesiones,
      data.nuevosUsers,
      data.recurrentes,
      data.scroll,
      data.formattedTime,
      data.clics,
      data.ctr,
      data.impresiones,
      data.direct,
      data.organic,
      data.paid,
      data.social,
      data.referral
    ].join('\n');
    
    navigator.clipboard.writeText(textData).then(() => {
        toast.success("¡Datos copiados! Presiona Ctrl+V en tu columna de Excel.");
    }).catch(err => {
        console.error('Error al copiar', err);
        toast.error("Hubo un error al copiar al portapapeles.");
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
    <div className="space-y-6">

      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/80 dark:bg-slate-900/60 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-white/10 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500/20 text-indigo-500 flex items-center justify-center rounded-xl border border-indigo-500/30">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Período de Reporte</label>
            <input 
              type="month" 
              value={month} 
              onChange={e => setMonth(e.target.value)} 
              className="bg-transparent text-lg font-bold outline-none text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <button 
          onClick={copyToClipboard}
          disabled={!data || loading}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-lg"
        >
          <Copy className="w-4 h-4" />
          Copiar Formato Excel
        </button>
      </div>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{errorMsg}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : data ? (
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-md animate-in fade-in duration-500">
          {data.gscError && (
            <div className="bg-red-500/10 text-red-500 text-sm p-4 border-b border-red-500/20 flex gap-2 items-center">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Aviso: Datos de Search Console (Clics, CTR, Impresiones) no disponibles. {data.gscError}
            </div>
          )}
          <table className="w-full text-left text-sm">
             <thead className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-white/5">
                <tr>
                   <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-xs">Métrica Exacta</th>
                   <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-xs text-right">Valor Obtenido</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"><td className="px-6 py-3 font-medium">1. Páginas vistas</td><td className="px-6 py-3 text-right font-mono">{data.vistas.toLocaleString()}</td></tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"><td className="px-6 py-3 font-medium">2. Tasa de rebote</td><td className="px-6 py-3 text-right font-mono">{data.rebote}</td></tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"><td className="px-6 py-3 font-medium">3. User engagement</td><td className="px-6 py-3 text-right font-mono">{data.userEngagement.toLocaleString()}</td></tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"><td className="px-6 py-3 font-medium">4. Sesión iniciada</td><td className="px-6 py-3 text-right font-mono">{data.sesiones.toLocaleString()}</td></tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"><td className="px-6 py-3 font-medium">5. Usuarios nuevos</td><td className="px-6 py-3 text-right font-mono">{data.nuevosUsers.toLocaleString()}</td></tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"><td className="px-6 py-3 font-medium">6. Usuarios recurrentes</td><td className="px-6 py-3 text-right font-mono">{data.recurrentes.toLocaleString()}</td></tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"><td className="px-6 py-3 font-medium">7. Scroll</td><td className="px-6 py-3 text-right font-mono">{data.scroll.toLocaleString()}</td></tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"><td className="px-6 py-3 font-medium">8. Tiempo promedio (min)</td><td className="px-6 py-3 text-right font-mono">{data.formattedTime}</td></tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors bg-slate-50/50 dark:bg-white/5"><td className="px-6 py-3 font-medium">9. Clics (GSC)</td><td className="px-6 py-3 text-right font-mono">{data.clics.toLocaleString()}</td></tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors bg-slate-50/50 dark:bg-white/5"><td className="px-6 py-3 font-medium">10. CTR (GSC)</td><td className="px-6 py-3 text-right font-mono">{data.ctr}</td></tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors bg-slate-50/50 dark:bg-white/5"><td className="px-6 py-3 font-medium">11. Impresiones (GSC)</td><td className="px-6 py-3 text-right font-mono">{data.impresiones.toLocaleString()}</td></tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"><td className="px-6 py-3 font-medium">12. Usuarios Directos</td><td className="px-6 py-3 text-right font-mono">{data.direct.toLocaleString()}</td></tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"><td className="px-6 py-3 font-medium">13. Búsquedas Orgánicas</td><td className="px-6 py-3 text-right font-mono">{data.organic.toLocaleString()}</td></tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"><td className="px-6 py-3 font-medium">14. Búsquedas Pagas</td><td className="px-6 py-3 text-right font-mono">{data.paid.toLocaleString()}</td></tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"><td className="px-6 py-3 font-medium">15. Tráfico Orgánico Redes Sociales</td><td className="px-6 py-3 text-right font-mono">{data.social.toLocaleString()}</td></tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"><td className="px-6 py-3 font-medium">16. Referidos externos</td><td className="px-6 py-3 text-right font-mono">{data.referral.toLocaleString()}</td></tr>
             </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
