import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { nativeToast as toast } from './NativeToaster';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Check current state in DOM
    setIsDark(document.documentElement.classList.contains('dark'));

    // Re-check on navigation (Astro transitions)
    const handlePageLoad = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    document.addEventListener('astro:page-load', handlePageLoad);
    return () => document.removeEventListener('astro:page-load', handlePageLoad);
  }, []);

  const toggle = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      toast.info('Modo Oscuro activado');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      toast.info('Modo Claro activado');
    }
  };

  return (
    <button
      onClick={toggle}
      className="p-2.5 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all focus:outline-none border border-transparent hover:border-slate-200 dark:hover:border-white/10"
      title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}
