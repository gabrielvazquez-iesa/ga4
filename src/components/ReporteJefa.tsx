import { useState } from 'react';
import { Copy, Check, Download, Calendar } from 'lucide-react';
import { Toaster, toast } from 'sonner';

// The precise rows the user requested
const ROWS = [
  'Páginas vistas',
  'Tasa de rebote',
  'user engagement',
  'Sesión iniciada',
  'Usuarios nuevos',
  'Usuarios recurrentes',
  'Scroll',
  'Tiempo promedio (minutos)',
  'Clics',
  'CTR',
  'Impresiones totales',
  'Usuarios Directos',
  'Búsquedas orgánicas',
  'Búsquedas pagas',
  'Tráfico orgánico por RRSS',
  'Referidos por enlaces externos'
];

// Mock data structured by month matching the rows
const dataStore: Record<string, string[]> = {
  'ene-26': [
    '65.060', '51,97%', '42.956', '29.069', '20.020', '21.000', '9.626', '1 min 19 s', 
    '9.482', '6.1%', '154.594', '7.021', '11.172', '4', '2.166', '618'
  ],
  'feb-26': [
    '63.150', '53,76%', '41.221', '30.924', '21.143', '19.800', '10.042', '1 min 15 s', 
    '8.670', '8%', '108.976', '9.397', '11.337', '3', '2.162', '632'
  ],
  'mar-26': [
    '68.200', '49,15%', '45.100', '32.100', '22.000', '23.100', '11.200', '1 min 30 s', 
    '10.100', '7.2%', '160.000', '8.100', '12.400', '10', '2.500', '700'
  ]
};

export default function ReporteJefa() {
  const [selectedMonth, setSelectedMonth] = useState('mar-26');
  const [copied, setCopied] = useState(false);

  const months = Object.keys(dataStore);
  const currentData = dataStore[selectedMonth] || Array(16).fill('-');

  const handleCopy = () => {
    // Generates a tab-separated string that pastes vertically into Excel exactly on the 16 rows.
    // The format should be: Value \n Value \n Value...
    // In excel, a newline \n moves to the cell below, which matches the screenshot structure perfectly.
    const textToCopy = currentData.join('\n');
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      toast.success('¡Copiado con éxito! Listo para pegar en Google Sheets/Excel.');
      setTimeout(() => setCopied(false), 2500);
    }).catch(err => {
      console.error('Failed to copy', err);
      toast.error('Error al copiar al portapapeles');
    });
  };

  return (
    <div className="space-y-6">
      <Toaster theme="dark" position="top-right" />

      {/* Header controls */}
      <div className="bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 p-6 rounded-2xl flex flex-col md:flex-row justify-between md:items-center gap-6 backdrop-blur-sm shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Reporte Mensual del Desempeño Web</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Resumen consolidado listo para enviar a gerencia (GA4 + Search Console).</p>
        </div>

        <div className="flex gap-4">
          <div className="relative">
            <Calendar className="w-4 h-4 text-blue-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-white dark:bg-slate-950/80 border border-blue-500/30 rounded-lg text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer hover:bg-white dark:bg-slate-900"
            >
              {months.map(m => (
                <option key={m} value={m}>{m.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={handleCopy}
            className={`flex items-center gap-2 px-6 py-2.5 font-bold rounded-lg transition-all shadow-lg ${
              copied 
                ? 'bg-green-600 shadow-green-600/20 text-white' 
                : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20 text-white'
            }`}
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            {copied ? '¡Copiado!' : 'Copiar Columna'}
          </button>
        </div>
      </div>

      {/* The Table */}
      <div className="bg-white/95 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-4 border-b border-slate-200 dark:border-white/5 font-semibold w-2/3">Métrica de Desempeño</th>
                <th className="p-4 border-b border-slate-200 dark:border-white/5 font-semibold text-right bg-yellow-500/10 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400">{selectedMonth}</th>
                <th className="p-4 border-b border-slate-200 dark:border-white/5 font-semibold text-center w-24">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5 text-sm">
              {ROWS.map((rowName, index) => (
                <tr key={index} className="hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group">
                  <td className="p-4 font-medium text-slate-600 dark:text-slate-300 group-hover:text-blue-400 transition-colors border-r border-slate-200 dark:border-white/5">
                    {rowName}
                  </td>
                  <td className="p-4 text-right font-mono font-bold text-slate-900 dark:text-white tracking-wide border-r border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/30">
                    {currentData[index]}
                  </td>
                  <td className="p-4 text-center font-mono text-slate-500">
                    -
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-4 text-blue-400 text-sm">
        <div className="mt-0.5"><Download className="w-5 h-5" /></div>
        <p>
          <strong>Tip de productividad:</strong> Al presionar <em>"Copiar Columna"</em> se guardará la información en el formato exacto. 
          Solo debes ir a tu documento de Google Sheets, seleccionar la primera celda vacía de la columna del mes y hacer <code>Ctrl + V</code>. 
          Todas las celdas se pegarán perfectamente hacia abajo conformando tu reporte.
        </p>
      </div>

    </div>
  );
}
