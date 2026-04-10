import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { apiFetch } from '../lib/api-fetch';
import { KeyRound, Plus, Edit2, Trash2, Eye, EyeOff, Search, ExternalLink, RefreshCw, AlertCircle, LayoutGrid, List, Shield, ShieldAlert, ShieldCheck, User, Clock, LogOut } from 'lucide-react';
import { nativeToast as toast } from './NativeToaster';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';

interface Credential {
  id: string;
  service_name: string;
  username: string;
  password_hash: string;
  url: string;
  notes: string;
  is_deleted: boolean;
  created_at: string;
}

export default function VaultManager() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [search, setSearch] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Inactivity State
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [timeoutCountdown, setTimeoutCountdown] = useState(30);
  const activityTimeoutRef = useRef<any>(null);
  const warningCountdownRef = useRef<any>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    service_name: '',
    username: '',
    password_hash: '',
    url: '',
    notes: ''
  });

  // Reset activity on events
  const resetActivity = useCallback(() => {
    if (!showTimeoutWarning) {
      setLastActivity(Date.now());
    }
  }, [showTimeoutWarning]);

  useEffect(() => {
    if (!hasAccess) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(name => window.addEventListener(name, resetActivity));

    const checkInactivity = setInterval(() => {
      const now = Date.now();
      const diffSinceLastActivity = now - lastActivity;
      
      // 5 minutes = 300,000 ms
      if (diffSinceLastActivity > 300000 && !showTimeoutWarning) {
        setShowTimeoutWarning(true);
        setTimeoutCountdown(30);
      }
    }, 10000); // Check every 10s

    return () => {
      events.forEach(name => window.removeEventListener(name, resetActivity));
      clearInterval(checkInactivity);
    };
  }, [lastActivity, hasAccess, showTimeoutWarning, resetActivity]);

  // Warning countdown logic
  useEffect(() => {
    if (showTimeoutWarning) {
      warningCountdownRef.current = setInterval(() => {
        setTimeoutCountdown(prev => {
          if (prev <= 1) {
            clearInterval(warningCountdownRef.current);
            handleTimeoutLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (warningCountdownRef.current) clearInterval(warningCountdownRef.current);
    }
    return () => {
      if (warningCountdownRef.current) clearInterval(warningCountdownRef.current);
    };
  }, [showTimeoutWarning]);

  const handleTimeoutLogout = () => {
    // We can either redirect to dashboard or just lock the vault
    toast.error('Tu sesión en la bóveda ha expirado por inactividad para proteger tus datos.');
    window.location.href = '/analytics'; // Redirect to a safe general page
  };

  const handleKeepPresent = () => {
    setShowTimeoutWarning(false);
    setLastActivity(Date.now());
  };

  useEffect(() => {
    checkUserAndFetch();
  }, []);

  const checkUserAndFetch = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      
      if (!user) {
        setLoading(false);
        return;
      }

      const email = user.email || '';
      const adminEmails = ['admin@iesa.edu.ve', 'gabriel.vazquez@iesa.edu.ve'];
      const isSystemAdmin = adminEmails.includes(email.toLowerCase());
      setIsAdmin(isSystemAdmin);

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setUserProfile(profile);

      const canAccess = isSystemAdmin || 
                       ['Mercadeo', 'Comunicaciones'].includes(profile?.department) || 
                       profile?.has_vault_access === true;
      
      setHasAccess(canAccess);

      if (canAccess) {
        await fetchCredentials();
      }
    } catch (error) {
      console.error('Error in checkUserAndFetch:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCredentials = async () => {
    try {
      const res = await apiFetch('/api/vault-secure');
      const json = await res.json();
      
      if (json.error) throw new Error(json.error);
      setCredentials(json.data || []);
    } catch (error: any) {
      console.error(error);
      toast.error('No pudimos cargar las credenciales en este momento. Por favor, intenta de nuevo más tarde.');
    }
  };

  const filteredCredentials = credentials.filter(c => {
    const matchesSearch = c.service_name.toLowerCase().includes(search.toLowerCase()) || 
                          c.username.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (showDeleted ? c.is_deleted : !c.is_deleted);
  });

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error('Lo sentimos, solo los administradores pueden realizar cambios en la bóveda.');
      return;
    }

    try {
      const method = editingId ? 'PATCH' : 'POST';
      const url = editingId ? `/api/vault-secure?id=${editingId}` : '/api/vault-secure';
      
      const res = await apiFetch(url, {
        method,
        body: JSON.stringify(formData),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const json = await res.json();
      if (json.error) throw new Error(json.error);

      toast.success(editingId ? '¡Listo! Los cambios se han guardado correctamente.' : '¡Genial! La nueva credencial ha sido registrada con éxito.');
      setIsModalOpen(false);
      resetForm();
      fetchCredentials();
    } catch (error: any) {
      toast.error('Hubo un inconveniente al procesar la solicitud. Por favor, verifica los datos e intenta de nuevo.');
    }
  };

  const resetForm = () => {
    setFormData({ service_name: '', username: '', password_hash: '', url: '', notes: '' });
    setEditingId(null);
  };

  const handleEdit = (cred: Credential) => {
    setFormData({
      service_name: cred.service_name,
      username: cred.username,
      password_hash: cred.password_hash,
      url: cred.url || '',
      notes: cred.notes || ''
    });
    setEditingId(cred.id);
    setIsModalOpen(true);
  };

  const handleSoftDelete = async (id: string) => {
    if (!isAdmin) return;
    try {
      const res = await apiFetch(`/api/vault-secure?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      
      toast.info('La credencial se ha movido a la papelera correctamente.');
      fetchCredentials();
    } catch (error: any) {
      toast.error('No fue posible eliminar la credencial. Inténtalo de nuevo en unos momentos.');
    }
  };

  const handleRestore = async (id: string) => {
    if (!isAdmin) return;
    try {
      const res = await apiFetch(`/api/vault-secure?id=${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_deleted: false }),
        headers: { 'Content-Type': 'application/json' }
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      
      toast.success('¡Hecho! La credencial ha sido restaurada con éxito.');
      fetchCredentials();
    } catch (error: any) {
      toast.error('No pudimos restaurar la credencial en este momento. Por favor, intenta de nuevo.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-20 items-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-slate-300 dark:border-slate-800 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
 <div className="space-y-6">

      {/* Security Status Bar */}
      <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-center gap-4 transition-all ${
        hasAccess ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'
      }`}>
        <div className="flex items-center gap-3 shrink-0">
          {hasAccess ? (
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
          )}
          <div>
            <h3 className="font-bold text-sm dark:text-white uppercase tracking-wider">
              {hasAccess ? 'Acceso Autorizado' : 'Acceso Restringido'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {hasAccess 
                ? `Identificado como parte de ${userProfile?.department || 'Administración'}` 
                : 'No tienes permisos para ver esta bóveda. Contacta al administrador.'}
            </p>
          </div>
        </div>

        {hasAccess && (
          <div className="flex-1 text-right flex items-center justify-end gap-3">
             <div className="flex items-center gap-2 text-[10px] text-blue-400 font-bold uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              <Clock className="w-3 h-3" />
              Sesión activa (5m inactividad)
            </div>
             <span className="text-[10px] text-green-500/80 font-bold uppercase tracking-widest bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
              Cifrado AES-256 Activo
            </span>
          </div>
        )}
      </div>

      {!hasAccess ? (
        <div className="text-center py-20 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5">
           <Shield className="w-16 h-16 text-slate-500 mx-auto mb-4 opacity-20" />
           <h2 className="text-xl font-bold dark:text-white">Bóveda Bloqueada</h2>
           <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
             Solo los departamentos de Mercadeo, Comunicaciones y Administradores tienen acceso a estas credenciales.
           </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row justify-between gap-4 items-center bg-white/80 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-white/5">
            <div className="flex bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 rounded-lg items-center px-4 py-2.5 w-full md:w-96 focus-within:border-blue-500/50 transition-colors">
              <Search className="w-4 h-4 text-slate-500 shrink-0" />
              <input 
                type="text" 
                placeholder="Buscar por servicio o usuario..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-slate-900 dark:text-white placeholder-slate-500 ml-2 w-full"
              />
            </div>

            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-1 rounded-lg">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-900 dark:text-white'}`}
                  title="Vista en Celdas"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-900 dark:text-white'}`}
                  title="Vista en Lista"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {isAdmin && (
                <button 
                  onClick={() => setShowDeleted(!showDeleted)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border ${showDeleted ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-200 dark:border-white/10 text-slate-300 hover:bg-slate-700'}`}
                >
                  {showDeleted ? 'Ver Activas' : 'Ver Papelera'}
                </button>
              )}
              {isAdmin && !showDeleted && (
                <button 
                  onClick={() => { resetForm(); setIsModalOpen(true); }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                >
                  <Plus className="w-4 h-4" />
                  Nueva Credencial
                </button>
              )}
            </div>
          </div>

          {!isAdmin && (
            <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 p-4 rounded-xl flex gap-3 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>Estás en modo visualizador. Solo administradores pueden gestionar las credenciales. Cifrado AES activado por seguridad.</p>
            </div>
          )}

          {filteredCredentials.length === 0 ? (
            <div className="text-center py-20 px-4 bg-white dark:bg-slate-900/30 rounded-2xl border border-slate-200 dark:border-white/5 border-dashed">
              <KeyRound className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">Bóveda vacía</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">No hay nada que mostrar aquí.</p>
            </div>
          ) : (
            <>
              {viewMode === 'list' ? (
                <div className="bg-white/95 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                          <th className="p-4 border-b border-slate-200 dark:border-white/5 font-semibold">Servicio</th>
                          <th className="p-4 border-b border-slate-200 dark:border-white/5 font-semibold">Usuario</th>
                          <th className="p-4 border-b border-slate-200 dark:border-white/5 font-semibold">Contraseña</th>
                          <th className="p-4 border-b border-slate-200 dark:border-white/5 font-semibold text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-white/5 text-sm">
                        {filteredCredentials.map(cred => (
                          <tr key={cred.id} className="hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group">
                            <td className="p-4 border-r border-slate-200 dark:border-white/5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                                  <KeyRound className="w-4 h-4" />
                                </div>
                                <p className="font-bold text-slate-900 dark:text-white">{cred.service_name}</p>
                              </div>
                            </td>
                            <td className="p-4 border-r border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300">{cred.username}</td>
                            <td className="p-4 border-r border-slate-200 dark:border-white/5">
                              <div className="flex items-center gap-2">
                                <span className={`font-mono transition-all ${visiblePasswords[cred.id] ? 'text-blue-400' : 'text-slate-500'}`}>
                                  {visiblePasswords[cred.id] ? cred.password_hash : '••••••••'}
                                </span>
                                <button onClick={() => togglePasswordVisibility(cred.id)} className="text-slate-500 hover:text-slate-900 dark:text-white transition-colors">
                                  {visiblePasswords[cred.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </td>
                            <td className="p-4 text-right">
                                {isAdmin && (
                                  <div className="flex justify-end gap-2">
                                    {showDeleted ? (
                                      <button onClick={() => handleRestore(cred.id)} className="text-green-400 p-1 hover:bg-green-500/10 rounded"><RefreshCw className="w-4 h-4" /></button>
                                    ) : (
                                      <>
                                        <button onClick={() => handleEdit(cred)} className="text-blue-400 p-1 hover:bg-blue-500/10 rounded"><Edit2 className="w-4 h-4" /></button>
                                        <button onClick={() => handleSoftDelete(cred.id)} className="text-red-400 p-1 hover:bg-red-500/10 rounded"><Trash2 className="w-4 h-4" /></button>
                                      </>
                                    )}
                                  </div>
                                )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredCredentials.map(cred => (
                    <div key={cred.id} className="bg-white/95 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 p-6 rounded-2xl backdrop-blur-sm shadow-xl hover:border-white/20 transition-colors group relative flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                           <KeyRound className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex-1 ml-4">{cred.service_name}</h3>
                      </div>
                      
                      <div className="space-y-3 mb-6 flex-1">
                        <div>
                          <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Usuario</label>
                          <p className="text-slate-900 dark:text-white text-sm truncate">{cred.username}</p>
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Contraseña</label>
                          <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 p-2 rounded-lg mt-1">
                             <span className="font-mono text-xs flex-1 truncate">
                               {visiblePasswords[cred.id] ? cred.password_hash : '••••••••••••'}
                             </span>
                             <button onClick={() => togglePasswordVisibility(cred.id)} className="text-slate-500">
                               {visiblePasswords[cred.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                             </button>
                          </div>
                        </div>
                      </div>

                      {isAdmin && (
                        <div className="border-t border-slate-200 dark:border-white/5 pt-4 flex justify-end gap-2">
                           <button onClick={() => handleEdit(cred)} className="p-2 text-slate-400 hover:text-blue-400 transition-colors"><Edit2 className="w-4 h-4" /></button>
                           <button onClick={() => handleSoftDelete(cred.id)} className="p-2 text-slate-400 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Timeout Warning Dialog */}
      <Dialog open={showTimeoutWarning} onOpenChange={handleKeepPresent}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-red-500/20 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-500 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 border-none" />
              ¿Sigues ahí?
            </DialogTitle>
            <DialogDescription className="py-4 font-medium dark:text-slate-300">
              Por seguridad, la sesión de la bóveda se cerrará automáticamente en <span className="text-red-500 font-bold text-lg">{timeoutCountdown}s</span> por inactividad.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="ghost" className="w-full sm:w-auto" onClick={handleTimeoutLogout}>
              Cerrar sesión ahora
            </Button>
            <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white" onClick={handleKeepPresent}>
              Seguir aquí
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Form Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-xl bg-slate-50 dark:bg-[#0d1425] border-slate-200 dark:border-white/10 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold dark:text-white flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-blue-500" />
              {editingId ? 'Editar Credencial' : 'Nueva Credencial'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={submitForm} className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Servicio *</label>
              <input 
                required type="text" placeholder="Instagram, Twitter, HubSpot..." 
                value={formData.service_name} onChange={e => setFormData({...formData, service_name: e.target.value})} 
                className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 py-2.5 px-4 rounded-lg focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-900 dark:text-white text-sm" 
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Usuario / Correo *</label>
              <input 
                required type="text" placeholder="usuario@iesa.edu.ve" 
                value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} 
                className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 py-2.5 px-4 rounded-lg focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-900 dark:text-white text-sm" 
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Contraseña *</label>
              <input 
                required type="text" placeholder="••••••••••••" 
                value={formData.password_hash} onChange={e => setFormData({...formData, password_hash: e.target.value})} 
                className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 py-2.5 px-4 rounded-lg focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-900 dark:text-white text-sm font-mono" 
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">URL</label>
              <input 
                type="url" placeholder="https://..." 
                value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} 
                className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 py-2.5 px-4 rounded-lg focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-900 dark:text-white text-sm" 
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Notas</label>
              <textarea 
                rows={2} placeholder="Observaciones adicionales..." 
                value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} 
                className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 py-2.5 px-4 rounded-lg focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-900 dark:text-white text-sm resize-none" 
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
