import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api-fetch';
import { Copy, Check, Download, Calendar, RefreshCw, AlertTriangle } from 'lucide-react';
import { nativeToast as toast } from './NativeToaster';

const ROWS = [
  'Páginas vistas',
  'Tasa de rebote',
  'Interacción del usuario (ms)',
  'Sesiones',
  'Usuarios nuevos',
  'Usuarios activos',
  'Scroll (usuarios)',
  'Tiempo promedio de sesión',
  'Conversiones',
  'Sesiones por usuario',
  // Placeholders for manual or Search Console metrics not yet integrated
  'CTR',
  'Impresiones totales',
  'Usuarios Directos',
  'Búsquedas orgánicas',
  'Búsquedas pagas',
  'Tráfico orgánico por RRSS',
  'Referidos por enlaces externos'
];

export default function ReporteJefa() {
  const [selectedMonth, setSelectedMonth] = useState('mar-26');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ga4Data, setGa4Data] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGA4();
  }, [selectedMonth]);

  const fetchGA4 = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/ga4');
      const result = await res.json();
      
      if (result.success && result.data?.rows?.[0]?.metricValues) {
        const values = result.data.rows[0].metricValues.map((mv: any) => {
           if (mv.value.includes('.')) return parseFloat(mv.value).toFixed(2);
           return mv.value;
        });
        setGa4Data(values);
      } else {
        const msg = result.error || 'No se pudieron cargar los datos reales de GA4.';
        setError(msg);
        console.error('GA4 API Error:', msg);
      }
    } catch (err: any) {
      setError('Error de conexión con la API de GA4. Verifique la consola del servidor.');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentData = ga4Data.length > 0 ? ga4Data : Array(ROWS.length).fill('-');

  const handleCopy = () => {
    const textToCopy = currentData.join('\n');
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      toast.success('¡Copiado con éxito!');
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="space-y-6">


      <div className="bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 p-6 rounded-2xl flex flex-col md:flex-row justify-between md:items-center gap-6 backdrop-blur-sm shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">Reporte Gerencial (Real-Time)</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Métricas reales obtenidas directamente de Google Analytics 4.</p>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={fetchGA4}
            className="p-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-500 hover:text-blue-500 transition-colors"
            title="Refrescar datos"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <button 
            onClick={handleCopy}
            className={`flex items-center gap-2 px-6 py-2.5 font-bold rounded-lg transition-all shadow-lg ${
              copied ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20 text-white'
            }`}
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            {copied ? '¡Copiado!' : 'Copiar para Excel'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 p-4 rounded-xl flex gap-3 text-sm italic">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p>{error} Mostrando valores de referencia.</p>
        </div>
      )}

      <div className="bg-white/95 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm relative min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-10 transition-all">
             <div className="flex flex-col items-center gap-4">
               <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
               <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">Sincronizando GA4...</p>
             </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-4 border-b border-slate-200 dark:border-white/5 font-semibold w-2/3">Métrica</th>
                <th className="p-4 border-b border-slate-200 dark:border-white/5 font-semibold text-right bg-blue-500/5 text-blue-600 dark:text-blue-400">Valor Real (30d)</th>
                <th className="p-4 border-b border-slate-200 dark:border-white/5 font-semibold text-center w-24">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5 text-sm">
              {ROWS.map((rowName, index) => (
                <tr key={index} className="hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group">
                  <td className="p-4 font-medium text-slate-600 dark:text-slate-300 group-hover:text-blue-400 transition-colors border-r border-slate-200 dark:border-white/5">
                    {rowName}
                  </td>
                  <td className="p-4 text-right font-mono font-bold text-slate-900 dark:text-white tracking-wide border-r border-slate-200 dark:border-white/5 bg-slate-50/10 dark:bg-slate-950/20">
                    {currentData[index] || '-'}
                  </td>
                  <td className="p-4 text-center">
                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-4 text-blue-400 text-sm">
        <Download className="w-5 h-5 shrink-0" />
        <p>
          <strong>Sincronización Automática:</strong> Los datos se actualizan en tiempo real desde la API de GA4 para la propiedad configurada. 
          Use el botón Copiar para exportar directamente a su reporte de gestión en Google Sheets.
        </p>
      </div>
    </div>
  );
}
