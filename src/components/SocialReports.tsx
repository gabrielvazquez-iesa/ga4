import { useState, useMemo } from 'react';
import { Instagram, TrendingUp, Users, Heart, MessageCircle, Share2, Eye, BarChart2, RefreshCw, Download, ChevronDown } from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

// ─── Date helpers ───────────────────────────────────────────
const MONTHS_ES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

function generateData(days: number) {
  const data = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const label = days <= 7
      ? d.toLocaleDateString('es-VE', { weekday: 'short' })
      : days <= 31
      ? `${d.getDate()} ${MONTHS_ES[d.getMonth()]}`
      : MONTHS_ES[d.getMonth()];
    data.push({
      label,
      alcance: Math.floor(Math.random() * 12000 + 3000),
      impresiones: Math.floor(Math.random() * 25000 + 8000),
      interacciones: Math.floor(Math.random() * 1500 + 200),
      nuevosSeguidores: Math.floor(Math.random() * 80 + 10),
      clics: Math.floor(Math.random() * 600 + 100),
    });
  }
  // Deduplicate (monthly view)
  if (days > 31) {
    const seen = new Map<string, any>();
    data.forEach(d => {
      if (!seen.has(d.label)) seen.set(d.label, { ...d });
      else {
        const e = seen.get(d.label);
        e.alcance += d.alcance;
        e.impresiones += d.impresiones;
        e.interacciones += d.interacciones;
        e.nuevosSeguidores += d.nuevosSeguidores;
        e.clics += d.clics;
      }
    });
    return Array.from(seen.values());
  }
  return data;
}

const RANGES = [
  { label: 'Hoy',       days: 1 },
  { label: '7 días',    days: 7 },
  { label: '30 días',   days: 30 },
  { label: '90 días',   days: 90 },
  { label: 'Este año',  days: 365 },
];

