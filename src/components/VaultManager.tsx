import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { KeyRound, Plus, Edit2, Trash2, Eye, EyeOff, Search, ExternalLink, RefreshCw, AlertCircle, LayoutGrid, List } from 'lucide-react';
import { Toaster, toast } from 'sonner';

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
  const [showDeleted, setShowDeleted] = useState(false);
  const [search, setSearch] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

  useEffect(() => {
    checkUserAndFetch();
  }, []);

  const checkUserAndFetch = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const email = session?.user?.email || '';
    setIsAdmin(['admin@iesa.edu.ve', 'gabriel.vazquez@iesa.edu.ve'].includes(email.toLowerCase()));
    fetchCredentials();
  };

  const fetchCredentials = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vault_credentials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === '42P01') {
          // Table doesn't exist
          toast.error('La tabla vault_credentials no existe en Supabase. Contacta al administrador para crearla.');
        } else {
          throw error;
        }
      } else {
        setCredentials(data || []);
      }
    } catch (error: any) {
      console.error(error);
      toast.error('Error al cargar las credenciales.');
    } finally {
      setLoading(false);
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
    if (!isAdmin) return;

    try {
      if (editingId) {
        const { error } = await supabase
          .from('vault_credentials')
          .update(formData)
          .eq('id', editingId);
        if (error) throw error;
        toast.success('Credencial actualizada de forma segura.');
      } else {
        const { error } = await supabase
          .from('vault_credentials')
          .insert([{ ...formData, is_deleted: false }]);
        if (error) throw error;
        toast.success('Nueva credencial guardada.');
      }
      setIsModalOpen(false);
      resetForm();
      fetchCredentials();
    } catch (error: any) {
      toast.error('Error: ' + error.message);
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
      const { error } = await supabase
        .from('vault_credentials')
        .update({ is_deleted: true })
        .eq('id', id);
      if (error) throw error;
      toast.info('Credencial enviada a la papelera.');
      fetchCredentials();
    } catch (error: any) {
      toast.error('Error: ' + (error.message || 'No se pudo eliminar.'));
    }
  };

  const handleRestore = async (id: string) => {
    if (!isAdmin) return;
    try {
      const { error } = await supabase
        .from('vault_credentials')
        .update({ is_deleted: false })
        .eq('id', id);
      if (error) throw error;
      toast.success('Credencial restaurada.');
      fetchCredentials();
    } catch (error: any) {
      toast.error('Error: ' + (error.message || 'No se pudo restaurar.'));
    }
  };

  return (
    <div className="space-y-6">
      <Toaster theme="dark" position="top-right" />
      
      {/* Header Controls */}
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
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-white'}`}
              title="Vista en Celdas"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-white'}`}
              title="Vista en Lista"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {isAdmin && (
            <button 
              onClick={() => setShowDeleted(!showDeleted)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border ${showDeleted ? 'bg-indigo-600 border-indigo-500 text-slate-900 dark:text-white' : 'bg-slate-800 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-700'}`}
            >
              {showDeleted ? 'Ver Activas' : 'Ver Papelera'}
            </button>
          )}
          {isAdmin && !showDeleted && (
            <button 
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white text-sm font-medium rounded-lg transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)]"
            >
              <Plus className="w-4 h-4" />
              Nueva Credencial
            </button>
          )}
        </div>
      </div>

      {/* Warning admin */}
      {!isAdmin && (
        <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 p-4 rounded-xl flex gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>Estás en modo visualizador. Solo el Administrador puede agregar, editar o eliminar credenciales de la bóveda.</p>
        </div>
      )}

      {/* Grid of Credentials */}
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-slate-300 dark:border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : filteredCredentials.length === 0 ? (
        <div className="text-center py-20 px-4 bg-white dark:bg-slate-900/30 rounded-2xl border border-slate-200 dark:border-white/5 border-dashed">
          <KeyRound className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">No se encontraron credenciales</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {search ? 'Intenta buscar con otros términos.' : showDeleted ? 'La papelera está vacía.' : 'La bóveda está vacía actualmente.'}
          </p>
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
                      <th className="p-4 border-b border-slate-200 dark:border-white/5 font-semibold">Fecha</th>
                      {isAdmin && <th className="p-4 border-b border-slate-200 dark:border-white/5 font-semibold text-right">Acciones</th>}
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
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                {cred.service_name}
                                {cred.url && <a href={cred.url} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300"><ExternalLink className="w-3 h-3" /></a>}
                              </p>
                              {showDeleted && <span className="text-[10px] uppercase font-bold text-red-400 bg-red-500/20 px-1.5 py-0.5 rounded">Eliminado</span>}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 border-r border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 break-all">{cred.username}</td>
                        <td className="p-4 border-r border-slate-200 dark:border-white/5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-600 dark:text-slate-300 tracking-wider">
                              {visiblePasswords[cred.id] ? cred.password_hash : '••••••••'}
                            </span>
                            <button onClick={() => togglePasswordVisibility(cred.id)} className="text-slate-500 hover:text-slate-900 dark:text-white transition-colors">
                              {visiblePasswords[cred.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                        <td className="p-4 border-r border-slate-200 dark:border-white/5 text-slate-500 text-xs">
                          {new Date(cred.created_at).toLocaleDateString()}
                        </td>
                        {isAdmin && (
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              {showDeleted ? (
                                <button onClick={() => handleRestore(cred.id)} className="p-1.5 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors" title="Restaurar">
                                  <RefreshCw className="w-4 h-4" />
                                </button>
                              ) : (
                                <>
                                  <button onClick={() => handleEdit(cred)} className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg transition-colors" title="Editar">
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => handleSoftDelete(cred.id)} className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Eliminar">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCredentials.map(cred => (
                <div key={cred.id} className="bg-white/95 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 p-6 rounded-2xl backdrop-blur-sm shadow-xl hover:border-white/20 transition-colors group relative overflow-hidden">
                  {showDeleted && <div className="absolute top-0 right-0 px-3 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded-bl-lg">Eliminado</div>}
                  
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{cred.service_name}</h3>
                      <a href={cred.url} target="_blank" rel="noreferrer" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                        {cred.url || 'Sin URL'} {cred.url && <ExternalLink className="w-3 h-3" />}
                      </a>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                      <KeyRound className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div>
                      <label className="text-xs text-slate-500 font-medium uppercase tracking-wider">Usuario / Email</label>
                      <div className="text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/50 px-3 py-2 rounded-lg text-sm mt-1 border border-slate-200 dark:border-white/5 break-all">
                        {cred.username}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 font-medium uppercase tracking-wider">Contraseña</label>
                      <div className="flex gap-2 mt-1">
                        <div className="flex-1 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/50 px-3 py-2 rounded-lg text-sm border border-slate-200 dark:border-white/5 font-mono tracking-wider break-all">
                          {visiblePasswords[cred.id] ? cred.password_hash : '••••••••••••••••'}
                        </div>
                        <button 
                          onClick={() => togglePasswordVisibility(cred.id)}
                          className="px-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/5 transition-colors"
                        >
                          {visiblePasswords[cred.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    {cred.notes && (
                      <div>
                        <label className="text-xs text-slate-500 font-medium uppercase tracking-wider">Notas</label>
                        <div className="text-slate-500 dark:text-slate-400 text-sm mt-1 line-clamp-2">{cred.notes}</div>
                      </div>
                    )}
                  </div>

                  {isAdmin && (
                    <div className="flex justify-end gap-2 border-t border-slate-200 dark:border-white/5 pt-4 mt-auto">
                      {showDeleted ? (
                        <button 
                          onClick={() => handleRestore(cred.id)}
                          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors border border-green-500/20"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Restaurar
                        </button>
                      ) : (
                        <>
                          <button 
                            onClick={() => handleEdit(cred)}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Editar
                          </button>
                          <button 
                            onClick={() => handleSoftDelete(cred.id)}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Eliminar
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0f172a] w-full max-w-lg rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden text-slate-900 dark:text-white">
            <div className="p-6 border-b border-slate-200 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{editingId ? 'Editar Credencial' : 'Nueva Credencial'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-slate-900 dark:text-white transition-colors">✕</button>
            </div>
            
            <form onSubmit={submitForm} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">Nombre del Servicio *</label>
                <input required type="text" value={formData.service_name} onChange={e => setFormData({...formData, service_name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 py-2.5 px-4 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white placeholder-slate-600" placeholder="Ej. Google Analytics, Hubspot" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">Usuario / Email *</label>
                  <input required type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 py-2.5 px-4 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">Contraseña *</label>
                  <input required type="password" value={formData.password_hash} onChange={e => setFormData({...formData, password_hash: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 py-2.5 px-4 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white font-mono" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">URL de acceso</label>
                <input type="url" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 py-2.5 px-4 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white placeholder-slate-600" placeholder="https://" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">Notas adicionales</label>
                <textarea rows={3} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 py-2.5 px-4 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white resize-none"></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-white/5">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg transition-colors">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white rounded-lg transition-colors shadow-lg shadow-blue-500/20">
                  {editingId ? 'Guardar Cambios' : 'Crear Credencial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
