import React from 'react';
import { Search, Globe, Instagram, Facebook, Share2, Mail, ExternalLink, Hash } from 'lucide-react';

interface Channel {
  channel: string;
  users: number;
  sessions: number;
}

interface ChannelFilterListProps {
  data: Channel[];
  loading?: boolean;
  onFilter: (channel: string | null) => void;
  selectedChannel: string | null;
}

const CHANNEL_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  'Organic Search': { icon: Search, color: 'text-blue-500 bg-blue-500/10', label: 'Buscadores' },
  'Direct': { icon: Globe, color: 'text-slate-500 bg-slate-500/10', label: 'Directo' },
  'Social': { icon: Share2, color: 'text-pink-500 bg-pink-500/10', label: 'Redes Sociales' },
  'Organic Social': { icon: Instagram, color: 'text-purple-500 bg-purple-500/10', label: 'Instagram/FB' },
  'Referral': { icon: ExternalLink, color: 'text-emerald-500 bg-emerald-500/10', label: 'Referidos' },
  'Email': { icon: Mail, color: 'text-amber-500 bg-amber-500/10', label: 'Correo' },
  'Paid Search': { icon: Hash, color: 'text-indigo-500 bg-indigo-500/10', label: 'Campañas' },
};

export const ChannelFilterList: React.FC<ChannelFilterListProps> = ({ data, loading, onFilter, selectedChannel }) => {
  const totalUsers = data.reduce((sum, c) => sum + c.users, 0);

  return (
    <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 p-6 rounded-2xl backdrop-blur-sm shadow-sm h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 px-2">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Canales</h3>
        <button 
          onClick={handleExport} 
          className="text-[10px] font-bold text-blue-500 hover:text-blue-600 uppercase tracking-wider bg-blue-500/5 px-2 py-1 rounded"
        >
          Export Data
        </button>
      </div>

      <div className="space-y-3 overflow-y-auto max-h-[350px] pr-2 scrollbar-hide">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 dark:bg-white/5 rounded-2xl animate-pulse" />
          ))
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-slate-500 italic text-sm">Sin datos de canales</div>
        ) : (
          data.sort((a, b) => b.users - a.users).map((item) => {
            const config = CHANNEL_CONFIG[item.channel] || { icon: Share2, color: 'text-slate-400 bg-slate-100', label: item.channel };
            const Icon = config.icon;
            const percentage = totalUsers > 0 ? (item.users / totalUsers * 100).toFixed(0) : '0';
            const isSelected = selectedChannel === item.channel;

            return (
              <button
                key={item.channel}
                onClick={() => onFilter(isSelected ? null : item.channel)}
                className={`w-full flex items-center gap-4 p-3 rounded-2xl border transition-all duration-300 group ${
                  isSelected 
                    ? 'bg-blue-600/10 border-blue-500/50 shadow-md translate-x-1' 
                    : 'bg-white/50 dark:bg-white/5 border-transparent hover:bg-white dark:hover:bg-white/10 hover:translate-x-1'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${config.color} shadow-inner group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-xs font-black text-slate-900 dark:text-white truncate">{config.label}</p>
                  <p className="text-[10px] text-slate-500 font-bold">{item.users.toLocaleString()} Visitantes</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black dark:text-white">{percentage}%</p>
                  <div className="w-16 bg-slate-200 dark:bg-white/10 h-1 rounded-full mt-1.5 overflow-hidden">
                    <div className={`h-full rounded-full ${config.color.split(' ')[0]}`} style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

function handleExport() {
  // Simple console log for now, can be expanded to CSV
  console.log("Exporting channel data...");
}
