import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, UserX, ShieldCheck, Search, KeyRound } from 'lucide-react';
import { Toaster, toast } from 'sonner';

interface UserProfile {
  user_id: string;
  display_name: string;
  department: string;
  has_vault_access: boolean;
  avatar_url?: string;
  is_banned?: boolean;
}

export default function UsersManager() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => { checkAdminAndFetch(); }, []);

  const checkAdminAndFetch = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const email = session?.user?.email || '';
    const admin = ['admin@iesa.edu.ve', 'gabriel.vazquez@iesa.edu.ve'].includes(email.toLowerCase());
    setIsAdmin(admin);
    if (admin) fetchUsers();
    else setLoading(false);
  };

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('user_profiles')
      .select('user_id, display_name, department, has_vault_access, avatar_url, is_banned')
      .order('display_name');
    if (error) toast.error('Error al cargar los usuarios.');
    else setUsers(data || []);
    setLoading(false);
  };

  const toggleBanStatus = async (userId: string, current: boolean | undefined) => {
    const { error } = await supabase.from('user_profiles').update({ is_banned: !current }).eq('user_id', userId);
    if (error) toast.error('Error: ' + error.message);
    else { toast.success(`Usuario ${!current ? 'desincorporado' : 'reactivado'}.`); fetchUsers(); }
  };

  const toggleVaultAccess = async (userId: string, current: boolean) => {
    const { error } = await supabase.from('user_profiles').update({ has_vault_access: !current }).eq('user_id', userId);
    if (error) toast.error('Error: ' + error.message);
    else { toast.success(`Acceso a bóveda ${!current ? 'concedido' : 'revocado'}.`); fetchUsers(); }
  };

  const filteredUsers = users.filter(u =>
    (u.display_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.department || '').toLowerCase().includes(search.toLowerCase())
  );

  if (!loading && !isAdmin) {
    return (
      <div className="flex justify-center py-20">
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-8 rounded-2xl max-w-md text-center">
          <ShieldCheck className="w-16 h-16 mx-auto mb-4 text-red-500/50" />
          <h2 className="text-2xl font-bold mb-2">Acceso Denegado</h2>
          <p>Esta sección está restringida para administradores.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster theme="dark" position="top-right" />

      {/* Search */}
      <div className="flex bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl items-center px-4 py-2 w-full max-w-md shadow-sm">
        <Search className="w-4 h-4 text-slate-400 shrink-0 mr-3" />
        <input
          type="text"
          placeholder="Buscar por nombre o departamento..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-transparent outline-none text-sm text-slate-900 dark:text-white placeholder-slate-500 w-full"
        />
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <User className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>{search ? 'No se encontraron usuarios.' : 'No hay perfiles registrados.'}</p>
        </div>
      ) : (
        <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-white/5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-6 w-1/3">Usuario</th>
                <th className="py-3 px-6 w-1/4">Departamento</th>
                <th className="py-3 px-6 text-center w-24">Bóveda</th>
                <th className="py-3 px-6 text-center w-32">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
              {filteredUsers.map(user => (
                <tr key={user.user_id} className={`hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${user.is_banned ? 'opacity-50' : ''}`}>
                  {/* Avatar + Name */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 overflow-hidden">
                        {user.avatar_url
                          ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                          : <User className="w-4 h-4 text-blue-400" />}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white text-sm">{user.display_name || 'Sin nombre'}</p>
                        {user.is_banned && <span className="text-[10px] text-red-400 font-bold uppercase">Desincorporado</span>}
                      </div>
                    </div>
                  </td>

                  {/* Department */}
                  <td className="py-4 px-6">
                    <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                      {user.department || 'N/A'}
                    </span>
                  </td>

                  {/* Vault */}
                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={() => toggleVaultAccess(user.user_id, user.has_vault_access)}
                      title={user.has_vault_access ? 'Revocar acceso' : 'Dar acceso a bóveda'}
                      className={`inline-flex items-center justify-center p-2 rounded-lg transition-all ${
                        user.has_vault_access
                          ? 'bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/20'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-400 border border-slate-200 dark:border-white/10 hover:text-slate-600'
                      }`}
                    >
                      <KeyRound className="w-4 h-4" />
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={() => toggleBanStatus(user.user_id, user.is_banned)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                        user.is_banned
                          ? 'bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20'
                          : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
                      }`}
                    >
                      {user.is_banned ? 'Reactivar' : 'Desincorporar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="px-6 py-3 bg-slate-50 dark:bg-slate-950/30 border-t border-slate-200 dark:border-white/5 text-xs text-slate-500">
            {filteredUsers.length} usuario{filteredUsers.length !== 1 ? 's' : ''} registrado{filteredUsers.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
}
