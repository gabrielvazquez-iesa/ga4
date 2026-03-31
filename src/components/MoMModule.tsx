import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, Activity, Users, Percent } from 'lucide-react';

export default function MoMModule({ days }: { days: number }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMoM = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/ga4-mom?days=${days}`);
        const json = await res.json();
        if (json.data) setData(json.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMoM();
  }, [days]);

  if (loading || !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-white/5 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-white/5"></div>
        ))}
      </div>
    );
  }

  const { current, previous } = data;

  // Function to calculate percentage difference
  const calcDiff = (curr: number, prev: number) => {
    if (!prev) return curr > 0 ? 100 : 0;
    return ((curr - prev) / prev) * 100;
  };

  const currentSessions = current.sessions || 0;
  const previousSessions = previous.sessions || 0;
  const sessionsDiff = calcDiff(currentSessions, previousSessions);

  const currentUsers = current.activeUsers || 0;
  const previousUsers = previous.activeUsers || 0;
  const usersDiff = calcDiff(currentUsers, previousUsers);

  const currentConv = current.conversionRate || 0;
  const previousConv = previous.conversionRate || 0;
  const convDiff = calcDiff(currentConv, previousConv);

  const kpis = [
    { label: 'Sesiones Totales', value: currentSessions, diff: sessionsDiff, icon: Activity, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Usuarios Activos', value: currentUsers, diff: usersDiff, icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
    { label: 'Tasa de Conversión', value: `${(currentConv * 100).toFixed(2)}%`, diff: convDiff, icon: Percent, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {kpis.map((kpi, i) => {
        const isPositive = kpi.diff >= 0;
        return (
          <div key={i} className={`bg-white/80 dark:bg-slate-900/60 border ${kpi.bg} rounded-2xl p-5 backdrop-blur-sm shadow-sm relative overflow-hidden group`}>
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity ${kpi.bg.split(' ')[0]}`} />
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-3">
                <div className={`w-10 h-10 rounded-xl ${kpi.bg.split(' ')[0]} flex items-center justify-center`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${isPositive ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}>
                  {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(kpi.diff).toFixed(1)}% vs anterior
                </div>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tighter">
                {typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{kpi.label} (vs {days}d prev)</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
