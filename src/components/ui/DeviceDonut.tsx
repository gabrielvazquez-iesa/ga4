import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Monitor, Smartphone, Tablet } from 'lucide-react';

interface DeviceDonutProps {
  data: { device: string; users: number }[];
  loading?: boolean;
  onFilter: (device: string | null) => void;
  selectedDevice: string | null;
}

const COLORS: Record<string, string> = {
  'desktop': '#3b82f6',
  'mobile': '#8b5cf6',
  'tablet': '#ec4899',
};

const ICONS: Record<string, any> = {
  'desktop': Monitor,
  'mobile': Smartphone,
  'tablet': Tablet,
};

export const DeviceDonut: React.FC<DeviceDonutProps> = ({ data, loading, onFilter, selectedDevice }) => {
  const chartData = data.map(d => ({
    name: d.device.toLowerCase(),
    value: d.users,
  }));

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 p-6 rounded-2xl backdrop-blur-sm shadow-sm h-full flex flex-col">
      <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 px-2">Dispositivos</h3>
      
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-32 h-32 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="h-48 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  onClick={(entry) => onFilter(selectedDevice === entry.name ? null : entry.name)}
                  cursor="pointer"
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[entry.name] || '#94a3b8'} 
                      stroke="none"
                      opacity={selectedDevice && selectedDevice !== entry.name ? 0.3 : 1}
                      className="transition-all duration-300"
                    />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 border border-white/10 px-3 py-1.5 rounded-lg text-[10px] text-white font-bold">
                          {payload[0].name.toUpperCase()}: {payload[0].value.toLocaleString()}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">{total.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">Total</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-auto">
            {chartData.map((item) => {
              const Icon = ICONS[item.name] || Monitor;
              const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
              const isSelected = selectedDevice === item.name;

              return (
                <button
                  key={item.name}
                  onClick={() => onFilter(isSelected ? null : item.name)}
                  className={`flex flex-col items-center p-2 rounded-xl border transition-all duration-300 ${
                    isSelected 
                      ? 'bg-blue-600/10 border-blue-500 text-blue-500' 
                      : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4 mb-2" />
                  <span className="text-[10px] font-black uppercase mb-0.5">{item.name}</span>
                  <span className="text-xs font-bold dark:text-white">{percentage}%</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
