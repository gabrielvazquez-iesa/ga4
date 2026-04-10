import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, LogIn, UserPlus, KeyRound, AlertCircle, CheckCircle2, Eye, EyeOff, Fingerprint, ShieldCheck } from 'lucide-react';
import { nativeToast as toast } from './NativeToaster';

export default function AuthForm() {
  console.log("%c AUTH_FORM_VERSION: 2.2 ", "background: #3b82f6; color: white; font-weight: bold; border-radius: 4px; padding: 2px 5px;");
  
  const [mode, setMode] = useState<'login' | 'register' | 'recovery' | 'success'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('Comunicaciones');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Por favor ingresa tu correo electrónico.');
      return;
    }

    // Validación de dominio
    if (!email.toLowerCase().endsWith('@iesa.edu.ve') && !['admin@iesa.edu.ve', 'gabriel.vazquez@iesa.edu.ve'].includes(email.toLowerCase())) {
      toast.error('Solo se permiten correos institucionales de @iesa.edu.ve');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        if (!password) {
          toast.error('Por favor ingresa tu contraseña.');
          setLoading(false);
          return;
        }
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        if (data?.user) {
          await supabase.from('user_profiles').upsert({
            user_id: data.user.id,
            display_name: data.user.user_metadata?.name || email.split('@')[0],
            department: data.user.user_metadata?.department || 'Comunicaciones'
          }, { onConflict: 'user_id' });
        }

        sessionStorage.setItem('pending_toast', JSON.stringify({
          message: '¡Bienvenido de nuevo! Sesión iniciada con éxito.',
          type: 'success'
        }));
        window.location.href = '/dashboard';
      } else if (mode === 'register') {
        const { score } = getPasswordStrength(password);
        if (score < 3) {
          toast.error('Por favor, elige una contraseña más fuerte.');
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: { department },
            emailRedirectTo: `${window.location.origin}/dashboard`
          }
        });
        
        if (error) throw error;

        if (data.user) {
          await supabase.from('user_profiles').upsert({
            user_id: data.user.id,
            display_name: email.split('@')[0],
            department: department
          });

          await supabase.from('system_notifications').insert([{
            title: 'Nuevo Registro',
            message: `El usuario ${email} se ha registrado bajo el área de ${department}.`,
            is_read: false
          }]);
        }
        
        setMode('success');
      } else if (mode === 'recovery') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success('Se han enviado las instrucciones a tu correo.');
        setMode('login');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error en la autenticación.');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    
    const levels = [
      { label: 'Muy débil', color: 'bg-rose-500' },
      { label: 'Débil', color: 'bg-orange-500' },
      { label: 'Normal', color: 'bg-amber-500' },
      { label: 'Fuerte', color: 'bg-emerald-500' }
    ];
    return { score, ...levels[score - 1] || levels[0] };
  };

  const strength = getPasswordStrength(password);

  const handlePasskeyLogin = async () => {
    if (!email) {
      toast.error('Por favor ingresa tu correo institucional para usar la huella.');
      return;
    }

    // Validación de dominio (igual que el login normal)
    if (!email.toLowerCase().endsWith('@iesa.edu.ve') && !['admin@iesa.edu.ve', 'gabriel.vazquez@iesa.edu.ve'].includes(email.toLowerCase())) {
      toast.error('Solo se permiten correos @iesa.edu.ve');
      return;
    }

    setLoading(true);
    try {
      // Intento de listar factores (MFA)
      // Nota técnica: Supabase requiere una sesión parcial o completa para listar factores.
      // La biometría suele ser un segundo paso.
      const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
      
      if (factorsError) {
        // Si no hay sesión, informamos al usuario sobre la limitación técnica
        if (factorsError.message.includes('not found') || factorsError.status === 401) {
          throw new Error("La huella es un método de seguridad adicional. Por favor, inicia sesión con tu contraseña primero para configurarla o usarla en este dispositivo.");
        }
        throw factorsError;
      }
      
      const webAuthnFactor = factors?.all.find(f => f.factor_type === 'webauthn' && f.status === 'verified');
      
      if (!webAuthnFactor) {
        throw new Error("No se encontró una huella registrada para este dispositivo. Inicia sesión normalmente y regístrala en tu perfil.");
      }

      // Desafío y verificación...
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: webAuthnFactor.id });
      if (challengeError) throw challengeError;

      const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
        factorId: webAuthnFactor.id,
        challengeId: challenge.id,
      });

      if (verifyError) throw verifyError;

      if (verifyData) {
        toast.success('¡Acceso concedido con biometría!');
        window.location.href = '/dashboard';
      }
    } catch (error: any) {
      toast.info(error.message || 'Error en la autenticación biométrica.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            hd: 'iesa.edu.ve',
          }
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || 'Error al conectar con Google.');
    }
  };

  if (mode === 'success') {
    return (
      <div className="w-full max-w-md p-8 md:p-10 space-y-8 bg-white dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-xl dark:shadow-[0_0_40px_rgba(0,0,0,0.5)] relative overflow-hidden text-center animate-in fade-in zoom-in duration-500">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
        
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full"></div>
            <div className="relative p-6 bg-emerald-500/10 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="w-16 h-16 text-emerald-500" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">¡Revisa tu correo!</h2>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
            Hemos enviado un enlace de confirmación a <span className="font-bold text-slate-900 dark:text-white">{email}</span>. 
            Por favor, confirma tu cuenta para poder acceder al Dashboard.
          </p>
        </div>

        <div className="pt-4">
          <button 
            onClick={() => setMode('login')}
            className="w-full py-4 px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-xl"
          >
            Volver al Inicio
          </button>
        </div>
        
        <p className="text-xs text-slate-400 pt-4">
          ¿No recibiste nada? Revisa tu carpeta de spam o contacta a soporte.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-8 md:p-10 space-y-8 bg-white dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-xl dark:shadow-[0_0_40px_rgba(0,0,0,0.5)] relative overflow-hidden">

      
      {/* Decorative gradients */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl"></div>
      
      <div className="text-center space-y-2 relative z-10">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-blue-500/10 rounded-2xl">
            <ShieldCheck className="w-10 h-10 text-blue-500" />
          </div>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-1">
          {mode === 'login' ? 'Bienvenido' : mode === 'register' ? 'Crea una cuenta' : 'Recuperar acceso'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          {mode === 'login' 
            ? <>Solo personal autorizado <span className="font-bold text-blue-500">@iesa.edu.ve</span></> 
            : mode === 'register' 
            ? 'Únete para gestionar tus analíticas' 
            : 'Te enviaremos un enlace de recuperación'}
        </p>
      </div>

      {mode !== 'recovery' && (
        <div className="space-y-4 relative z-10 pt-4">
          <button 
            type="button"
            onClick={handleGoogleLogin} 
            className="w-full flex items-center justify-center gap-3 bg-[#0a0f1c] hover:bg-black text-white py-3.5 rounded-xl font-bold transition-all hover:scale-[1.02] border border-white/5"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 24c2.87 0 5.28-.95 7.04-2.58l-3.57-2.77c-.95.64-2.17 1.02-3.47 1.02-2.67 0-4.93-1.8-5.74-4.22H2.5v2.85C4.26 21.8 7.82 24 12 24z" />
              <path fill="#FBBC05" d="M6.26 15.45c-.21-.64-.32-1.31-.32-2.02s.11-1.38.32-2.02V8.56H2.5C1.8 9.95 1.4 11.45 1.4 13.06c0 1.61.4 3.11 1.1 4.5l3.76-2.11z" />
              <path fill="#EA4335" d="M12 4.41c1.55 0 2.94.53 4.04 1.58l3.03-3.03C17.27 1.11 14.86 0 12 0 7.82 0 4.26 2.2 2.5 5.68l3.76 2.85c.81-2.42 3.07-4.12 5.74-4.12z" />
            </svg>
            Continuar con Google
          </button>

          <button 
            type="button"
            onClick={handlePasskeyLogin} 
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 py-3.5 rounded-xl font-bold transition-all hover:scale-[1.02] border border-blue-500/20"
          >
            <Fingerprint className="w-5 h-5" />
            Entrar con Huella / FaceID
          </button>
        </div>
      )}

      {mode !== 'recovery' && (
        <div className="relative py-2 z-10">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200 dark:border-white/5"></span>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
            <span className="bg-white dark:bg-[#0a0f1c] px-4 text-slate-400">O CREDENCIALES</span>
          </div>
        </div>
      )}

      <form onSubmit={handleAuth} className="space-y-5 relative z-10">
        <div className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 dark:text-slate-400" />
            <input 
              type="email" 
              placeholder="usuario@iesa.edu.ve" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 py-3.5 pl-11 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-slate-900 dark:text-white placeholder-slate-500 transition-all font-medium" 
            />
          </div>

          {mode !== 'recovery' && (
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 dark:text-slate-400" />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Contraseña" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 py-3.5 pl-11 pr-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-slate-900 dark:text-white placeholder-slate-500 transition-all font-medium" 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          )}

          {mode === 'register' && password && (
            <div className="space-y-2 px-1 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex gap-1.5 h-1.5">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i} 
                    className={`flex-1 rounded-full transition-all duration-500 ${i <= strength.score ? strength.color : 'bg-slate-200 dark:bg-white/5'}`}
                  />
                ))}
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-[10px] font-black uppercase tracking-widest ${strength.color.replace('bg-', 'text-')}`}>
                  {strength.label}
                </span>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Seguridad</span>
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div className="space-y-4 mb-4 mt-4">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1">Área de la Empresa</label>
              <div className="relative group">
                <select 
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-slate-900 dark:text-white transition-all font-medium appearance-none cursor-pointer"
                >
                  <option value="Comunicaciones">Comunicaciones</option>
                  <option value="Mercadeo">Mercadeo</option>
                  <option value="Ventas">Ventas</option>
                  <option value="RRHH">Recursos Humanos (RRHH)</option>
                  <option value="Operaciones">Operaciones</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-xs">
                  ▼
                </div>
              </div>
            </div>
          )}
        </div>

        <button 
          type="submit" 
          disabled={loading || (mode === 'register' && strength.score < 3)}
          className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-white py-3.5 rounded-xl font-bold transition-all disabled:opacity-50 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] disabled:hover:shadow-none"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          ) : (
            <>
              {mode === 'login' ? 'Entrar al Dashboard' : mode === 'register' ? 'Crear Cuenta' : 'Enviar Enlace'}
              {mode === 'login' && <span className="ml-1">→</span>}
            </>
          )}
        </button>
        {mode === 'register' && (
          <p className="text-[10px] text-center text-slate-500 dark:text-slate-400 italic px-4">
            * Al registrarte, recibirás un correo de confirmación obligatorio de Supabase para activar tu cuenta.
          </p>
        )}
      </form>

      <div className="text-center relative z-10 pt-2">
        <button 
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
        </button>
      </div>
    </div>
  );
}