const CUSTOM_TOOLTIP = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900/95 border border-white/10 px-4 py-3 rounded-xl shadow-xl text-xs">
      <p className="text-slate-400 font-semibold mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-bold">
          {p.name}: {p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

export default function SocialReports() {
  const [range, setRange] = useState(RANGES[2]);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const data = useMemo(() => generateData(range.days), [range]);

  const totals = useMemo(() => ({
    alcance: data.reduce((s, d) => s + d.alcance, 0),
    impresiones: data.reduce((s, d) => s + d.impresiones, 0),
    interacciones: data.reduce((s, d) => s + d.interacciones, 0),
    nuevosSeguidores: data.reduce((s, d) => s + d.nuevosSeguidores, 0),
    clics: data.reduce((s, d) => s + d.clics, 0),
  }), [data]);

  const kpis = [
    { label: 'Alcance Total',       value: totals.alcance.toLocaleString(),         icon: Eye,           color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20',    trend: '+12.4%' },
    { label: 'Impresiones',          value: totals.impresiones.toLocaleString(),     icon: BarChart2,      color: 'text-violet-400',  bg: 'bg-violet-500/10 border-violet-500/20', trend: '+8.7%'  },
    { label: 'Interacciones',        value: totals.interacciones.toLocaleString(),   icon: Heart,          color: 'text-rose-400',    bg: 'bg-rose-500/10 border-rose-500/20',     trend: '+21.3%' },
    { label: 'Nuevos Seguidores',    value: totals.nuevosSeguidores.toLocaleString(),icon: Users,          color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20',trend: '+5.2%' },
    { label: 'Clics en Enlace',      value: totals.clics.toLocaleString(),           icon: Share2,         color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20',   trend: '+18.9%' },
    { label: 'Tasa Interacción',     value: (totals.interacciones / Math.max(totals.alcance, 1) * 100).toFixed(2) + '%', icon: TrendingUp, color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20', trend: '+0.8%' },
  ];

  const platforms = [
    { name: 'Instagram', followers: 12840, posts: 48, engagement: '4.2%', color: '#e1306c' },
    { name: 'Facebook',  followers: 8320,  posts: 32, engagement: '2.8%', color: '#1877f2' },
    { name: 'Twitter/X', followers: 3210,  posts: 64, engagement: '1.9%', color: '#1da1f2' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-pink-600 via-rose-600 to-orange-600 rounded-3xl p-8 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6 items-start md:items-center">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Instagram className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">Reportes de Redes Sociales</h1>
            </div>
            <p className="text-rose-100/80">Métricas de Facebook, Instagram y Twitter/X. Integración con Meta Ads API próximamente.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-colors border border-white/10">
              <Download className="w-4 h-4" /> Exportar
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white text-rose-700 font-bold rounded-xl hover:bg-rose-50 transition-colors shadow-lg">
              <RefreshCw className="w-4 h-4" /> Actualizar
            </button>
          </div>
        </div>
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      </div>

      {/* Range selector */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider mr-2">Período:</span>
        {RANGES.map(r => (
          <button
            key={r.label}
            onClick={() => { setRange(r); setShowCustom(false); }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
              range.label === r.label && !showCustom
                ? 'bg-rose-600 text-white border-rose-600 shadow-lg shadow-rose-500/20'
                : 'bg-white/80 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-rose-500/50'
            }`}
          >
            {r.label}
          </button>
        ))}
        <button
          onClick={() => setShowCustom(!showCustom)}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border flex items-center gap-2 ${
            showCustom
              ? 'bg-rose-600 text-white border-rose-600'
              : 'bg-white/80 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300'
          }`}
        >
          Personalizado <ChevronDown className={`w-3 h-3 transition-transform ${showCustom ? 'rotate-180' : ''}`} />
        </button>
        {showCustom && (
          <div className="flex gap-2 items-center">
            <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)}
              className="bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm dark:text-white [color-scheme:dark] outline-none focus:ring-2 focus:ring-rose-500/50" />
            <span className="text-slate-400 text-sm">→</span>
            <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)}
              className="bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm dark:text-white [color-scheme:dark] outline-none focus:ring-2 focus:ring-rose-500/50" />
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className={`bg-white/80 dark:bg-slate-900/60 border ${kpi.bg} rounded-2xl p-5 backdrop-blur-sm shadow-sm`}>
            <div className="flex justify-between items-start mb-3">
              <div className={`w-10 h-10 rounded-xl ${kpi.bg.split(' ')[0]} flex items-center justify-center`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">{kpi.trend}</span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tighter">{kpi.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reach & Impressions */}
        <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
          <h3 className="font-bold text-slate-900 dark:text-white mb-1">Alcance e Impresiones</h3>
          <p className="text-xs text-slate-500 mb-4">Personas alcanzadas y veces que se mostró el contenido</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colAlcance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colImpresiones" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CUSTOM_TOOLTIP />} />
              <Area type="monotone" dataKey="alcance" name="Alcance" stroke="#3b82f6" fill="url(#colAlcance)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="impresiones" name="Impresiones" stroke="#8b5cf6" fill="url(#colImpresiones)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Engagement */}
        <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
          <h3 className="font-bold text-slate-900 dark:text-white mb-1">Interacciones y Seguidores</h3>
          <p className="text-xs text-slate-500 mb-4">Likes, comentarios, shares y nuevos seguidores</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CUSTOM_TOOLTIP />} />
              <Bar dataKey="interacciones" name="Interacciones" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="nuevosSeguidores" name="Nuevos Seguidores" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Clicks line chart */}
      <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
        <h3 className="font-bold text-slate-900 dark:text-white mb-1">Clics en Enlace</h3>
        <p className="text-xs text-slate-500 mb-4">Personas que hicieron clic en los enlaces del perfil y publicaciones</p>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CUSTOM_TOOLTIP />} />
            <Line type="monotone" dataKey="clics" name="Clics" stroke="#f59e0b" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Platform summary */}
      <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10">
          <h3 className="font-bold text-slate-900 dark:text-white">Resumen por Plataforma</h3>
          <p className="text-xs text-slate-500">Datos simulados — integración con Meta API pendiente</p>
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950/50 text-xs text-slate-400 uppercase tracking-wider">
              <th className="px-6 py-3">Plataforma</th>
              <th className="px-6 py-3 text-right">Seguidores</th>
              <th className="px-6 py-3 text-right">Publicaciones</th>
              <th className="px-6 py-3 text-right">Engagement</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-white/5">
            {platforms.map(p => (
              <tr key={p.name} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="font-semibold text-slate-900 dark:text-white">{p.name}</span>
                    <span className="text-xs text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">Simulado</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-mono text-slate-600 dark:text-slate-300">{p.followers.toLocaleString()}</td>
                <td className="px-6 py-4 text-right font-mono text-slate-600 dark:text-slate-300">{p.posts}</td>
                <td className="px-6 py-4 text-right font-bold text-emerald-500">{p.engagement}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Note banner */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3 text-amber-600 dark:text-amber-400 text-sm">
        <TrendingUp className="w-5 h-5 shrink-0" />
        <p>
          <strong>Datos simulados:</strong> Esta pantalla usa datos de demostración. 
          Para conectar con la API real de Meta (Facebook/Instagram), configure las credenciales en el archivo <code className="bg-amber-500/10 px-1 rounded">.env</code> con su <strong>META_ACCESS_TOKEN</strong> y <strong>META_PAGE_ID</strong>.
        </p>
      </div>
    </div>
  );
}
