import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Shield, Fingerprint, Trash2, CheckCircle2 } from 'lucide-react';
import { nativeToast as toast } from './NativeToaster';

export default function SecuritySettings() {
  const [factors, setFactors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFactors();
  }, []);

  const loadFactors = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      if (data) {
        setFactors(data.all.filter(f => f.factor_type === 'webauthn'));
      }
    } catch (err) {
      console.warn("MFA login check failed:", err);
    }
  };

  const enrollPasskey = async () => {
    setLoading(true);
    try {
      // 1. Enrolar factor WebAuthn
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'webauthn',
      });
      
      if (error) throw error;
      
      // Supabase lanza el desafío y el navegador muestra el prompt nativo
      if (data?.id) {
        toast.success("¡Dispositivo vinculado con éxito para acceso biométrico!");
        loadFactors();
      }
    } catch (err: any) {
      toast.error(err.message || "Error al registrar biometría. Asegúrate de estar en HTTPS.");
    } finally {
      setLoading(false);
    }
  };

  const unenrollFactor = async (id: string) => {
    if (!confirm("¿Seguro que quieres eliminar este acceso biométrico? Tendrás que usar tu contraseña la próxima vez.")) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId: id });
      if (error) throw error;
      
      toast.success("Acceso biométrico eliminado.");
      loadFactors();
    } catch (err: any) {
      toast.error(err.message || "No se pudo eliminar el acceso.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-6 space-y-6 shadow-xl">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <Shield className="w-5 h-5 text-blue-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Seguridad Biométrica</h2>
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-400">
        Configura tu huella dactilar o FaceID para entrar al dashboard de forma segura y rápida sin escribir tu contraseña cada vez.
      </p>

      <div className="space-y-4">
        {factors.length > 0 ? (
          factors.map(f => (
            <div key={f.id} className="group flex items-center justify-between p-4 bg-white/50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 transition-all hover:border-blue-500/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-full">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Dispositivo Registrado</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 uppercase tracking-tighter">
                    Status: {f.status} • {new Date(f.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => unenrollFactor(f.id)}
                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                title="Eliminar dispositivo"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-2xl">
            <Fingerprint className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
              No hay dispositivos vinculados actualmente.
            </p>
          </div>
        )}

        <button
          onClick={enrollPasskey}
          disabled={loading}
          className="group relative w-full overflow-hidden flex items-center justify-center gap-3 py-3.5 px-4 bg-slate-900 dark:bg-white hover:scale-[1.01] text-white dark:text-slate-900 rounded-xl font-bold transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-slate-900/20 dark:shadow-white/10"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <Fingerprint className="w-5 h-5 relative z-10" />
          <span className="relative z-10">{loading ? 'Procesando...' : 'Vincular huella en este equipo'}</span>
        </button>
      </div>
    </div>
  );
}
