import { LogOut, LayoutDashboard, BarChart3, KeyRound, User, Calendar, Instagram, ChevronLeft, ChevronRight, Bell } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useState, useEffect } from 'react';

interface SidebarProps {
  currentPath: string;
}

export default function Sidebar({ currentPath }: SidebarProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [customColor, setCustomColor] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    // Check local storage for preference
    const storedState = localStorage.getItem('sidebar_collapsed');
    if (storedState) setIsCollapsed(storedState === 'true');

    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      if (user) {
        setIsAdmin(['admin@iesa.edu.ve', 'gabriel.vazquez@iesa.edu.ve'].includes((user.email || '').toLowerCase()));
        supabase.from('user_profiles').select('custom_color').eq('user_id', user.id).maybeSingle().then((res) => {
          if (res.data?.custom_color) setCustomColor(res.data.custom_color);
        });
      }
    });
  }, []);

  useEffect(() => {
    const mainWrapper = document.getElementById('main-content');
    if (mainWrapper) {
      if (isCollapsed) {
        mainWrapper.classList.remove('md:pl-64');
        mainWrapper.classList.add('md:pl-20');
      } else {
        mainWrapper.classList.remove('md:pl-20');
        mainWrapper.classList.add('md:pl-64');
      }
    }
  }, [isCollapsed]);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar_collapsed', String(newState));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Analítica GA4', path: '/analytics', icon: BarChart3 },
    { name: 'Redes Sociales', path: '/social-reports', icon: Instagram },
    { name: 'Notificaciones', path: '/notifications', icon: Bell },
    { name: 'Bóveda', path: '/vault', icon: KeyRound },
    { name: 'Guardias', path: '/duty', icon: Calendar },
  ];

  if (isAdmin) {
    menuItems.push({ name: 'Usuarios', path: '/users', icon: User });
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
            style={customColor ? { backgroundColor: customColor } : { backgroundImage: 'linear-gradient(to bottom right, #3b82f6, #9333ea)' }}
          >
            GA
          </div>
          {!isCollapsed && (
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 truncate">
              GA4Dash
            </span>
          )}
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2 overflow-visible">
          {menuItems.map((item) => {
            const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
            return (
              <a
                key={item.path}
                href={item.path}
                title={isCollapsed ? undefined : undefined} // Removed native title, using custom tooltip
                className={`group relative flex items-center gap-3 py-3 rounded-xl transition-all font-medium ${isCollapsed ? 'justify-center px-0' : 'px-4'} ${
                  isActive 
                  ? 'bg-blue-600/10 text-blue-500 dark:text-blue-400 border border-blue-500/20 shadow-sm' 
                  : 'hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:text-white border border-transparent'
                }`}
              >
                <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-blue-500 dark:text-blue-400' : 'text-slate-500'}`} />
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
      <nav className="md:hidden fixed bottom-6 left-4 right-4 bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-700 dark:border-white/10 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] rounded-[2rem] p-2 flex items-center justify-between z-50">
        {menuItems.filter(item => item.name !== 'Notificaciones').slice(0, 5).map((item) => {
          const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
          return (
            <a
              key={item.path}
              href={item.path}
              className={`relative flex items-center justify-center rounded-full transition-all duration-300 ease-in-out h-12 ${
                isActive 
                ? 'bg-white text-slate-900 flex-1 px-4 shadow-[0_2px_10px_rgba(255,255,255,0.2)]' 
                : 'w-[3.5rem] text-slate-400 hover:text-white bg-transparent'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 shrink-0 h-full w-full">
                <item.icon 
                  className={`w-5 h-5 transition-transform duration-300 shrink-0 ${isActive ? 'scale-110 text-slate-900' : 'scale-100'}`} 
                  style={isActive && customColor ? { color: customColor } : {}}
                />
                
                <div className={`transition-all duration-300 ease-in-out overflow-hidden flex items-center ${isActive ? 'max-w-[100px] opacity-100 ml-1' : 'max-w-0 opacity-0 ml-0'}`}>
                   <span className="text-sm font-extrabold tracking-tight truncate" style={isActive && customColor ? { color: customColor } : {}}>
                     {item.name.split(' ')[0]}
                   </span>
                </div>
              </div>
            </a>
          );
        })}

        <div className="h-8 w-px bg-slate-700/50 mx-1 shrink-0"></div>

        <button
          onClick={handleLogout}
          title="Cerrar sesión"
          className="relative flex items-center justify-center rounded-full transition-all duration-300 ease-in-out h-12 w-[3.5rem] text-slate-400 hover:text-red-400 hover:bg-red-500/10 shrink-0"
        >
          <LogOut className="w-5 h-5 shrink-0" />
        </button>
      </nav>
    </>
  );
}
