import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, MousePointerClick, Clock, ArrowUpRight, ArrowDownRight, Eye, Download, X, RefreshCw } from 'lucide-react';
import { useEffect } from 'react';

const mockData = {
  day: [
    { name: '00:00', views: 120, users: 80 },
    { name: '04:00', views: 80, users: 40 },
    { name: '08:00', views: 450, users: 300 },
    { name: '12:00', views: 800, users: 600 },
    { name: '16:00', views: 950, users: 700 },
    { name: '20:00', views: 600, users: 450 },
    { name: '23:59', views: 200, users: 150 },
  ],
  week: [
    { name: 'Lun', views: 4000, users: 2400 },
    { name: 'Mar', views: 3000, users: 1398 },
    { name: 'Mié', views: 2000, users: 9800 },
    { name: 'Jue', views: 2780, users: 3908 },
    { name: 'Vie', views: 1890, users: 4800 },
    { name: 'Sáb', views: 2390, users: 3800 },
    { name: 'Dom', views: 3490, users: 4300 },
  ],
  month: [
    { name: 'Semana 1', views: 14000, users: 8400 },
    { name: 'Semana 2', views: 23000, users: 11980 },
    { name: 'Semana 3', views: 12000, users: 9800 },
    { name: 'Semana 4', views: 27800, users: 13908 },
  ]
};

const kpiData = {
  day: { views: 3200, users: 2320, engagement: '1m 45s', bounce: '42%' },
  week: { views: 19550, users: 30006, engagement: '1m 20s', bounce: '48%' },
  month: { views: 76800, users: 44088, engagement: '1m 55s', bounce: '45%' },
};

export default function DashboardVisual() {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('month');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(true);

  const data = mockData[timeRange];
  const kpis = kpiData[timeRange];

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowBanner(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 p-4 rounded-xl shadow-2xl">
          <p className="font-bold text-slate-900 dark:text-white mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-600 dark:text-slate-300 text-sm">{entry.name === 'views' ? 'Páginas Vistas' : 'Usuarios'}</span>
              <span className="text-slate-900 dark:text-white font-bold ml-auto">{entry.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* PWA Banner */}
      {deferredPrompt && showBanner && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 backdrop-blur-md border border-white/20 p-5 rounded-3xl flex flex-col md:flex-row items-center justify-between text-white shadow-2xl animate-in slide-in-from-top-4 duration-500 group gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <p className="font-extrabold text-lg leading-tight uppercase tracking-tight">GA4Dash en tu Escritorio</p>
              <p className="text-sm text-blue-100/80 font-medium">Instala la aplicación nativa para un acceso instantáneo a tus reportes.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              onClick={handleInstall}
              className="flex-1 md:flex-none px-8 py-3 bg-white text-blue-700 font-black rounded-xl hover:bg-blue-50 transition-all active:scale-95 shadow-xl shadow-blue-900/20 uppercase text-xs tracking-widest"
            >
              Instalar Ahora
            </button>
            <button 
              onClick={() => setShowBanner(false)}
              className="p-3 hover:bg-white/10 rounded-xl transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/80 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-white/5 backdrop-blur-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Resumen de Tráfico</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Comportamiento global de la audiencia del portal web IESA.</p>
        </div>
        
        <div className="flex bg-white dark:bg-slate-950/80 p-1 rounded-xl border border-slate-200 dark:border-white/10">
          {(['day', 'week', 'month'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                timeRange === range 
                  ? 'bg-blue-600 shadow-lg shadow-blue-500/20 text-white' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              {range === 'day' ? 'Hoy' : range === 'week' ? 'Esta Semana' : 'Este Mes'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 p-6 rounded-2xl backdrop-blur-sm shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl transition-opacity opacity-0 group-hover:opacity-100"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
              <Eye className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1 text-green-400 bg-green-500/10 px-2 py-1 rounded text-xs font-bold">
              <ArrowUpRight className="w-3 h-3" /> 12.5%
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Páginas Vistas</p>
          <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{kpis.views.toLocaleString()}</h3>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 p-6 rounded-2xl backdrop-blur-sm shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl transition-opacity opacity-0 group-hover:opacity-100"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Users className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1 text-green-400 bg-green-500/10 px-2 py-1 rounded text-xs font-bold">
              <ArrowUpRight className="w-3 h-3" /> 8.2%
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Usuarios Totales</p>
          <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{kpis.users.toLocaleString()}</h3>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 p-6 rounded-2xl backdrop-blur-sm shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl transition-opacity opacity-0 group-hover:opacity-100"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Tiempo Promedio</p>
          <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{kpis.engagement}</h3>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 p-6 rounded-2xl backdrop-blur-sm shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl transition-opacity opacity-0 group-hover:opacity-100"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400">
              <MousePointerClick className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1 text-red-400 bg-red-500/10 px-2 py-1 rounded text-xs font-bold">
              <ArrowDownRight className="w-3 h-3" /> 2.1%
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Tasa de Rebote</p>
          <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{kpis.bounce}</h3>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 p-6 md:p-8 rounded-2xl backdrop-blur-sm shadow-xl h-[450px]">
        <div className="mb-6 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Tráfico vs Usuarios</h3>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span> Páginas Vistas</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></span> Usuarios</div>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height="85%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
            <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} dy={10} axisLine={false} tickLine={false} />
            <YAxis stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} dx={-10} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" activeDot={{ r: 8, strokeWidth: 0 }} />
            <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" activeDot={{ r: 8, strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
