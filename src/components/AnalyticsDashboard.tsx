import { useState, useEffect, useMemo } from 'react';
import { apiFetch } from '../lib/api-fetch';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line } from 'recharts';
import { Eye, Users, MousePointerClick, Clock, ArrowUpRight, ArrowDownRight, RefreshCw, BarChart2, TrendingUp, Calendar, Download, ChevronDown, BookOpen, GraduationCap, X } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import MoMModule from './MoMModule';
import EngagementModule from './EngagementModule';
import PerformanceModule from './PerformanceModule';
import ContentListModule from './ContentListModule';

const RANGES = [
  { label: '7 días', days: 7 },
  { label: '30 días', days: 30 },
  { label: '90 días', days: 90 },
  { label: 'Este año', days: 365 },
];

export default function AnalyticsDashboard({ filterPath = '', mainTitle = 'Tráfico y Audiencia (GA4)' }: { filterPath?: string; mainTitle?: string }) {
  const [range, setRange] = useState(RANGES[1]);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async (days: number) => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/ga4?days=${days}${filterPath ? `&pathFilter=${filterPath}` : ''}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      
      const formattedData = (json.data || []).map((row: any) => {
        const d = new Date(row.date);
        return {
          ...row,
          label: d.toLocaleDateString('es-VE', { month: 'short', day: 'numeric' })
        };
      });
      setData(formattedData);
    } catch (error: any) {
      toast.error(error.message || 'Error al obtener métricas de GA4');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(range.days);
  }, [range, filterPath]);


  const totals = useMemo(() => {
    if (!data.length) return { views: 0, users: 0, sessions: 0, bounceRate: 0, avgSession: 0 };
    return {
      views: data.reduce((s, d) => s + d.views, 0),
      users: data.reduce((s, d) => s + d.users, 0),
      sessions: data.reduce((s, d) => s + d.sessions, 0),
      bounceRate: data.reduce((s, d) => s + d.bounceRate, 0) / data.length,
      avgSession: data.reduce((s, d) => s + d.avgSession, 0) / data.length,
    };
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-slate-900/95 border border-white/10 px-4 py-3 rounded-xl shadow-xl text-xs z-50">
        <p className="text-slate-400 font-semibold mb-2">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.color }} className="font-bold">
            {p.name}: {p.name.includes('Tasa') || p.name.includes('Bounce') ? p.value.toFixed(2) + '%' : p.name.includes('Tiempo') ? Math.floor(p.value) + 's' : p.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  };

  const kpis = [
    { label: 'Páginas Vistas', value: totals.views.toLocaleString(), icon: Eye, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Usuarios Activos', value: totals.users.toLocaleString(), icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
    { label: 'Sesiones Totales', value: totals.sessions.toLocaleString(), icon: BarChart2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Tasa de Rebote', value: (totals.bounceRate * 100).toFixed(1) + '%', icon: MousePointerClick, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
    { label: 'Tiempo Medio (s)', value: Math.floor(totals.avgSession) + 's', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { label: 'Eventos / Usuario', value: totals.users ? ((totals.views + totals.sessions) / totals.users).toFixed(1) : '0', icon: TrendingUp, color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
  ];

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + Object.keys(data[0] || {}).join(",") + "\n"
      + data.map(row => Object.values(row).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ga4_report_${range.days}_days.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Toaster position="top-right" theme="dark" />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
          <div className="inline-flex gap-1 p-1.5 bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-2xl backdrop-blur-sm shadow-sm transition-all duration-300 min-w-max">
            <a href="/analytics" className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${!filterPath ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/5'}`}>
              <BarChart2 className="w-4 h-4" />
              Resumen General
            </a>
            <a href="/analytics/blog" className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${filterPath === '/iesa-al-dia' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/5'}`}>
              <BookOpen className="w-4 h-4" />
              Blog (IESA al Día)
            </a>
            <a href="/analytics/courses" className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${filterPath === '/cursos-y-programas' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/5'}`}>
              <GraduationCap className="w-4 h-4" />
              Cursos y Programas
            </a>
          </div>
        </div>
      </div>

      {!filterPath && (
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 rounded-3xl p-8 text-white shadow-2xl transition-all duration-500">
          <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6 items-start md:items-center">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <BarChart2 className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight">{mainTitle}</h1>
              </div>
              <p className="text-blue-100/80">Estadísticas en tiempo real obtenidas mediante la API oficial de Google Analytics 4.</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={handleExport} disabled={data.length === 0} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-colors border border-white/10 disabled:opacity-50">
                <Download className="w-4 h-4" /> Exportar CSV
              </button>
              <button onClick={() => fetchData(range.days)} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-700 font-bold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg disabled:opacity-50">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Actualizar
              </button>
            </div>
          </div>
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        </div>
      )}

      {filterPath && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/80 dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-6 rounded-3xl shadow-sm backdrop-blur-sm gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{mainTitle}</h1>
            <p className="text-sm text-slate-500">Listado detallado de comportamiento por página.</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button onClick={() => fetchData(range.days)} disabled={loading} className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg active:scale-95 disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Actualizar
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider mr-2">Período:</span>
        {RANGES.map(r => (
          <button
            key={r.label}
            onClick={() => setRange(r)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
              range.label === r.label
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20'
                : 'bg-white/80 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-blue-500/50'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {!filterPath && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {kpis.map(kpi => (
            <div key={kpi.label} className={`bg-white/80 dark:bg-slate-900/60 border ${kpi.bg} rounded-2xl p-5 backdrop-blur-sm shadow-sm relative overflow-hidden group transition-all duration-300 hover:shadow-md`}>
              <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity ${kpi.bg.split(' ')[0]}`} />
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-3">
                  <div className={`w-10 h-10 rounded-xl ${kpi.bg.split(' ')[0]} flex items-center justify-center`}>
                    <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                  </div>
                </div>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tighter">
                  {loading ? <span className="animate-pulse bg-slate-200 dark:bg-slate-800 text-transparent rounded">000000</span> : kpi.value}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{kpi.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {!filterPath && (
        <>
          {loading ? (
            <div className="h-64 flex items-center justify-center border border-slate-200 dark:border-white/10 rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">Vistas vs Usuarios</h3>
                <p className="text-xs text-slate-500 mb-4">Páginas vistas frente a la cantidad de usuarios activos</p>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="colViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} minTickGap={20} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} width={50} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="views" name="Vistas" stroke="#3b82f6" fill="url(#colViews)" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                    <Area type="monotone" dataKey="users" name="Usuarios" stroke="#8b5cf6" fill="url(#colUsers)" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">Sesiones vs Tasa de Rebote</h3>
                <p className="text-xs text-slate-500 mb-4">Cantidad de sesiones y el porcentaje de abandono</p>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} minTickGap={20} />
                    <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} width={40} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} width={40} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Line yAxisId="left" type="monotone" dataKey="sessions" name="Sesiones" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                    <Line yAxisId="right" type="step" dataKey="bounceRate" name="Tasa de Rebote (%)" stroke="#f43f5e" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}

      {filterPath ? (
        <div className="pt-6 mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-8">
          <ContentListModule days={range.days} filterPath={filterPath} />
        </div>
      ) : (
        <div className="pt-6 border-t border-slate-200 dark:border-white/10 mt-8 space-y-6">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Métricas Avanzadas
          </h2>
          
          <MoMModule days={range.days} filterPath={filterPath} />
          
          <div className="flex flex-col gap-8">
            <EngagementModule days={range.days} filterPath={filterPath} />
            <PerformanceModule days={range.days} filterPath={filterPath} />
          </div>
        </div>
      )}
    </div>
  );
}
