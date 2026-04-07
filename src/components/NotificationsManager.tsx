import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Bell, Search, Filter, Calendar, Send, Info, AlertTriangle, CheckCircle, XCircle, Users } from 'lucide-react';
import { Toaster, toast } from 'sonner';

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  type?: 'info' | 'warning' | 'success' | 'error';
  user_id?: string | null;
}

interface UserProfile {
  user_id: string;
  display_name: string;
  email: string;
}

export default function NotificationsManager() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'history' | 'send'>('history');
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // New Notification Form
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newType, setNewType] = useState('info');
  const [targetUser, setTargetUser] = useState('all');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchData();
  }, [searchQuery, dateFilter]);

  const fetchData = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const email = session.user.email || '';
    const adminStatus = ['admin@iesa.edu.ve', 'gabriel.vazquez@iesa.edu.ve'].includes(email.toLowerCase());
    setIsAdmin(adminStatus);

    // Fetch Notifications based on search and date
    let query = supabase.from('system_notifications').select('*').order('created_at', { ascending: false });
    
    // Applying Date Filter if exists
    if (dateFilter) {
      const startOfDay = new Date(dateFilter);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(dateFilter);
      endOfDay.setHours(23, 59, 59, 999);
      query = query.gte('created_at', startOfDay.toISOString()).lte('created_at', endOfDay.toISOString());
    }

    const { data: notifs } = await query;
    
    // Applying Search Filter in memory for title/message
    let filtered = notifs || [];
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(n => n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q));
    }
    
    setNotifications(filtered);

    // If Admin, fetch users for the dropdown
    if (adminStatus) {
      const { data: profiles, error } = await supabase.from('user_profiles').select('user_id, display_name');
      if (profiles) setUsers(profiles as UserProfile[]);
      if (error) console.error("Error fetching users for notifications:", error);
    }

    setLoading(false);
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    const payload = {
      title: newTitle,
      message: newMessage,
      type: newType,
      user_id: targetUser === 'all' ? null : targetUser
    };

    const { error } = await supabase.from('system_notifications').insert([payload]);

    if (error) {
      toast.error('Error al enviar la notificación.');
    } else {
      toast.success('Notificación enviada exitosamente.');
      setNewTitle('');
      setNewMessage('');
      setTargetUser('all');
      fetchData(); // Refresh list
    }
    setSending(false);
  };

  const getIconForType = (type?: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  // Pagination Logic
  const totalPages = Math.ceil(notifications.length / ITEMS_PER_PAGE);
  const currentItems = notifications.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <Toaster position="top-right" richColors />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Bell className="w-8 h-8 text-blue-500" />
            Centro de Notificaciones
          </h1>
          <p className="text-slate-500 mt-2">Revisa alertas del sistema, cambios de guardias y comunicados.</p>
        </div>

        {isAdmin && (
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              Historial
            </button>
            <button
              onClick={() => setActiveTab('send')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'send' ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              Enviar Mensaje
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-none">
        
        {activeTab === 'history' ? (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por palabra clave..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                />
              </div>
              <div className="relative md:w-64">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>
            </div>

            {/* List */}
            {loading ? (
              <div className="text-center py-12 text-slate-500">Cargando notificaciones...</div>
            ) : currentItems.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 border-dashed rounded-2xl">
                <Filter className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <h3 className="text-slate-900 dark:text-white font-bold mb-1">No hay resultados</h3>
                <p className="text-slate-500 text-sm">Prueba ajustando los filtros de búsqueda o fecha.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentItems.map(notif => (
                  <div key={notif.id} className="flex items-start gap-4 p-5 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-white/5 hover:border-blue-500/30 transition-colors group">
                    <div className="mt-1 shrink-0 p-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm">
                      {getIconForType(notif.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-slate-900 dark:text-white">{notif.title}</h4>
                        <span className="text-xs font-semibold text-slate-400 bg-white dark:bg-slate-900 px-2 py-1 rounded-md border border-slate-200 dark:border-white/5">
                          {new Date(notif.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">{notif.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/10">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Anterior
                </button>
                <div className="text-sm font-bold text-slate-500">
                  Página <span className="text-slate-900 dark:text-white">{currentPage}</span> de {totalPages}
                </div>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Admin Send Tab */
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <Send className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Redactar Mensaje</h2>
              <p className="text-slate-500">Envía alertas personalizadas o al sistema entero.</p>
            </div>
            
            <form onSubmit={handleSendNotification} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">Destinatario</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <CustomSelect
                    value={targetUser}
                    onChange={setTargetUser}
                    options={[
                      { value: 'all', label: '🌐 Todos los usuarios (Aviso Global)' },
                      ...users.map(u => ({ value: u.user_id, label: `👤 ${u.display_name || 'Usuario ' + u.user_id.substring(0,6)}` }))
                    ]}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">Tipo de Aviso</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['info', 'success', 'warning', 'error'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewType(t)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${newType === t ? 'border-blue-500 bg-blue-500/5' : 'border-slate-200 dark:border-slate-800 hover:border-blue-500/30'}`}
                    >
                      {getIconForType(t)}
                      <span className="text-xs font-bold mt-2 capitalize text-slate-600 dark:text-slate-300">{t}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">Título</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej: Cambio de guardia exitoso"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">Mensaje</label>
                <textarea
                  required
                  rows={4}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Detalles de la notificación..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex justify-center items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {sending ? 'Enviando...' : <><Send className="w-5 h-5" /> Enviar Notificación</>}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

interface SelectOption { value: string; label: string; }
function CustomSelect({ value, onChange, options }: {
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
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
        className="w-full flex items-center justify-between pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-semibold"
      >
        <span className="truncate">{selected?.label || 'Seleccionar...'}</span>
        <svg className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className="absolute z-[100] w-full mt-2 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700/50 [&::-webkit-scrollbar-thumb]:rounded-full">
          {options.map(o => (
            <button
              key={o.value}
              type="button"
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={`w-full text-left px-4 py-3 text-sm transition-colors cursor-pointer ${
                o.value === value
                  ? 'bg-blue-600/10 text-blue-500 font-bold border-l-2 border-blue-500'
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
