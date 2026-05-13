import { LogOut, LayoutDashboard, BarChart3, KeyRound, User, Calendar, Instagram, ChevronLeft, ChevronRight, Bell, FileSpreadsheet, BookOpen, LayoutGrid, Layout, X, Globe } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useState, useEffect } from 'react';

interface SidebarProps {
  currentPath: string;
}

export default function Sidebar({ currentPath }: SidebarProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [customColor, setCustomColor] = useState<string | null>(null);
  
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebar_collapsed') === 'true' || document.documentElement.hasAttribute('data-sidebar-collapsed');
    }
    return false;
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const syncSidebar = () => {
      const isAttrCollapsed = document.documentElement.hasAttribute('data-sidebar-collapsed');
      setIsCollapsed(isAttrCollapsed);
    };

    syncSidebar();

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

  function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '79, 70, 229';
  }

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar_collapsed', String(newState));
    
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
        
        <button
          onClick={toggleSidebar}
          className="absolute -right-3.5 top-24 w-7 h-7 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white shadow-md z-50 transition-colors group"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          
          <div className="fixed left-20 ml-2 px-3 py-1.5 bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap shadow-xl border border-white/10 flex items-center pointer-events-none">
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
          {!isCollapsed && <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 truncate">GA4Dash</span>}
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {menuItems.map((item) => {
            const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
            return (
              <a
                key={item.path}
                href={item.path}
                className={`group relative flex items-center gap-3 py-3 rounded-xl transition-all font-medium ${isCollapsed ? 'justify-center px-0' : 'px-4'} ${
                  isActive 
                  ? 'bg-accent/10 text-accent border-accent/20 shadow-sm' 
                  : 'hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:text-white border border-transparent'
                }`}
              >
                <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-accent' : 'text-slate-500'}`} />
                {!isCollapsed && <span className="truncate">{item.name}</span>}

                {isCollapsed && (
                  <div className="fixed left-20 ml-2 px-3 py-2 bg-slate-900 dark:bg-slate-800 text-white text-sm font-semibold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100] whitespace-nowrap shadow-xl border border-white/10 flex items-center pointer-events-none">
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

            {isCollapsed && (
              <div className="fixed left-20 ml-2 px-3 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100] whitespace-nowrap shadow-xl flex items-center pointer-events-none">
                <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-600 rotate-45"></div>
                Cerrar sesión
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Unified Floating Dock (Mobile & Desktop) */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-full px-6 py-3 flex items-center gap-2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-1">
          <a href="/analytics" title="Analítica" className={`p-3 rounded-2xl transition-all active:scale-90 ${currentPath === '/analytics' ? 'bg-accent/20 text-accent' : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-white/10'}`}><BarChart3 className="w-6 h-6" /></a>
          <a href="/social-reports" title="Redes Sociales" className={`p-3 rounded-2xl transition-all active:scale-90 ${currentPath === '/social-reports' ? 'bg-accent/20 text-accent' : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-white/10'}`}><Instagram className="w-6 h-6" /></a>
        </div>
        <div className="mx-2 shrink-0">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="relative flex items-center justify-center w-14 h-14 bg-accent text-white rounded-full shadow-lg shadow-accent/40 transform transition-all active:scale-95 hover:shadow-accent/60 group">
            <div className="absolute inset-0 rounded-full bg-accent animate-ping opacity-20 group-hover:opacity-40 transition-opacity"></div>
            {isMobileMenuOpen ? <X className="w-6 h-6 relative z-10" /> : <LayoutGrid className="w-6 h-6 relative z-10" />}
          </button>
        </div>
        <div className="flex items-center gap-1">
          <a href="/vault" title="Bóveda" className={`p-3 rounded-2xl transition-all active:scale-90 ${currentPath === '/vault' ? 'bg-accent/20 text-accent' : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-white/10'}`}><KeyRound className="w-6 h-6" /></a>
          <button onClick={handleLogout} title="Salir" className="p-3 text-slate-500 dark:text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"><LogOut className="w-6 h-6" /></button>
        </div>
      </nav>

      {/* Expanded Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px] transition-opacity" onClick={() => setIsMobileMenuOpen(false)}>
          <div 
            className="absolute bottom-[100px] left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md bg-white/80 dark:bg-[#0f172a]/90 backdrop-blur-2xl border border-white/50 dark:border-white/10 p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-in fade-in slide-in-from-bottom-12 duration-500 ease-out"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Todas las aplicaciones</h3>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors group/close">
                <X className="w-4 h-4 text-slate-400 group-hover/close:rotate-90 transition-transform duration-300" />
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-6">
              {menuItems.map((item, idx) => {
                const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
                return (
                  <a 
                    key={item.path} 
                    href={item.path} 
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className="flex flex-col items-center gap-3 group transition-transform active:scale-90"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className={`w-16 h-16 flex items-center justify-center rounded-[1.5rem] transition-all duration-300 ${isActive ? 'bg-accent text-white shadow-xl shadow-accent/40 scale-110' : 'bg-slate-100/50 dark:bg-white/5 text-slate-500 dark:text-slate-400 group-hover:bg-accent/10 group-hover:text-accent border border-slate-200/50 dark:border-white/5 shadow-sm group-hover:scale-105'}`}>
                      <item.icon className="w-7 h-7" />
                    </div>
                    <span className={`text-[11px] font-bold text-center leading-tight transition-colors ${isActive ? 'text-accent' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'}`}>{item.name}</span>
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
