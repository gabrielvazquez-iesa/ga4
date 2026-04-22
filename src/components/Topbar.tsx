import { Bell, Search, User, Check, Trash2, X, Calendar, ShieldCheck, Maximize2, Minimize2 } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { nativeToast as toast } from './NativeToaster';
import ThemeToggle from './ThemeToggle';

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

export default function Topbar() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [onDuty, setOnDuty] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [preFullscreenSidebarState, setPreFullscreenSidebarState] = useState<boolean | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const searchRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const searchableRoutes = [
    { name: 'Dashboard Principal', path: '/dashboard', keywords: ['inicio', 'home', 'principal', 'general'] },
    { name: 'Analítica GA4 (Web)', path: '/analytics', keywords: ['reportes', 'analitica', 'google', 'visitas', 'trafico', 'estadisticas'] },
    { name: 'Redes Sociales', path: '/social-reports', keywords: ['instagram', 'metricas', 'social', 'seguidores', 'engagement'] },
    { name: 'Bóveda de Accesos', path: '/vault', keywords: ['claves', 'passwords', 'accesos', 'boveda', 'secretos'] },
    { name: 'Planificador de Guardias', path: '/duty', keywords: ['guardias', 'calendario', 'planificador', 'turnos', 'fechas'] },
    { name: 'Gestión de Usuarios', path: '/users', keywords: ['usuarios', 'admin', 'cuentas', 'permisos', 'roster'] },
    { name: 'Mi Perfil', path: '/profile', keywords: ['perfil', 'avatar', 'configuracion', 'ajustes', 'contraseña'] },
    { name: 'Centro de Notificaciones', path: '/notifications', keywords: ['notificaciones', 'alertas', 'mensajes', 'avisos'] }
  ];

  useEffect(() => {
    fetchInitialData();
    
    // Setup Realtime Subscription with better channel name and events
    const channel = supabase
      .channel('public:system_notifications')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          table: 'system_notifications', 
          schema: 'public' 
        },
        (payload) => {
          console.log('Nueva notificación recibida:', payload);
          // Actualizamos la lista con el nuevo item en lugar de re-fetch total
          setNotifications(prev => [payload.new as Notification, ...prev].slice(0, 10));
          
          // Disparamos un toast si la notificación es nueva
          toast.info(payload.new.title, {
            description: payload.new.message
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', table: 'system_notifications', schema: 'public' },
        () => fetchInitialData()
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', table: 'system_notifications', schema: 'public' },
        () => fetchInitialData()
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Conectado a notificaciones Realtime');
        }
      });

    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullscreen(isFull);
      
      if (!isFull && preFullscreenSidebarState !== null) {
        // Al salir de pantalla completa, restaurar estado del sidebar
        if (preFullscreenSidebarState) {
          document.documentElement.setAttribute('data-sidebar-collapsed', 'true');
          localStorage.setItem('sidebar_collapsed', 'true');
        } else {
          document.documentElement.removeAttribute('data-sidebar-collapsed');
          localStorage.setItem('sidebar_collapsed', 'false');
        }
        setPreFullscreenSidebarState(null);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      supabase.removeChannel(channel);
    };
  }, [preFullscreenSidebarState]);


  const fetchInitialData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return;
    
    setUserEmail(user.email || 'Usuario');
    
    // Fetch profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('avatar_url')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (profile?.avatar_url) setAvatarUrl(profile.avatar_url);

    // Check if user is on duty
    const now = new Date().toISOString();
    const { data: activeShift } = await supabase
      .from('duty_shifts')
      .select('id')
      .eq('user_id', user.id)
      .lte('start_date', now)
      .gte('end_date', now)
      .maybeSingle();
    
    setOnDuty(!!activeShift);

    // Fetch notifications
    const { data: notifs } = await supabase
      .from('system_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
        
    if (notifs) setNotifications(notifs);
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      // Guardar estado actual del sidebar antes de colapsar para pantalla completa
      const isCurrentCollapsed = document.documentElement.hasAttribute('data-sidebar-collapsed');
      setPreFullscreenSidebarState(isCurrentCollapsed);
      
      // Colapsar sidebar para maximizar espacio
      document.documentElement.setAttribute('data-sidebar-collapsed', 'true');
      localStorage.setItem('sidebar_collapsed', 'true');

      await document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const searchResults = searchQuery.trim() === '' ? [] : searchableRoutes.filter(route => 
    route.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    route.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAllAsRead = async () => {
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length > 0) {
      await supabase.from('system_notifications').update({ is_read: true }).in('id', unreadIds);
    }
  };

  const removeNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(notifications.filter(n => n.id !== id));
    await supabase.from('system_notifications').delete().eq('id', id);
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 md:px-8 md:py-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5">
      <div className="relative w-full max-w-sm" ref={searchRef}>
        <div className="flex bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-full items-center px-4 py-2 w-full focus-within:ring-1 focus-within:ring-blue-500/50 focus-within:border-blue-500/50 transition-all">
          <Search className="w-4 h-4 text-slate-500 shrink-0" />
          <input 
            type="text" 
            placeholder="Buscar en el sistema..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            className="bg-transparent border-none outline-none text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 ml-2 w-full"
          />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(''); setShowSearchResults(false); }} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showSearchResults && searchQuery.trim() !== '' && (
          <div className="fixed inset-x-4 top-[72px] md:absolute md:inset-auto md:top-full md:left-0 md:right-0 md:mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
            {searchResults.length > 0 ? (
              <div className="max-h-64 overflow-y-auto py-2">
                {searchResults.map((result, idx) => (
                  <a 
                    key={idx} 
                    href={result.path}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <Search className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{result.name}</p>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
                No se encontraron resultados para "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        {onDuty && (
          <a href="/duty" className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full group hover:bg-green-500/20 transition-all">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">En Guardia</span>
          </a>
        )}
        
        <a href="/duty" className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800" title="Planificador de Guardias">
          <Calendar className="w-5 h-5" />
        </a>

        <button 
          onClick={toggleFullscreen}
          className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>

        <ThemeToggle />

        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]"></span>
            )}
          </button>

          {showNotifications && (
            <div className="fixed inset-x-4 top-[72px] md:absolute md:inset-auto md:right-0 md:mt-2 md:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200 z-[100]">
              <div className="p-4 border-b border-slate-200 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50">
                <h3 className="font-bold text-slate-900 dark:text-white">Notificaciones</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" /> Marcar leídas
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm">No tienes notificaciones.</div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {notifications.map(n => (
                      <div key={n.id} className={`p-4 transition-colors relative group ${n.is_read ? 'bg-slate-50 dark:bg-slate-900' : 'bg-blue-500/5 dark:bg-blue-500/10'}`}>
                        {!n.is_read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>}
                        <div className="flex justify-between items-start gap-3">
                          <div>
                            <p className={`text-sm font-semibold mb-1 ${n.is_read ? 'text-slate-600 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>{n.title}</p>
                            <p className="text-xs text-slate-400 line-clamp-2">{n.message}</p>
                            <p className="text-[10px] text-slate-500 mt-2 uppercase">{new Date(n.created_at).toLocaleDateString()}</p>
                          </div>
                          <button onClick={(e) => removeNotification(n.id, e)} className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-2 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900">
                <a href="/notifications" className="block w-full text-center text-xs font-bold text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 py-2">
                  VER TODAS LAS NOTIFICACIONES
                </a>
              </div>
            </div>
          )}
        </div>

        <a href="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="hidden md:block text-right">
            <div className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1">{userEmail || 'Cargando...'}</div>
            <div className="text-xs text-slate-500">Mi Perfil</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 overflow-hidden shrink-0">
            {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : <User className="w-5 h-5" />}
          </div>
        </a>
      </div>
    </header>
  );
}
