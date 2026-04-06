import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api-fetch';
import { ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Gauge } from 'lucide-react';

export default function PerformanceModule({ days, filterPath }: { days: number; filterPath?: string }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerf = async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`/api/ga4-performance?days=${days}${filterPath ? `&pathFilter=${filterPath}` : ''}`);
        const json = await res.json();
        
        if (json.data) {
          // Format labels to DD/MM
          const formatted = json.data.map((d: any) => {
            const dateObj = new Date(d.date);
            return {
              ...d,
              label: dateObj.toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit' })
            };
          });
          setData(formatted);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPerf();
  }, [days]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-slate-900/95 border border-white/10 px-4 py-3 rounded-xl shadow-xl text-xs z-50">
        <p className="text-slate-400 font-semibold mb-2">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.color }} className="font-bold flex justify-between gap-4">
            <span>{p.name}:</span>
            <span>{p.name.includes('Carga') ? p.value.toFixed(2) + 's' : p.value.toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-sm flex flex-col h-full">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center border border-teal-500/30">
          <Gauge className="w-4 h-4 text-teal-400" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white leading-tight">Correlación de Rendimiento</h3>
          <p className="text-xs text-slate-500">Tráfico (Vistas) vs Métricas Técnicas</p>
        </div>
      </div>

      <div className="flex-1 w-full min-h-[250px]">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-white/5 animate-pulse">
            <span className="text-slate-400 text-sm">Cargando Rendimiento...</span>
          </div>
        ) : data.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">No hay datos disponibles.</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} minTickGap={20} />
              
              <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} width={40} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} width={40} />
              
              <Tooltip content={<CustomTooltip />} />
              
              {/* Traffic as bars overlayed behind lines */}
              <Bar yAxisId="left" dataKey="views" name="Vistas" fill="#3b82f6" opacity={0.3} radius={[4, 4, 0, 0]} />
              
              {/* Performance as intense line */}
              <Line yAxisId="right" type="monotone" dataKey="loadTime" name="Tiempo Carga LCP" stroke="#14b8a6" strokeWidth={3} dot={{ r: 3, fill: '#14b8a6', strokeWidth: 0 }} activeDot={{ r: 6 }} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
