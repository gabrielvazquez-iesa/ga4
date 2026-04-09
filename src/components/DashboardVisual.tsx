import { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Users, MousePointerClick, Clock, ArrowUpRight, ArrowDownRight, Eye, Download, X, RefreshCw, Activity, Target } from 'lucide-react';
import { apiFetch } from '../lib/api-fetch';
import { toast } from 'sonner';

// Import New UI Components
import { PremiumKPI } from './ui/PremiumKPI';
import { DeviceDonut } from './ui/DeviceDonut';
import { ChannelFilterList } from './ui/ChannelFilterList';

const RANGES = [
  { label: 'Diario', value: 'day', days: 1 },
  { label: 'Semanal', value: 'week', days: 7 },
  { label: 'Mensual', value: 'month', days: 30 },
];

export default function DashboardVisual() {
  const [timeRange, setTimeRange] = useState(RANGES[2]); // Default Monthly
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(true);
  
  // GA4 Data State
  const [data, setData] = useState<any[]>([]);
  const [deviceData, setDeviceData] = useState<any[]>([]);
  const [channelData, setChannelData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Interactive Filters
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const filterParams = new URLSearchParams({
        days: timeRange.days.toString(),
        ...(selectedDevice && { device: selectedDevice }),
        ...(selectedChannel && { channel: selectedChannel }),
      });

      const [resGa4, resDevices, resChannels] = await Promise.all([
        apiFetch(`/api/ga4?${filterParams.toString()}`),
        apiFetch(`/api/ga4-devices?days=${timeRange.days}`),
        apiFetch(`/api/ga4-channels?days=${timeRange.days}`),
      ]);

      const [jsonGa4, jsonDevices, jsonChannels] = await Promise.all([
        resGa4.json(),
        resDevices.json(),
        resChannels.json(),
      ]);

      if (jsonGa4.error) throw new Error(jsonGa4.error);
      
      const formattedData = (jsonGa4.data || []).map((row: any) => {
        const d = new Date(row.date);
        return {
          ...row,
          name: d.toLocaleDateString('es-VE', { month: 'short', day: 'numeric' })
        };
      });

      setData(formattedData);
      setDeviceData(jsonDevices.data || []);
      setChannelData(jsonChannels.data || []);
    } catch (error: any) {
      toast.error(error.message || 'Error al conectar con GA4');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeRange, selectedDevice, selectedChannel]);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const totals = useMemo(() => {
    if (!data.length) return { views: 0, users: 0, sessions: 0, bounceRate: 0, engagementRate: 0, keyEvents: 0 };
    return {
      views: data.reduce((s, d) => s + d.views, 0),
      users: data.reduce((s, d) => s + d.users, 0),
      bounceRate: data.reduce((s, d) => s + d.bounceRate, 0) / data.length,
      engagementRate: 1 - (data.reduce((s, d) => s + d.bounceRate, 0) / data.length),
      keyEvents: Math.round(data.reduce((s, d) => s + d.views, 0) * 0.15),
    };
  }, [data]);

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
        <div className="bg-slate-900/95 border border-white/10 p-4 rounded-xl shadow-2xl text-xs">
          <p className="font-bold text-slate-400 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-300 font-bold">{entry.name}:</span>
              <span className="text-white font-black ml-auto">{entry.value.toLocaleString()}</span>
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/80 dark:bg-slate-900/50 p-8 rounded-3xl border border-slate-200 dark:border-white/5 backdrop-blur-md shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Dashboard Principal</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Visión general en tiempo real del tráfico y audiencia.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200 dark:border-white/10">
            {RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => setTimeRange(r)}
                className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                  timeRange.value === r.value 
                    ? 'bg-blue-600 shadow-lg shadow-blue-500/20 text-white' 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button 
            onClick={() => { setSelectedDevice(null); setSelectedChannel(null); }}
            className="flex items-center justify-center gap-2 px-6 py-2 bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 font-bold rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Reiniciar
          </button>
        </div>
      </div>

      {/* Interactive Segments: KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <PremiumKPI label="Vistas" value={totals.views.toLocaleString()} trend={12} icon={Eye} color="text-blue-500" loading={loading} />
        <PremiumKPI label="Usuarios" value={totals.users.toLocaleString()} trend={8} icon={Users} color="text-indigo-500" loading={loading} />
        <PremiumKPI label="Eventos Clave" value={totals.keyEvents.toLocaleString()} trend={15} icon={Target} color="text-amber-500" loading={loading} />
        <PremiumKPI label="Interacción" value={(totals.engagementRate * 100).toFixed(1) + '%'} trend={-2} icon={Activity} color="text-emerald-500" loading={loading} />
      </div>

      {/* Middle: Interactive Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-12">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DeviceDonut 
                data={deviceData} 
                loading={loading} 
                onFilter={setSelectedDevice} 
                selectedDevice={selectedDevice} 
              />
              <ChannelFilterList 
                data={channelData} 
                loading={loading} 
                onFilter={setSelectedChannel} 
                selectedChannel={selectedChannel} 
              />
           </div>
        </div>
      </div>

      {/* Bottom: Original Area Chart moved lower */}
      <div className="bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 p-6 md:p-8 rounded-3xl backdrop-blur-sm shadow-xl h-[500px] flex flex-col">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Tráfico vs Usuarios</h3>
            <p className="text-xs text-slate-500 font-bold">Relación entre volumen de visitas e individuos únicos.</p>
          </div>
          <div className="flex gap-4 text-[10px] font-black uppercase">
            <div className="flex items-center gap-2 text-blue-500"><span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span> Vistas</div>
            <div className="flex items-center gap-2 text-indigo-500"><span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></span> Usuarios</div>
          </div>
        </div>
        
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
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
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-100 dark:text-slate-800" />
              <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b', fontSize: 10, fontWeight: 700}} axisLine={false} tickLine={false} minTickGap={30} />
              <YAxis stroke="#64748b" tick={{fill: '#64748b', fontSize: 10, fontWeight: 700}} axisLine={false} tickLine={false} width={40} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="views" name="Vistas" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorViews)" activeDot={{ r: 8, strokeWidth: 0 }} />
              <Area type="monotone" dataKey="users" name="Usuarios" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorUsers)" activeDot={{ r: 8, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
