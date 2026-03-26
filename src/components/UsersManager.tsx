import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, UserX, AlertCircle, Search, ShieldCheck, Mail, Calendar } from 'lucide-react';
import { Toaster, toast } from 'sonner';

interface UserProfile {
  id: string; // the record id
  user_id: string; // auth.users id
  display_name: string;
  avatar_url: string;
  is_banned?: boolean;
  created_at?: string;
}

export default function UsersManager() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    checkAdminAndFetch();
  }, []);

  const checkAdminAndFetch = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const email = session?.user?.email || '';
    const admin = ['admin@iesa.edu.ve', 'gabriel.vazquez@iesa.edu.ve'].includes(email.toLowerCase());
    setIsAdmin(admin);

    if (admin) {
      fetchUsers();
    } else {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('display_name', { ascending: true });

      if (error) {
        if (error.code === '42P01') {
          toast.error('La tabla user_profiles no existe en la base de datos.');
        } else {
          throw error;
        }
      } else {
        // En un entorno real, cruzaríamos con auth.users, pero aquí mostramos los perfiles públicos.
        setUsers(data || []);
      }
    } catch (error: any) {
      console.error(error);
      toast.error('Error al cargar los usuarios.');
    } finally {
      setLoading(false);
    }
  };

  const toggleBanStatus = async (userId: string, currentStatus: boolean | undefined) => {
    try {
      // Intentamos actualizar la columna is_banned. Si no existe, fallará.
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_banned: !currentStatus })
        .eq('user_id', userId);

      if (error) {
        if (error.code === '42703') { // column does not exist
           toast.error('La columna "is_banned" no existe en user_profiles. Pídele al admin de DB que la agregue.');
        } else {
          throw error;
        }
      } else {
        toast.success(`Usuario ${!currentStatus ? 'desincorporado' : 'reactivado'} con éxito.`);
        fetchUsers();
      }
    } catch (error: any) {
      toast.error('Error al actualizar el estado: ' + error.message);
    }
  };

  const filteredUsers = users.filter(u => 
    (u.display_name || 'Sin nombre').toLowerCase().includes(search.toLowerCase())
  );

  if (!loading && !isAdmin) {
    return (
      <div className="flex justify-center py-20">
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-8 rounded-2xl max-w-md text-center shadow-xl">
          <ShieldCheck className="w-16 h-16 mx-auto mb-4 text-red-500/50" />
          <h2 className="text-2xl font-bold mb-2">Acceso Denegado</h2>
          <p>Esta sección está restringida únicamente para los administradores del sistema.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster theme="dark" position="top-right" />
      
      {/* Search Bar */}
      <div className="flex bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl items-center p-2 w-full max-w-md focus-within:ring-1 focus-within:ring-blue-500/50 focus-within:border-blue-500/50 transition-all shadow-lg">
        <Search className="w-5 h-5 text-slate-500 shrink-0 ml-2" />
        <input 
          type="text" 
          placeholder="Buscar usuarios por nombre..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-none outline-none text-sm text-slate-900 dark:text-white placeholder-slate-500 ml-3 w-full py-2"
        />
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-slate-300 dark:border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-20 px-4 bg-white dark:bg-slate-900/30 rounded-2xl border border-slate-200 dark:border-white/5 border-dashed">
          <User className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">No se encontraron usuarios</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {search ? 'Intenta buscar con otros términos.' : 'No hay perfiles registrados en la plataforma.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredUsers.map(user => (
            <div key={user.id} className="bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 p-6 rounded-2xl backdrop-blur-sm shadow-xl hover:bg-white/95 dark:hover:bg-slate-900/80 transition-colors relative overflow-hidden flex flex-col items-center text-center">
              {user.is_banned && (
                <div className="absolute top-0 right-0 px-3 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded-bl-lg">Desincorporado</div>
              )}
              
              <div className="w-20 h-20 rounded-full border-4 border-white dark:border-slate-950 bg-slate-100 dark:bg-slate-800 shadow-xl overflow-hidden flex items-center justify-center mb-4 shrink-0">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-slate-500" />
                )}
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">{user.display_name || 'Autenticado'}</h3>
              <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-mono tracking-wider mb-4 border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950/50 px-2 py-1 rounded">
                ID: {user.user_id?.split('-')[0]}...
              </div>

              <div className="mt-auto w-full pt-4 border-t border-slate-200 dark:border-white/5">
                <button 
                  onClick={() => toggleBanStatus(user.user_id, user.is_banned)}
                  className={`w-full flex justify-center items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    user.is_banned 
                    ? 'bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20' 
                    : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
                  }`}
                >
                  {user.is_banned ? (
                    'Reactivar Acceso'
                  ) : (
                    <><UserX className="w-4 h-4" /> Desincorporar</>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
