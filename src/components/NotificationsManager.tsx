import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Bell, Search, Filter, Calendar, Send, Info, AlertTriangle, CheckCircle, XCircle, Users, ChevronLeft, ChevronRight, Trash2, RefreshCw } from 'lucide-react';
import { nativeToast as toast } from './NativeToaster';

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
  const [activeTab, setActiveTab] = useState<'history' | 'send'>('send');
  
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

    // Setup Realtime Subscription
    const channel = supabase
      .channel('notifs_history_realtime')
      .on(
        'postgres_changes',
        { event: '*', table: 'system_notifications', schema: 'public' },
        () => {
          fetchData(); // Refresh history on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

  const handleDeleteNotification = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta notificación?')) return;
    
    const { error } = await supabase.from('system_notifications').delete().eq('id', id);
    
    if (error) {
      toast.error('Error al borrar la notificación.');
    } else {
      toast.success('Notificación eliminada.');
      setNotifications(notifications.filter(n => n.id !== id));
    }
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
          <div className="flex bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-1.5 rounded-2xl shadow-inner">
            <button
              onClick={() => setActiveTab('send')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'send' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-white/5'}`}
            >
              <Send className="w-4 h-4" />
              Enviar Mensaje
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'history' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-white/5'}`}
            >
              <Calendar className="w-4 h-4" />
              Historial
            </button>
          </div>
        )}
      </div>

      {activeTab === 'send' && isAdmin ? (
        <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 p-6 md:p-8 rounded-3xl backdrop-blur-xl shadow-xl animate-in fade-in slide-in-from-bottom-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Send className="w-5 h-5 text-blue-500" />
            Redactar Notificación
          </h2>
          <form onSubmit={handleSendNotification} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Título</label>
                  <input 
                    type="text" 
                    required 
                    value={newTitle} 
                    onChange={e => setNewTitle(e.target.value)} 
                    className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 transition-all text-slate-900 dark:text-white" 
                    placeholder="Ej. Nueva actualización del sistema"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Tipo de Alerta</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'info', label: 'Info', color: 'text-blue-500', bg: 'bg-blue-500/10' },
                      { id: 'success', label: 'Éxito', color: 'text-green-500', bg: 'bg-green-500/10' },
                      { id: 'warning', label: 'Aviso', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
                      { id: 'error', label: 'Error', color: 'text-red-500', bg: 'bg-red-500/10' },
                    ].map(type => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setNewType(type.id)}
                        className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border transition-all ${newType === type.id ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20'}`}
                      >
                        <div className={`w-2 h-2 rounded-full ${type.bg.replace('/10', '')}`} />
                        <span className="text-xs font-bold">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Destinatario</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select 
                      value={targetUser} 
                      onChange={e => setTargetUser(e.target.value)} 
                      className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 transition-all text-slate-900 dark:text-white appearance-none cursor-pointer"
                    >
                      <option value="all">Todos los usuarios</option>
                      {users.map(u => (
                        <option key={u.user_id} value={u.user_id}>{u.display_name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Mensaje</label>
                  <textarea 
                    required 
                    rows={4} 
                    value={newMessage} 
                    onChange={e => setNewMessage(e.target.value)} 
                    className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 transition-all text-slate-900 dark:text-white resize-none" 
                    placeholder="Escribe el contenido de la notificación..."
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button 
                type="submit" 
                disabled={sending} 
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {sending ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                Publicar Notificación
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Filters Bar */}
          <div className="bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 group w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Buscar por título o contenido..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 dark:bg-white/5 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <div className="relative w-full md:w-auto">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="date" 
                className="w-full bg-slate-100 dark:bg-white/5 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
              />
            </div>
          </div>

          {/* List */}
          <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-xl backdrop-blur-xl">
            {loading ? (
              <div className="p-12 flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-slate-200 dark:border-white/10 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-slate-500 font-medium">Cargando historial...</p>
              </div>
            ) : currentItems.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
                No se encontraron notificaciones con los filtros actuales.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-white/5">
                {currentItems.map((n) => (
                  <div key={n.id} className="p-5 md:p-6 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-all group">
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 mt-1">
                        {getIconForType(n.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-1.5">
                          <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors uppercase tracking-tight text-sm md:text-base">{n.title}</h3>
                          <span className="text-[10px] md:text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-full border border-slate-200 dark:border-white/5">
                            {new Date(n.created_at).toLocaleString('es-VE', { 
                              day: '2-digit', month: 'short', year: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{n.message}</p>
                      </div>
                      {isAdmin && (
                        <button 
                          onClick={() => handleDeleteNotification(n.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          title="Eliminar notificación"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-white/5 transition-all disabled:opacity-30 active:scale-90"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex gap-1.5">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-500 bg-slate-100 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-white/5 transition-all disabled:opacity-30 active:scale-90"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
