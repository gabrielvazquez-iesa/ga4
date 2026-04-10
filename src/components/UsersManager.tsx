import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { User, UserX, ShieldCheck, Search, KeyRound, AlertTriangle } from 'lucide-react';
import { nativeToast as toast } from './NativeToaster';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';

interface UserProfile {
  user_id: string;
  email?: string;
  display_name: string;
  department: string;
  has_vault_access: boolean;
  avatar_url?: string;
  is_banned?: boolean;
  last_seen?: string;
}

export default function UsersManager() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'banned'>('active');
  
  // Edit logic
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [newDept, setNewDept] = useState('');
  
  // Delete confirm state
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [deleting, setDeleting] = useState(false);

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
      .select('user_id, email, display_name, department, has_vault_access, avatar_url, is_banned, last_seen')
      .order('display_name');
    if (error) toast.error('No pudimos cargar la lista de usuarios. Por favor, refresca la página.');
    else setUsers(data || []);
    setLoading(false);
  };

  const toggleBanStatus = async (userId: string, current: boolean | undefined) => {
    const action = !current ? 'desincorporar' : 'reactivar';
    if (!window.confirm(`¿Estás seguro de que deseas ${action} a este usuario?`)) return;

    const { error } = await supabase.from('user_profiles').update({ is_banned: !current }).eq('user_id', userId);
    if (error) toast.error('Hubo un pequeño inconveniente al cambiar el estado del usuario.');
    else { toast.success(`¡Hecho! El usuario ha sido ${!current ? 'desincorporado' : 'reactivado'} correctamente.`); fetchUsers(); }
  };

  const toggleVaultAccess = async (userId: string, current: boolean) => {
    const action = !current ? 'conceder' : 'revocar';
    if (!window.confirm(`¿Deseas ${action} el acceso a la bóveda para este usuario?`)) return;

    const { error } = await supabase.from('user_profiles').update({ has_vault_access: !current }).eq('user_id', userId);
    if (error) toast.error('No fue posible modificar los permisos en este momento.');
    else { toast.success(`¡Listo! El acceso a la bóveda ha sido ${!current ? 'concedido' : 'revocado'} exitosamente.`); fetchUsers(); }
  };

  const handleUpdateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const { error } = await supabase.from('user_profiles').update({ department: newDept }).eq('user_id', editingUser.user_id);
    if (error) toast.error('Lo sentimos, no pudimos actualizar el departamento. Inténtalo de nuevo.');
    else {
      toast.success('¡Perfecto! El departamento se ha actualizado sin problemas.');
      setEditingUser(null);
      fetchUsers();
    }
  };
  
  const deleteUserPermanently = async () => {
    if (!userToDelete) return;
    
    setDeleting(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    try {
      const resp = await fetch(`/api/delete-user?userId=${userToDelete.user_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const resData = await resp.json();
      
      if (!resp.ok) throw new Error(resData.error || 'Error al eliminar');

      toast.success('¡Usuario eliminado permanentemente del sistema!');
      setUserToDelete(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Error al procesar la eliminación definitiva.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.display_name || '').toLowerCase().includes(search.toLowerCase()) ||
                          (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
                          (u.department || '').toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === 'active' ? !u.is_banned : u.is_banned;
    return matchesSearch && matchesTab;
  });

  const isOnline = (lastSeen?: string) => {
    if (!lastSeen) return false;
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastSeenDate.getTime()) / (1000 * 60);
    return diffMinutes < 5; // Verde si estuvo activo en los últimos 5 mins
  };

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

      {/* Tabs and Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex bg-white/80 dark:bg-slate-900/60 p-1 border border-slate-200 dark:border-white/10 rounded-2xl w-full md:w-auto">
          <button 
            onClick={() => setActiveTab('active')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'active' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-500 hover:text-slate-700 dark:hover:text-white'}`}
          >
            Usuarios Activos
          </button>
          <button 
            onClick={() => setActiveTab('banned')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'banned' ? 'bg-red-600 text-white shadow-lg shadow-red-500/30' : 'text-slate-500 hover:text-slate-700 dark:hover:text-white'}`}
          >
            Desincorporados
          </button>
        </div>

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
                <th className="py-3 px-6 w-[20%]">Usuario</th>
                <th className="py-3 px-6 w-[25%]">Correo</th>
                <th className="py-3 px-6 w-[15%] text-center">Departamento</th>
                <th className="py-3 px-6 text-center w-20">Bóveda</th>
                <th className="py-3 px-6 text-center w-[25%]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
              {filteredUsers.map(user => (
                <tr key={user.user_id} className={`hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${user.is_banned ? 'opacity-50' : ''}`}>
                  {/* Avatar + Name */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                          {user.avatar_url
                            ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                            : <User className="w-5 h-5 text-blue-400" />}
                        </div>
                        {/* Status Dot */}
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 border-2 border-white dark:border-slate-900 rounded-full ${isOnline(user.last_seen) ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-slate-400 dark:bg-slate-600'}`} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm leading-tight">{user.display_name || 'Sin nombre'}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-wider mt-0.5">
                          {isOnline(user.last_seen) ? 'En Línea' : 'Desconectado'}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="py-4 px-6">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 break-all">
                      {user.email || '—'}
                    </p>
                  </td>

                  {/* Department */}
                  <td className="py-4 px-6">
                    <button 
                      onClick={() => { setEditingUser(user); setNewDept(user.department || ''); }}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"
                    >
                      {user.department || 'Sin Dept.'}
                    </button>
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
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => toggleBanStatus(user.user_id, user.is_banned)}
                        className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all ${
                          user.is_banned
                            ? 'bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20'
                            : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {user.is_banned ? 'Reactivar' : 'Baja'}
                      </button>

                      {user.is_banned && (
                        <button
                          onClick={() => setUserToDelete(user)}
                          className="p-1.5 bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white border border-rose-600/20 rounded-lg transition-all"
                          title="ELIMINACIÓN DEFINITIVA"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      )}
                    </div>
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

      {/* Modal Edición Departamento */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <form onSubmit={handleUpdateDept} className="bg-white dark:bg-slate-950 border dark:border-white/10 w-full max-w-sm rounded-[2rem] p-8 shadow-2xl relative">
            <button type="button" onClick={() => setEditingUser(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-white/5 w-8 h-8 rounded-full flex items-center justify-center">✕</button>
            <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white text-center">Editar Departamento</h2>
            <p className="text-sm text-slate-500 mb-6 text-center">Asignar área para: <b>{editingUser.display_name}</b></p>
            
            <div className="mb-6">
              <CustomSelect
                value={newDept}
                onChange={v => setNewDept(v)}
                placeholder="Seleccionar departamento..."
                options={['Mercadeo', 'Comunicaciones', 'Tecnología', 'Ventas', 'Innovación', 'Incompany', 'RRHH'].map(d => ({ value: d, label: d }))}
              />
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setEditingUser(null)} className="flex-1 py-3.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                Cancelar
              </button>
              <button type="submit" className="flex-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-blue-500/20">
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Confirmación Borrado Definitivo */}
      <Dialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-950 border-slate-200 dark:border-white/10 rounded-[2rem] p-0 overflow-hidden shadow-2xl">
          <div className="bg-rose-600 h-2 w-full"></div>
          
          <div className="p-8">
            <DialogHeader className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center border border-rose-500/20 mb-2">
                <AlertTriangle className="w-8 h-8 text-rose-500" />
              </div>
              <DialogTitle className="text-2xl font-black text-center text-slate-900 dark:text-white">
                ADVERTENCIA CRÍTICA
              </DialogTitle>
              <DialogDescription className="text-center text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                ¿Estás <span className="font-bold text-slate-900 dark:text-white">ABSOLUTAMENTE SEGURO</span> de eliminar definitivamente a <span className="font-bold text-rose-500 break-all">{userToDelete?.display_name || userToDelete?.email || 'este usuario'}</span>?
                <br /><br />
                Esta acción <span className="underline decoration-rose-500">no se puede deshacer</span>. Se borrará su cuenta de acceso de Supabase y todo su perfil del sistema de forma permanente.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="mt-8 flex gap-3 sm:justify-center">
              <Button
                variant="outline"
                onClick={() => setUserToDelete(null)}
                disabled={deleting}
                className="flex-1 py-6 rounded-2xl border-slate-200 dark:border-white/10 dark:text-white font-bold hover:bg-slate-100 dark:hover:bg-white/5"
              >
                Cancelar
              </Button>
              <Button
                onClick={deleteUserPermanently}
                disabled={deleting}
                className="flex-2 py-6 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-lg shadow-rose-500/20"
              >
                {deleting ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  'Eliminar Permanentemente'
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Custom styled dropdown ────────────────────────
interface SelectOption { value: string; label: string; }
function CustomSelect({ value, onChange, options, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 py-3 px-4 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all cursor-pointer"
      >
        <span className={selected ? '' : 'text-slate-400'}>{selected?.label || placeholder || 'Seleccionar...'}</span>
        <svg className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto">
          {placeholder && (
            <button type="button" onClick={() => { onChange(''); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-sm text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
              {placeholder}
            </button>
          )}
          {options.map(o => (
            <button
              key={o.value}
              type="button"
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                o.value === value
                  ? 'bg-blue-600/10 text-blue-500 font-semibold cursor-default'
                  : 'text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
