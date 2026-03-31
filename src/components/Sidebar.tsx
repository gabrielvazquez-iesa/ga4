import { LogOut, LayoutDashboard, BarChart3, KeyRound, User, Calendar, Instagram, ChevronLeft, ChevronRight } from 'lucide-react';
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

        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto hide-scrollbar">
          {menuItems.map((item) => {
            const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
            return (
              <a
                key={item.path}
                href={item.path}
                title={isCollapsed ? item.name : undefined}
                className={`flex items-center gap-3 py-3 rounded-xl transition-all font-medium ${isCollapsed ? 'justify-center px-0' : 'px-4'} ${
                  isActive 
                  ? 'bg-blue-600/10 text-blue-500 dark:text-blue-400 border border-blue-500/20 shadow-sm' 
                  : 'hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:text-white border border-transparent'
                }`}
              >
                <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-blue-500 dark:text-blue-400' : 'text-slate-500'}`} />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </a>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-white/5 space-y-2 flex flex-col items-center">
          <button 
            onClick={toggleSidebar}
            className={`flex items-center justify-center w-full py-2.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 transition-colors ${isCollapsed ? 'px-0' : 'px-4 gap-2'}`}
            title={isCollapsed ? "Expandir Panel" : "Colapsar Panel"}
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <><ChevronLeft className="w-5 h-5" /> <span className="text-sm font-semibold truncate">Contraer Menu</span></>}
          </button>

          <button 
            onClick={handleLogout}
            title={isCollapsed ? "Cerrar sesión" : undefined}
            className={`flex items-center w-full rounded-xl text-slate-500 dark:text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors font-medium py-3 ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-4'}`}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="truncate">Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Floating Dock */}
      <nav className="md:hidden fixed bottom-6 left-4 right-4 bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-700 dark:border-white/10 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] rounded-[2rem] p-2 flex items-center justify-between z-50">
        {menuItems.slice(0, 5).map((item) => {
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
      </nav>
      {/* Spacer to prevent content cut off by the dock in mobile */}
      <div className="md:hidden h-24 w-full"></div>
    </>
  );
}
