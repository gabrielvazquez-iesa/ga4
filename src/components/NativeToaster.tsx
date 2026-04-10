import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
  description?: string;
}

// Singleton state logic reachable from anywhere
let toastCount = 0;
let addToastFn: (toast: Omit<Toast, 'id'>) => void = () => {};

export const nativeToast = {
  success: (msg: string, opts?: { description?: string }) => addToastFn({ message: msg, type: 'success', description: opts?.description }),
  error: (msg: string, opts?: { description?: string }) => addToastFn({ message: msg, type: 'error', description: opts?.description }),
  info: (msg: string, opts?: { description?: string }) => addToastFn({ message: msg, type: 'info', description: opts?.description }),
};

export default function NativeToaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = ++toastCount;
    setToasts(prev => [...prev, { ...t, id }]);
    // Auto-remove after 5s
    setTimeout(() => {
      setToasts(prev => prev.filter(item => item.id !== id));
    }, 5000);
  }, []);

  useEffect(() => {
    addToastFn = addToast;
    // Export globally for non-react parts
    (window as any).showNativeToast = (msg: string, type: ToastType) => addToast({ message: msg, type });

    // --- NEW: Persistencia entre páginas ---
    const pending = sessionStorage.getItem('pending_toast');
    if (pending) {
      try {
        const { message, type } = JSON.parse(pending);
        addToast({ message, type });
        sessionStorage.removeItem('pending_toast');
      } catch (e) { /* ignore */ }
    }
    // ---------------------------------------
  }, [addToast]);

  return (
    <div className="fixed top-6 right-6 z-[999999] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`pointer-events-auto flex items-start gap-3 min-w-[320px] max-w-[400px] p-4 rounded-2xl border backdrop-blur-xl shadow-2xl ${
              toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
              toast.type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
              'bg-blue-500/10 border-blue-500/20 text-blue-500'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
              {toast.type === 'error' && <XCircle className="w-5 h-5" />}
              {toast.type === 'info' && <Info className="w-5 h-5" />}
            </div>
            
            <div className="flex-1">
              <p className="font-bold text-sm leading-tight text-slate-900 dark:text-white">
                {toast.message}
              </p>
              {toast.description && (
                <p className="text-xs mt-1 text-slate-500 dark:text-slate-400">
                  {toast.description}
                </p>
              )}
            </div>

            <button 
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
