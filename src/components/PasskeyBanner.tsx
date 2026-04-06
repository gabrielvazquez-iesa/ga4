import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Fingerprint, X, ShieldCheck, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function PasskeyBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkPasskeyStatus();
  }, []);

  const checkPasskeyStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Verificar soporte del navegador
      const isWebAuthnSupported = window.PublicKeyCredential && 
                                  typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function';

      if (!isWebAuthnSupported) return;

      // Verificar si fue cerrado recientemente
      const dismissedAt = localStorage.getItem('passkey_banner_dismissed');
      const isDismissed = dismissedAt && (Date.now() - parseInt(dismissedAt)) < 1000 * 60 * 60 * 24; // 24h

      if (isDismissed) return;

      // Verificar si el usuario ya tiene biometría configurada
      // Nota: Usamos mfa.listFactors() que es el estándar actual en Supabase para WebAuthn
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;

      const hasWebAuthn = data?.all.some(f => f.factor_type === 'webauthn');

      if (!hasWebAuthn) {
        setTimeout(() => setIsVisible(true), 2000);
      }
    } catch (err) {
      console.warn("Passkey status check failed:", err);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      // 1. Iniciar enrolamiento MFA
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'webauthn',
      });

      if (error) throw error;

      // Supabase lanza el prompt nativo automáticamente si está configurado el cliente
      if (data?.id) {
        toast.success("¡Dispositivo vinculado con éxito!");
        setIsVisible(false);
      }
    } catch (err: any) {
      toast.error(err.message || "Error al registrar biometría. Asegúrate de estar en HTTPS.");
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('passkey_banner_dismissed', Date.now().toString());
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-2xl px-4"
        >
          <div className="relative overflow-hidden p-[1px] rounded-2xl bg-gradient-to-r from-blue-500/30 via-indigo-500/30 to-purple-500/30 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
            <div className="bg-slate-900/60 backdrop-blur-xl rounded-[calc(1rem-1px)] p-4 md:p-5 flex flex-col md:flex-row items-center gap-4 justify-between border border-white/5">
              
              <div className="flex items-center gap-4 text-center md:text-left">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                  <Fingerprint className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-white font-bold flex items-center gap-2 justify-center md:justify-start">
                    Acceso Rápido <Sparkles className="w-4 h-4 text-blue-400" />
                  </h3>
                  <p className="text-slate-300 text-xs md:text-sm">
                    Entra a tu dashboard usando tu huella o FaceID en este equipo.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  onClick={handleRegister}
                  disabled={loading}
                  className="flex-1 md:flex-none px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50"
                >
                  {loading ? 'Activando...' : 'Activar'}
                </button>
                <button
                  onClick={handleDismiss}
                  className="p-2.5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-colors"
                  aria-label="Cerrar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Light rays effects */}
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-600/20 rounded-full blur-[80px]"></div>
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-600/20 rounded-full blur-[80px]"></div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
