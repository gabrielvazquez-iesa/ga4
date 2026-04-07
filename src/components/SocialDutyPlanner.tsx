import { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, Clock, User, Plus, Trash2, Edit2, ChevronLeft, ChevronRight, Bell, Shield } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { es } from 'date-fns/locale/es';
import { format, differenceInHours, isWeekend, getHours, addHours, startOfHour } from 'date-fns';
registerLocale('es', es);

// =============================================
// VENEZUELAN HOLIDAYS (static list, updatable)
// =============================================
const VE_HOLIDAYS: Record<string, string> = {
  '2026-01-01': 'Año Nuevo',
  '2026-02-16': 'Carnaval',
  '2026-02-17': 'Carnaval',
  '2026-04-02': 'Jueves Santo',
  '2026-04-03': 'Viernes Santo',
  '2026-04-19': 'Declaración de Independencia',
  '2026-05-01': 'Día del Trabajador',
  '2026-06-24': 'Batalla de Carabobo',
  '2026-07-05': 'Día de la Independencia',
  '2026-07-24': 'Natalicio de Simón Bolívar',
  '2026-10-12': 'Resistencia Indígena',
  '2026-12-24': 'Nochebuena',
  '2026-12-25': 'Navidad',
  '2026-12-31': 'Fin de Año',
  // 2025
  '2025-01-01': 'Año Nuevo',
  '2025-03-03': 'Carnaval',
  '2025-03-04': 'Carnaval',
  '2025-04-17': 'Jueves Santo',
  '2025-04-18': 'Viernes Santo',
  '2025-04-19': 'Declaración de Independencia',
  '2025-05-01': 'Día del Trabajador',
  '2025-06-24': 'Batalla de Carabobo',
  '2025-07-05': 'Independencia',
  '2025-07-24': 'Bolívar',
  '2025-10-12': 'Resistencia Indígena',
  '2025-12-24': 'Nochebuena',
  '2025-12-25': 'Navidad',
  '2025-12-31': 'Fin de Año',
};

// Color palette – 10 distinct colors for users
const USER_COLORS = [
  { bg: 'bg-blue-500',    dot: '#3b82f6', text: 'text-blue-500',   light: 'bg-blue-500/10' },
  { bg: 'bg-violet-500',  dot: '#8b5cf6', text: 'text-violet-500', light: 'bg-violet-500/10' },
  { bg: 'bg-rose-500',    dot: '#f43f5e', text: 'text-rose-500',   light: 'bg-rose-500/10' },
  { bg: 'bg-amber-500',   dot: '#f59e0b', text: 'text-amber-500',  light: 'bg-amber-500/10' },
  { bg: 'bg-emerald-500', dot: '#10b981', text: 'text-emerald-500',light: 'bg-emerald-500/10' },
  { bg: 'bg-sky-500',     dot: '#0ea5e9', text: 'text-sky-500',    light: 'bg-sky-500/10' },
  { bg: 'bg-orange-500',  dot: '#f97316', text: 'text-orange-500', light: 'bg-orange-500/10' },
  { bg: 'bg-pink-500',    dot: '#ec4899', text: 'text-pink-500',   light: 'bg-pink-500/10' },
  { bg: 'bg-teal-500',    dot: '#14b8a6', text: 'text-teal-500',   light: 'bg-teal-500/10' },
  { bg: 'bg-indigo-500',  dot: '#6366f1', text: 'text-indigo-500', light: 'bg-indigo-500/10' },
];

interface Shift {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  shift_type: 'day' | 'week' | 'weekend';
  notes: string;
  created_at: string;
  user_profiles?: { display_name: string; department: string };
}

interface UserProfile {
  user_id: string;
  display_name: string;
  department: string;
  custom_color?: string;
}

function toKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function SocialDutyPlanner() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [formData, setFormData] = useState<{
    user_id: string;
    start_date: string;
    end_date: string;
    shift_type: 'day' | 'week' | 'weekend';
    notes: string;
    tag: string;
  }>({
    user_id: '', start_date: '', end_date: '', shift_type: 'day', notes: '', tag: 'Redes Sociales'
  });

  // Precise duty calculation logic
  const dutyBreakdown = useMemo(() => {
    if (!formData.start_date || !formData.end_date) return { total: 0, normal: 0, extra: 0 };
    try {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      const total = Math.max(0, differenceInHours(end, start));
      
      if (formData.tag !== 'Eventos') return { total, normal: total, extra: 0 };

      let normal = 0;
      let extra = 0;
      let current = startOfHour(start);
      const limit = end;

      while (current < limit) {
        const h = getHours(current);
        const dayOff = isWeekend(current);
        
        // Regla: 8am a 5pm L-V (Normal), resto Extra
        if (!dayOff && h >= 8 && h < 17) {
          normal++;
        } else {
          extra++;
        }
        current = addHours(current, 1);
      }
      
      return { total, normal, extra };
    } catch { return { total: 0, normal: 0, extra: 0 }; }
  }, [formData.start_date, formData.end_date, formData.tag]);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    setCurrentUser(session?.user);

    const [{ data: shiftsData }, { data: usersData }] = await Promise.all([
      supabase.from('duty_shifts').select('*, user_profiles(display_name, department)').order('start_date', { ascending: true }),
      supabase.from('user_profiles')
        .select('user_id, display_name, department, custom_color')
        .eq('is_banned', false)
        .order('display_name'),
    ]);

    setShifts(shiftsData || []);
    setUsers(usersData || []);
    setLoading(false);
  };

  // Assign stable colors to users
  const userColorMap = useMemo(() => {
    const map: Record<string, any> = {};
    users.forEach((u, i) => { 
      if (u.custom_color) {
        map[u.user_id] = { customColorHex: u.custom_color };
      } else {
        map[u.user_id] = USER_COLORS[i % USER_COLORS.length];
      }
    });
    return map;
  }, [users]);

  // Build a map: date string → shifts that day
  const shiftsByDay = useMemo(() => {
    const map: Record<string, Shift[]> = {};
    shifts.forEach(shift => {
      const start = new Date(shift.start_date);
      const end = new Date(shift.end_date);
      const current = new Date(start);
      while (current <= end) {
        const key = toKey(current);
        if (!map[key]) map[key] = [];
        map[key].push(shift);
        current.setDate(current.getDate() + 1);
      }
    });
    return map;
  }, [shifts]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.user_id) { toast.error('Selecciona un responsable.'); return; }
      
      const { tag, notes, ...rest } = formData;
      const combinedNotes = `[${tag}] ${notes}`;
      const payload = { ...rest, notes: combinedNotes };

      if (editingShift) {
        const { error } = await supabase.from('duty_shifts').update(payload).eq('id', editingShift.id);
        if (error) throw error;
        await supabase.from('duty_audit_logs').insert({ shift_id: editingShift.id, user_id: currentUser?.id, action: 'update', new_value: payload });
        toast.success('Guardia actualizada.');
      } else {
        const { data, error } = await supabase.from('duty_shifts').insert([payload]).select().single();
        if (error) throw error;
        await supabase.from('duty_audit_logs').insert({ shift_id: data.id, user_id: currentUser?.id, action: 'create', new_value: payload });
        toast.success('Guardia programada.');
      }
      setShowModal(false);
      setEditingShift(null);
      fetchData();
    } catch (err: any) {
      toast.error('Error: ' + err.message);
    }
  };

  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('duty_shifts').delete().eq('id', id);
      if (error) throw error;
      
      await supabase.from('duty_audit_logs').insert({ user_id: currentUser?.id, action: 'delete' });
      toast.success('Guardia eliminada correctamente.');
      setShowDeleteConfirm(null);
      fetchData();
    } catch (err: any) {
      toast.error('Error al eliminar: ' + err.message);
    }
  };

  // Calendar generation
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = toKey(new Date());
  const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const DAYS_ES = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

  const goToMonth = (direction: 1 | -1) => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
    setSelectedDay(null);
  };

  // Active shift right now
  const nowStr = new Date().toISOString();
  const activeShift = shifts.find(s => s.start_date <= nowStr && s.end_date >= nowStr);

  const selectedShifts = selectedDay ? (shiftsByDay[selectedDay] || []) : [];

  if (loading) return <div className="p-8 text-center text-slate-500">Cargando planificador...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Toaster theme="dark" position="top-right" richColors />
      
      <style>{`
        .react-datepicker-wrapper { width: 100%; }
        .react-datepicker {
          font-family: inherit;
          background-color: #0f172a !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          border-radius: 1rem !important;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
          color: white !important;
        }
        .react-datepicker__header {
          background-color: #1e293b !important;
          border-bottom: 1px solid rgba(255,255,255,0.1) !important;
          border-top-left-radius: 1rem !important;
          border-top-right-radius: 1rem !important;
          padding-top: 1rem !important;
        }
        .react-datepicker__current-month, .react-datepicker__day-name, .react-datepicker-time__header {
          color: #94a3b8 !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
          font-size: 0.7rem !important;
          letter-spacing: 0.05em !important;
        }
        .react-datepicker__day {
          color: #cbd5e1 !important;
          border-radius: 0.5rem !important;
          transition: all 0.2s !important;
        }
        .react-datepicker__day:hover {
          background-color: rgba(59, 130, 246, 0.2) !important;
          color: #60a5fa !important;
        }
        .react-datepicker__day--selected {
          background-color: #2563eb !important;
          color: white !important;
          font-weight: bold !important;
        }
        .react-datepicker__day--today {
          border: 1px solid #2563eb !important;
          color: #2563eb !important;
          font-weight: bold !important;
        }
        .react-datepicker__time-container {
          border-left: 1px solid rgba(255,255,255,0.1) !important;
          background-color: #0f172a !important;
          width: 90px !important;
        }
        .react-datepicker__time-box { width: 90px !important; border-radius: 0 1rem 1rem 0 !important; }
        .react-datepicker__time-list { 
          background-color: #0f172a !important; 
          padding: 0 !important;
        }
        .react-datepicker__time-list-item {
          background-color: transparent !important;
          color: #94a3b8 !important;
          transition: all 0.2s !important;
          border-radius: 0 !important;
          padding: 10px 0 !important;
        }
        .react-datepicker__time-list-item:hover {
          background-color: rgba(37, 99, 235, 0.2) !important;
          color: #60a5fa !important;
        }
        .react-datepicker__time-list-item--selected {
          background-color: #2563eb !important;
          color: white !important;
          font-weight: bold !important;
        }
        .react-datepicker__navigation--next--with-time:not(.react-datepicker__navigation--next--with-today-button) { right: 95px !important; }
      `}</style>

      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-700 to-indigo-900 rounded-3xl p-8 text-white shadow-2xl shadow-indigo-500/20">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <Calendar className="w-8 h-8 text-indigo-200" /> Planificador de Guardias
            </h1>
            <p className="text-indigo-100/80">Visualiza y gestiona los turnos de Mercadeo y Comunicaciones.</p>
          </div>
          <button
            onClick={() => { setEditingShift(null); setFormData({ user_id: '', start_date: '', end_date: '', shift_type: 'day', notes: '', tag: 'Redes Sociales' }); setShowModal(true); }}
            className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-700 font-bold rounded-2xl hover:bg-indigo-50 transition-all shadow-xl"
          >
            <Plus className="w-5 h-5" /> Programar Guardia
          </button>
        </div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-400/20 rounded-full blur-3xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Calendar ── */}
        <div className="lg:col-span-2 bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-xl backdrop-blur-xl">
          {/* Month navigation */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10">
            <button onClick={() => goToMonth(-1)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
              <ChevronLeft className="w-5 h-5 text-slate-500" />
            </button>
            <h2 className="font-bold text-lg text-slate-900 dark:text-white">{MONTHS_ES[month]} {year}</h2>
            <button onClick={() => goToMonth(1)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
              <ChevronRight className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }} className="border-b border-slate-200 dark:border-white/10">
            {DAYS_ES.map(d => (
              <div key={d} className="py-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {/* Empty leading cells */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="border-b border-r border-slate-100 dark:border-white/5 min-h-[5rem] p-1" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayShifts = shiftsByDay[key] || [];
              const holiday = VE_HOLIDAYS[key];
              const isToday = key === today;
              const isSelected = key === selectedDay;

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(key === selectedDay ? null : key)}
                  className={`border-b border-r border-slate-100 dark:border-white/5 min-h-[5rem] p-1.5 cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-blue-500/10 dark:bg-blue-500/20 border-blue-500/30' 
                      : 'hover:bg-slate-50 dark:hover:bg-white/5'
                  }`}
                >
                  <div className={`w-7 h-7 flex items-center justify-center rounded-full mb-1 text-sm font-semibold ${
                    isToday ? 'bg-blue-600 text-white' : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    {day}
                  </div>
                  {holiday && (
                    <div className="text-[8px] text-amber-500 font-bold leading-tight mb-1 truncate" title={holiday}>🎉 {holiday}</div>
                  )}
                  <div className="flex flex-wrap gap-0.5">
                    {dayShifts.slice(0, 3).map(s => {
                      const color = userColorMap[s.user_id];
                      return (
                        <div
                          key={s.id}
                          title={s.user_profiles?.display_name}
                          style={{ backgroundColor: color?.customColorHex || color?.dot || '#3b82f6' }}
                          className="w-2 h-2 rounded-full"
                        />
                      );
                    })}
                    {dayShifts.length > 3 && (
                      <span className="text-[9px] text-slate-400">+{dayShifts.length - 3}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-4">
          {/* Selected day detail */}
          {selectedDay && (
            <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-3xl p-5 backdrop-blur-xl shadow-xl">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                {new Date(selectedDay + 'T12:00:00').toLocaleDateString('es-VE', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h3>
              {VE_HOLIDAYS[selectedDay] && (
                <div className="text-xs bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-lg px-3 py-2 mb-3 font-medium">
                  🎉 {VE_HOLIDAYS[selectedDay]}
                </div>
              )}
              {selectedShifts.length === 0 ? (
                <p className="text-sm text-slate-400 italic">Sin guardias asignadas este día.</p>
              ) : (
                <div className="space-y-3">
                  {selectedShifts.map(shift => {
                    const color = userColorMap[shift.user_id];
                    return (
                      <div key={shift.id} className="flex items-start gap-3 group">
                        <div className="w-3 h-3 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: color?.dot || '#3b82f6' }} />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm dark:text-white flex items-center gap-2 truncate">
                            {shift.user_profiles?.display_name}
                            {shift.notes?.startsWith('[Eventos]') && <span className="px-1.5 py-0.5 text-[9px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded uppercase font-bold shrink-0">Eventos</span>}
                            {shift.notes?.startsWith('[Redes Sociales]') && <span className="px-1.5 py-0.5 text-[9px] bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded uppercase font-bold shrink-0">Redes</span>}
                          </p>
                          <p className="text-xs text-indigo-400 font-semibold flex items-center gap-2">
                            {new Date(shift.start_date).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })} — {new Date(shift.end_date).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}
                            <span className="text-[10px] text-slate-500 font-bold bg-slate-500/10 px-1.5 py-0.5 rounded tracking-tighter">
                              {(() => {
                                const s = new Date(shift.start_date);
                                const e = new Date(shift.end_date);
                                const total = differenceInHours(e, s);
                                if (shift.notes?.includes('[Eventos]')) {
                                  let normal = 0; let extra = 0; let cur = startOfHour(s);
                                  while(cur < e) { 
                                    const h = getHours(cur); const dayOff = isWeekend(cur);
                                    if(!dayOff && h >= 8 && h < 17) normal++; else extra++;
                                    cur = addHours(cur, 1);
                                  }
                                  return extra > 0 ? `${total}h (${extra} EXTRA)` : `${total}h`;
                                }
                                return `${total}h`;
                              })()}
                            </span>
                          </p>
                          <p className="text-xs text-slate-400">{shift.user_profiles?.department} · {shift.shift_type === 'day' ? 'Diario' : shift.shift_type === 'week' ? 'Semanal' : 'Fin de Semana'}</p>
                          {(() => {
                            let cleanNotes = shift.notes || '';
                            if (cleanNotes.startsWith('[Eventos] ')) cleanNotes = cleanNotes.replace('[Eventos] ', '');
                            else if (cleanNotes.startsWith('[Redes Sociales] ')) cleanNotes = cleanNotes.replace('[Redes Sociales] ', '');
                            return cleanNotes ? <p className="text-xs text-slate-500 mt-1 italic">"{cleanNotes}"</p> : null;
                          })()}
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                          <button onClick={() => { 
                            let parsedTag = 'Redes Sociales';
                            let parsedNotes = shift.notes || '';
                            if (parsedNotes.startsWith('[Eventos] ')) {
                              parsedTag = 'Eventos';
                              parsedNotes = parsedNotes.replace('[Eventos] ', '');
                            } else if (parsedNotes.startsWith('[Redes Sociales] ')) {
                              parsedTag = 'Redes Sociales';
                              parsedNotes = parsedNotes.replace('[Redes Sociales] ', '');
                            }
                            setEditingShift(shift); 
                            setFormData({ user_id: shift.user_id, start_date: shift.start_date, end_date: shift.end_date, shift_type: shift.shift_type, notes: parsedNotes, tag: parsedTag }); 
                            setShowModal(true); 
                          }} className="p-1 text-slate-400 hover:text-blue-500 rounded-lg hover:bg-blue-500/10 transition-all">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setShowDeleteConfirm(shift.id)} className="p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Color legend */}
          {users.length > 0 && (
            <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-3xl p-5 backdrop-blur-xl shadow-xl">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Referencias</h3>
              <div className="space-y-2">
                {users.map(u => {
                  const color = userColorMap[u.user_id];
                  return (
                    <div key={u.user_id} className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color?.customColorHex || color?.dot || '#3b82f6' }} />
                      <span className="text-sm dark:text-white truncate">{u.display_name}</span>
                      <span className="text-xs text-slate-400 ml-auto shrink-0">{u.department}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal Shadcn ── */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-xl bg-slate-50 dark:bg-[#0f172a] border-slate-200 dark:border-white/10 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold dark:text-white">
              {editingShift ? 'Editar Turno' : 'Nueva Guardia'}
            </DialogTitle>
            <DialogDescription>
              Asigna un responsable y horario para el turno.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-5 pt-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Responsable */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Responsable *</label>
                <CustomSelect
                  value={formData.user_id}
                  onChange={v => setFormData({...formData, user_id: v})}
                  placeholder="Seleccionar..."
                  options={users.map(u => ({ value: u.user_id, label: `${u.display_name} (${u.department})` }))}
                />
              </div>

              {/* Tipo */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tipo de Turno</label>
                <CustomSelect
                  value={formData.shift_type}
                  onChange={v => setFormData({...formData, shift_type: v as any})}
                  options={[
                    { value: 'day', label: 'Diario' },
                    { value: 'week', label: 'Semanal' },
                    { value: 'weekend', label: 'Fin de Semana' },
                  ]}
                />
              </div>

              {/* Inicio */}
              <div className="space-y-1.5 flex flex-col">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Inicio *</label>
                <DatePicker
                  selected={formData.start_date ? new Date(formData.start_date) : null}
                  onChange={(date: Date | null) => {
                    if (date) {
                      setFormData({...formData, start_date: date.toISOString()});
                    }
                  }}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  timeCaption="Hora"
                  dateFormat="dd/MM/yyyy HH:mm"
                  locale="es"
                  customInput={<PremiumDateInput label="Inicio" icon={<Calendar className="w-5 h-5" />} />}
                />
              </div>

              {/* Fin */}
              <div className="space-y-1.5 flex flex-col">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Fin *</label>
                <DatePicker
                  selected={formData.end_date ? new Date(formData.end_date) : null}
                  onChange={(date: Date | null) => {
                    if (date) {
                      setFormData({...formData, end_date: date.toISOString()});
                    }
                  }}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  timeCaption="Hora"
                  dateFormat="dd/MM/yyyy HH:mm"
                  locale="es"
                  customInput={<PremiumDateInput label="Fin" icon={<Clock className="w-5 h-5" />} />}
                />
              </div>

              {/* Etiqueta / Rol */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Etiqueta</label>
                <CustomSelect
                  value={formData.tag}
                  onChange={v => setFormData({...formData, tag: v})}
                  options={[
                    { value: 'Redes Sociales', label: 'Redes Sociales' },
                    { value: 'Eventos', label: 'Cubrir Eventos' }
                  ]}
                />
              </div>
            </div>

            {/* Notas */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Notas Adicionales</label>
              <textarea rows={2} value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
                placeholder="Ej. Cobertura de evento especial..."
                className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 py-2.5 px-4 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm dark:text-white resize-none placeholder:text-slate-400" />
            </div>

            {/* Hours Counter Breakdown */}
            <div className={`p-5 rounded-3xl border transition-all space-y-4 ${dutyBreakdown.total > 0 ? 'bg-blue-600/10 border-blue-500/20' : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/5'}`}>
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className={`p-2.5 rounded-xl ${dutyBreakdown.total > 0 ? 'bg-blue-600/20 text-blue-400' : 'bg-slate-200 dark:bg-white/10 text-slate-500'}`}>
                     <Clock className="w-6 h-6" />
                   </div>
                   <div>
                     <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Duración Total</p>
                     <p className={`text-2xl font-black ${dutyBreakdown.total > 0 ? 'text-blue-500' : 'text-slate-400'}`}>{dutyBreakdown.total} Horas</p>
                   </div>
                 </div>
                 {dutyBreakdown.extra > 0 && (
                   <div className="px-4 py-1.5 bg-amber-500 text-white rounded-full text-[10px] font-black uppercase shadow-lg shadow-amber-500/30 animate-pulse">
                     {dutyBreakdown.extra}h EXTRA
                   </div>
                 )}
               </div>

               {dutyBreakdown.total > 0 && formData.tag === 'Eventos' && (
                 <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-white/5">
                   <div className="text-center p-2 rounded-xl bg-white/50 dark:bg-black/20">
                     <p className="text-[9px] uppercase font-bold text-slate-500">Normales</p>
                     <p className="text-sm font-black dark:text-white">{dutyBreakdown.normal}h</p>
                   </div>
                   <div className="text-center p-2 rounded-xl bg-white/50 dark:bg-black/20">
                     <p className="text-[9px] uppercase font-bold text-slate-500">Extras</p>
                     <p className="text-sm font-black dark:text-blue-400">{dutyBreakdown.extra}h</p>
                   </div>
                 </div>
               )}
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button type="submit" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white">
                {editingShift ? 'Guardar Cambios' : 'Agendar Guardia'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Confirm Delete Modal ── */}
      <Dialog open={!!showDeleteConfirm} onOpenChange={(open) => !open && setShowDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-950 border-slate-200 dark:border-white/10 rounded-[2.5rem] p-10 text-center">
          <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trash2 className="w-10 h-10" />
          </div>
          <DialogTitle className="text-2xl font-black dark:text-white mb-2">¿Eliminar Guardia?</DialogTitle>
          <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">
            Esta acción es definitiva y podría afectar el cálculo de horas extra para este usuario.
          </p>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-6 rounded-2xl font-bold border-slate-200 dark:border-white/10 h-auto">
              Cancelar
            </Button>
            <Button onClick={() => showDeleteConfirm && handleDelete(showDeleteConfirm)} className="flex-1 py-6 rounded-2xl font-bold bg-red-600 hover:bg-red-500 text-white h-auto shadow-lg shadow-red-500/20">
              Sí, Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Custom styled dropdown (replaces native <select>) ────────────────────────
interface SelectOption { value: string; label: string; }
function CustomSelect({ value, onChange, options, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-white/10 py-3 px-4 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all shadow-sm"
      >
        <span className={selected ? '' : 'text-slate-400'}>{selected?.label || placeholder || 'Seleccionar...'}</span>
        <svg className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className="absolute z-[100] w-full mt-2 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700/50 [&::-webkit-scrollbar-thumb]:rounded-full">
          {placeholder && (
            <button type="button" onClick={() => { onChange(''); setOpen(false); }}
              className="w-full text-left px-4 py-3 text-sm text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-b border-white/5">
              {placeholder}
            </button>
          )}
          {options.map(o => (
            <button
              key={o.value}
              type="button"
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                o.value === value
                  ? 'bg-indigo-600/10 text-indigo-400 font-bold border-l-2 border-indigo-500'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 font-medium border-l-2 border-transparent'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
// ─── Premium Custom input for DatePicker ────────────────
const PremiumDateInput = ({ value, onClick, label, icon }: any) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full group flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-4 rounded-2xl transition-all hover:border-blue-500/50 hover:bg-slate-50 dark:hover:bg-blue-500/5 shadow-sm text-left"
  >
    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 group-hover:text-blue-500 transition-colors">
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest">{label}</p>
      <p className="text-sm font-bold text-slate-900 dark:text-white">{value || 'Seleccionar...'}</p>
    </div>
    <Edit2 className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
  </button>
);
