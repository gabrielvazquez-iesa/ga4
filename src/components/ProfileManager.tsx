import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, Mail, Lock, Camera, Link as LinkIcon, Save, RefreshCw } from 'lucide-react';
import { Toaster, toast } from 'sonner';

interface ProfileData {
  id?: string;
  user_id: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  linkedin_url: string;
  twitter_url: string;
}

export default function ProfileManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  
  // States for Password Change
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // States for Profile Data
  const [profile, setProfile] = useState<ProfileData>({
    user_id: '',
    display_name: '',
    bio: '',
    avatar_url: '',
    linkedin_url: '',
    twitter_url: ''
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      
      setUserId(session.user.id);
      setUserEmail(session.user.email || '');
      setIsAdmin(['admin@iesa.edu.ve', 'gabriel.vazquez@iesa.edu.ve'].includes((session.user.email || '').toLowerCase()));

      // Attempt to load extended profile form custom table 'user_profiles'
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error && error.code !== '42P01') {
        console.error('Error fetching profile', error);
      } else if (data) {
        setProfile(data);
      } else {
        // Init empty
        setProfile(p => ({ ...p, user_id: session.user.id }));
      }

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Upsert profile data
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: userId,
          display_name: profile.display_name,
          bio: profile.bio,
          avatar_url: profile.avatar_url,
          linkedin_url: profile.linkedin_url,
          twitter_url: profile.twitter_url
        });
      
      if (error) {
        if (error.code === '42P01') {
          toast.error('La tabla user_profiles no existe en la base de datos.');
        } else {
          throw error;
        }
      } else {
        toast.success('Perfil actualizado correctamente.');
      }
    } catch (error: any) {
      toast.error('Error al guardar: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success('Contraseña actualizada con éxito');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error('Error al cambiar contraseña: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-slate-300 dark:border-slate-700 border-t-blue-500 rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="space-y-8">
      <Toaster theme="dark" position="top-right" />

      {/* Header Profile Card */}
      <div className="bg-white/80 dark:bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl p-8 backdrop-blur-sm shadow-xl flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
        
        <div className="relative group shrink-0">
          <div className="w-32 h-32 rounded-full border-4 border-slate-950 bg-slate-800 shadow-xl overflow-hidden flex items-center justify-center relative">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-16 h-16 text-slate-500" />
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
              <Camera className="w-8 h-8 text-slate-900 dark:text-white" />
            </div>
          </div>
        </div>

        <div className="flex-1 text-center md:text-left space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">{profile.display_name || 'Usuario GA4'}</h2>
          <div className="flex items-center justify-center md:justify-start gap-2 text-slate-500 dark:text-slate-400">
            <Mail className="w-4 h-4" />
            <span>{userEmail}</span>
          </div>
          <div className="pt-2 flex flex-wrap gap-2 justify-center md:justify-start">
            <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg border ${isAdmin ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'}`}>
              {isAdmin ? 'Administrador' : 'Visualizador'}
            </span>
            <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg border bg-green-500/10 text-green-400 border-green-500/20">
              Activo
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulario de Información Personal */}
        <div className="bg-white/80 dark:bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-xl">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-500" />
            Información Pública
          </h3>
          <form onSubmit={handleProfileSave} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">Nombre a mostrar</label>
              <input type="text" value={profile.display_name} onChange={e => setProfile({...profile, display_name: e.target.value})} className="w-full bg-slate-50 dark:bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 py-2.5 px-4 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white" placeholder="Ej. Juan Pérez" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">URL de Foto de Perfil</label>
              <input type="url" value={profile.avatar_url} onChange={e => setProfile({...profile, avatar_url: e.target.value})} className="w-full bg-slate-50 dark:bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 py-2.5 px-4 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white" placeholder="https://..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">LinkedIn</label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type="text" value={profile.linkedin_url} onChange={e => setProfile({...profile, linkedin_url: e.target.value})} className="w-full bg-slate-50 dark:bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 py-2.5 pl-10 pr-4 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white" placeholder="usuario-linkedin" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">X (Twitter)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">@</span>
                  <input type="text" value={profile.twitter_url} onChange={e => setProfile({...profile, twitter_url: e.target.value})} className="w-full bg-slate-50 dark:bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 py-2.5 pl-10 pr-4 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white" placeholder="usuario_x" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">Biografía corta</label>
              <textarea rows={3} value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} className="w-full bg-slate-50 dark:bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 py-2.5 px-4 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white resize-none" placeholder="Escribe algo sobre ti..."></textarea>
            </div>

            <div className="pt-2">
              <button type="submit" disabled={saving} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white py-2.5 px-6 rounded-lg font-bold transition-all disabled:opacity-50">
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Guardar Perfil
              </button>
            </div>
          </form>
        </div>

        {/* Security Settings */}
        <div className="space-y-8">
          <div className="bg-white/80 dark:bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-xl">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-500" />
              Seguridad
            </h3>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">Nueva Contraseña</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-slate-50 dark:bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 py-2.5 px-4 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white" placeholder="Min. 6 caracteres" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">Confirmar Contraseña</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full bg-slate-50 dark:bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 py-2.5 px-4 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white" placeholder="Repite la contraseña" />
              </div>
              <div className="pt-2">
                <button type="submit" disabled={saving || !newPassword} className="bg-slate-800 hover:bg-slate-700 text-slate-900 dark:text-white py-2.5 px-6 rounded-lg font-bold transition-all">
                  Actualizar Contraseña
                </button>
              </div>
            </form>
          </div>

          {/* Preferences */}
          <div className="bg-white/80 dark:bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Preferencias</h3>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white dark:bg-slate-950/50 flex justify-between items-center">
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Notificaciones por email</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Recibe reportes semanales</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
