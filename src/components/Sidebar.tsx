import { LogOut, LayoutDashboard, BarChart3, KeyRound, User, Calendar, Instagram, ChevronLeft, ChevronRight, Bell, FileSpreadsheet, BookOpen, LayoutGrid, Layout, X, Globe } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useState, useEffect } from 'react';

interface SidebarProps {
  currentPath: string;
}

export default function Sidebar({ currentPath }: SidebarProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [customColor, setCustomColor] = useState<string | null>(null);
  
  // Inicialización instantánea para evitar el parpadeo
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebar_collapsed') === 'true' || document.documentElement.hasAttribute('data-sidebar-collapsed');
    }
    return false;
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Sync with global layout state
    const syncSidebar = () => {
      const isAttrCollapsed = document.documentElement.hasAttribute('data-sidebar-collapsed');
      setIsCollapsed(isAttrCollapsed);
    };

    syncSidebar();

    // Listener para cambios externos (ej. desde el Topbar en modo Pantalla Completa)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-sidebar-collapsed') {
          syncSidebar();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      if (user) {
        setIsAdmin(['admin@iesa.edu.ve', 'gabriel.vazquez@iesa.edu.ve'].includes((user.email || '').toLowerCase()));
        supabase.from('user_profiles').select('custom_color').eq('user_id', user.id).maybeSingle().then((res) => {
          if (res.data?.custom_color) {
            const color = res.data.custom_color;
            setCustomColor(color);
            localStorage.setItem('accent_color', color);
            document.documentElement.style.setProperty('--accent-color', color);
            document.documentElement.style.setProperty('--accent-color-rgb', hexToRgb(color));
          }
        });
      }
    });

    return () => observer.disconnect();
  }, []);


  // Helper para convertir HEX a RGB (para opacidades en Tailwind/CSS)
  function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '79, 70, 229';
  }


  // Padding management is now handled via CSS in DashboardLayout.astro
    // This allows for layout persistence without flashes.


  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar_collapsed', String(newState));
    
    // Update global attribute for instant CSS response
    if (newState) {
      document.documentElement.setAttribute('data-sidebar-collapsed', 'true');
    } else {
      document.documentElement.removeAttribute('data-sidebar-collapsed');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    sessionStorage.setItem('pending_toast', JSON.stringify({
      message: 'Has cerrado sesión correctamente. ¡Vuelve pronto!',
      type: 'info'
    }));
    window.location.href = '/login';
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Analítica GA4', path: '/analytics', icon: BarChart3 },
    { name: 'Guardias', path: '/duty', icon: Calendar },
    { name: 'Contenidos', path: '/social-planner', icon: Layout },
    { name: 'Redes Sociales', path: '/social-reports', icon: Instagram },
    { name: 'Notificaciones', path: '/notifications', icon: Bell },
    { name: 'Bóveda', path: '/vault', icon: KeyRound },
    { name: 'Manuales', path: '/manuales', icon: BookOpen },
  ];

  if (isAdmin) {
    menuItems.push({ name: 'Usuarios', path: '/users', icon: User });
    menuItems.push({ name: 'Ecosistema Digital', path: '/ecosistema', icon: Globe });
    menuItems.push({ name: 'Reporte Gerencial', path: '/reporte-mensual', icon: FileSpreadsheet });
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`fixed inset-y-0 left-0 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-white/5 hidden md:flex flex-col text-slate-600 dark:text-slate-300 z-40 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
        
        {/* Floating Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3.5 top-24 w-7 h-7 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white shadow-md z-50 transition-colors group"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          
          {/* Tooltip for toggle */}
          <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap shadow-xl border border-white/10 flex items-center pointer-events-none">
            <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 dark:bg-slate-800 rotate-45 border-l border-b border-white/10"></div>
            {isCollapsed ? 'Desplegar panel' : 'Contraer panel'}
          </div>
        </button>

        <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white shadow-lg overflow-hidden shrink-0 transition-colors"
            style={{ backgroundColor: 'var(--accent-color)' }}
          >
            GA
          </div>

          {!isCollapsed && (
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 truncate">
              GA4Dash
            </span>
          )}
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {menuItems.map((item) => {
            const path = currentPath || '';
            const isActive = path === item.path || path.startsWith(item.path + '/');
            return (
              <a
                key={item.path}
                href={item.path}
                title={isCollapsed ? undefined : undefined} // Removed native title, using custom tooltip
                className={`group relative flex items-center gap-3 py-3 rounded-xl transition-all font-medium ${isCollapsed ? 'justify-center px-0' : 'px-4'} ${
                  isActive 
                  ? 'bg-accent/10 text-accent border-accent/20 shadow-sm' 
                  : 'hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:text-white border border-transparent'
                }`}
              >
                <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-accent' : 'text-slate-500'}`} />
                {!isCollapsed && <span className="truncate">{item.name}</span>}


                {/* Animated Tooltip */}
                {isCollapsed && (
                  <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 dark:bg-slate-800 text-white text-sm font-semibold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap shadow-xl border border-white/10 flex items-center">
                    <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-900 dark:bg-slate-800 rotate-45 border-l border-b border-white/10"></div>
                    {item.name}
                  </div>
                )}
              </a>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-white/5 space-y-2 flex flex-col items-center">
          <button 
            onClick={handleLogout}
            className={`group relative flex items-center w-full rounded-xl text-slate-500 dark:text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors font-medium py-3 ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-4'}`}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="truncate">Cerrar sesión</span>}

            {/* Logout Tooltip */}
            {isCollapsed && (
              <div className="absolute left-full ml-4 px-3 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap shadow-xl flex items-center">
                <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-600 rotate-45"></div>
                Cerrar sesión
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Floating Dock */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-full px-4 py-2 flex items-center justify-between z-50">
        
        {/* Atajos Rápidos Izquierda */}
        <div className="flex items-center gap-1 flex-1 justify-start">
          <a href="/analytics" className={`p-3 rounded-2xl transition-all active:scale-90 ${currentPath === '/analytics' ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-white/10'}`}>
            <BarChart3 className="w-6 h-6" />
          </a>
          <a href="/social-reports" className={`p-3 rounded-2xl transition-all active:scale-90 ${currentPath === '/social-reports' ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-white/10'}`}>
            <Instagram className="w-6 h-6" />
          </a>
        </div>

        {/* Central Menu Button */}
        <div className="mx-2 shrink-0">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="relative flex items-center justify-center w-14 h-14 bg-accent text-white rounded-full shadow-lg shadow-accent/40 transform transition-all active:scale-95 hover:shadow-accent/60"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <LayoutGrid className="w-6 h-6" />}
          </button>

        </div>

        {/* Atajos Rápidos Derecha */}
        <div className="flex items-center gap-1 flex-1 justify-end">
          <a href="/vault" className={`p-3 rounded-2xl transition-all active:scale-90 ${currentPath === '/vault' ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-white/10'}`}>
            <KeyRound className="w-6 h-6" />
          </a>
          <button onClick={handleLogout} className="p-3 text-slate-500 dark:text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all active:scale-90">
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Expanded Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileMenuOpen(false)}>
          <div 
            className="absolute bottom-24 left-4 right-4 bg-white/70 dark:bg-[#0f172a]/80 backdrop-blur-2xl border border-white/50 dark:border-white/10 p-6 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] animate-in slide-in-from-bottom-8 fade-in duration-300"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-5">Todas las aplicaciones</h3>
            <div className="grid grid-cols-3 gap-4">
              {menuItems.map(item => {
                const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
                return (
                  <a key={item.path} href={item.path} onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center gap-2.5 group">
                    <div className={`w-16 h-16 flex items-center justify-center rounded-2xl transition-all ${isActive ? 'bg-accent text-white shadow-lg shadow-accent/30' : 'bg-slate-100/80 dark:bg-white/8 text-slate-600 dark:text-slate-300 group-hover:bg-blue-50 dark:group-hover:bg-white/15 border border-slate-200/50 dark:border-white/5'}`}>
                      <item.icon className="w-7 h-7" />
                    </div>
                    <span className="text-[11px] font-semibold text-center leading-tight text-slate-600 dark:text-slate-300">{item.name}</span>
                  </a>

                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
