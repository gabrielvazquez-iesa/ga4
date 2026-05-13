import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutGrid, X, LayoutDashboard, BarChart3, Calendar, 
  Layout, Instagram, Bell, KeyRound, BookOpen, 
  User, Globe, FileSpreadsheet, LogOut, ArrowRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AppLauncherProps {
  currentPath: string;
}

export default function AppLauncher({ currentPath }: AppLauncherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsAdmin(['admin@iesa.edu.ve', 'gabriel.vazquez@iesa.edu.ve'].includes((session.user.email || '').toLowerCase()));
      }
    };
    checkAdmin();

    // Close on escape key
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, desc: 'Vista general del sistema' },
    { name: 'Analítica GA4', path: '/analytics', icon: BarChart3, desc: 'Reportes de tráfico web' },
    { name: 'Guardias', path: '/duty', icon: Calendar, desc: 'Planificador de turnos' },
    { name: 'Contenidos', path: '/social-planner', icon: Layout, desc: 'Gestión de publicaciones' },
    { name: 'Redes Sociales', path: '/social-reports', icon: Instagram, desc: 'Métricas de Instagram' },
    { name: 'Notificaciones', path: '/notifications', icon: Bell, desc: 'Alertas y avisos' },
    { name: 'Bóveda', path: '/vault', icon: KeyRound, desc: 'Gestión de credenciales' },
    { name: 'Manuales', path: '/manuales', icon: BookOpen, desc: 'Documentación y guías' },
  ];

  if (isAdmin) {
    menuItems.push({ name: 'Usuarios', path: '/users', icon: User, desc: 'Roster de personal' });
    menuItems.push({ name: 'Ecosistema Digital', path: '/ecosistema', icon: Globe, desc: 'Propiedades externas' });
    menuItems.push({ name: 'Reporte Gerencial', path: '/reporte-mensual', icon: FileSpreadsheet, desc: 'Descarga de reportes' });
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 w-14 h-14 md:w-16 md:h-16 bg-accent text-white rounded-full shadow-2xl shadow-accent/40 flex items-center justify-center z-[60] hover:scale-110 active:scale-95 transition-all duration-300 group"
        aria-label="Abrir Menú de Aplicaciones"
      >
        <div className="absolute inset-0 rounded-full bg-accent animate-ping opacity-20 group-hover:opacity-40"></div>
        <LayoutGrid className="w-7 h-7 md:w-8 md:h-8 relative z-10" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-slate-950/80 backdrop-blur-2xl"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-slate-900 w-full max-w-6xl rounded-[3rem] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-8 md:p-12 flex justify-between items-center border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-accent rounded-3xl flex items-center justify-center shadow-xl shadow-accent/20">
                    <LayoutGrid className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Menú Principal</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Acceso rápido a todos los módulos del sistema</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-14 h-14 flex items-center justify-center bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl shadow-lg hover:rotate-90 hover:scale-110 transition-all duration-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Grid */}
              <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {menuItems.map((item, idx) => {
                    const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
                    return (
                      <motion.a
                        key={item.path}
                        href={item.path}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className={`group relative p-8 rounded-[2rem] border transition-all duration-500 flex flex-col gap-4 overflow-hidden ${
                          isActive 
                          ? 'bg-accent border-accent shadow-2xl shadow-accent/30' 
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-white/5 hover:border-accent hover:shadow-2xl hover:-translate-y-2'
                        }`}
                      >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                          isActive ? 'bg-white/20 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-lg group-hover:bg-accent group-hover:text-white'
                        }`}>
                          <item.icon className="w-7 h-7" />
                        </div>
                        
                        <div className="mt-2">
                          <h3 className={`text-xl font-black mb-1 transition-colors ${isActive ? 'text-white' : 'text-slate-900 dark:text-white group-hover:text-accent'}`}>
                            {item.name}
                          </h3>
                          <p className={`text-sm font-medium line-clamp-2 transition-colors ${isActive ? 'text-white/80' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}>
                            {item.desc}
                          </p>
                        </div>

                        <div className={`mt-auto pt-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all ${
                          isActive ? 'text-white' : 'text-accent opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0'
                        }`}>
                          Abrir App <ArrowRight className="w-4 h-4" />
                        </div>

                        {/* Decoration */}
                        <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-3xl transition-all duration-700 ${
                          isActive ? 'bg-white/10' : 'bg-accent/5 group-hover:bg-accent/10'
                        }`} />
                      </motion.a>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="p-8 md:p-12 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 font-bold">
                    IESA
                  </div>
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Dashboard de Analítica Digital GA4</span>
                </div>
                
                <button 
                  onClick={async () => {
                    await supabase.auth.signOut();
                    window.location.href = '/login';
                  }}
                  className="flex items-center gap-3 px-8 py-4 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl font-black text-sm transition-all duration-300"
                >
                  <LogOut className="w-5 h-5" /> Cerrar Sesión
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
