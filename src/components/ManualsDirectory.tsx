import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Search, Plus, BookOpen, Trash2, ExternalLink, Tag, 
  Edit3, Folder, FileText, ChevronRight, Clock, MoreVertical,
  ArrowUpRight, Download, Filter, X, LayoutGrid, List, Eye
} from 'lucide-react';
import { nativeToast as toast } from './NativeToaster';

export default function ManualsDirectory() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [manuals, setManuals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');

  const [viewingManual, setViewingManual] = useState<any | null>(null);

  useEffect(() => {
    checkContext();
    fetchManuals();
  }, []);

  const checkContext = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const email = session?.user?.email || '';
    setIsAdmin(['admin@iesa.edu.ve', 'gabriel.vazquez@iesa.edu.ve'].includes(email.toLowerCase()));
  };

  const fetchManuals = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('process_manuals').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setManuals(data);
    }
    setLoading(false);
  };

  const categories = useMemo(() => {
    const cats = Array.from(new Set(manuals.map(m => m.category))).filter(Boolean) as string[];
    return cats.sort();
  }, [manuals]);

  const recentManuals = useMemo(() => {
    return [...manuals].slice(0, 3);
  }, [manuals]);

  const filtered = useMemo(() => {
    return manuals.filter(m => 
      (selectedCat === null || m.category === selectedCat) &&
      (search === '' || m.title.toLowerCase().includes(search.toLowerCase()) || m.category.toLowerCase().includes(search.toLowerCase()))
    );
  }, [manuals, selectedCat, search]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !newTitle || !newCategory) {
      toast.error('Por favor, completa todos los campos.');
      return;
    }
    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      // Sanitize category for storage path (remove accents, spaces, etc)
      const safeCategory = newCategory.trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '_')
        .replace(/[^\w.-]/g, '');
        
      const filePath = `${safeCategory}/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('manuals').upload(filePath, file);
      
      if (uploadError) {
        // Detailed error reporting
        console.error("Storage Error:", uploadError);
        throw new Error(`Error de Storage: ${uploadError.message}. Verifica si existe el bucket 'manuals'.`);
      }

      const { data: urlData } = supabase.storage.from('manuals').getPublicUrl(filePath);

      const { data: { session } } = await supabase.auth.getSession();
      
      const { error: dbError } = await supabase.from('process_manuals').insert({
        title: newTitle.trim(),
        category: newCategory.trim(),
        file_url: urlData.publicUrl,
        uploaded_by: session?.user?.id
      });

      if (dbError) {
        console.error("DB Error:", dbError);
        throw new Error(`Error de Base de Datos: ${dbError.message}`);
      }

      toast.success('Manual publicado con éxito.');
      setShowUploadModal(false);
      setNewTitle('');
      setNewCategory('');
      setFile(null);
      fetchManuals();
    } catch (err: any) {
      toast.error(err.message || 'Error desconocido al subir el manual.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar este manual?')) return;
    try {
      const { error } = await supabase.from('process_manuals').delete().eq('id', id);
      if (error) throw error;
      fetchManuals();
      toast.success('Manual eliminado.');
    } catch (err: any) {
      toast.error('No se pudo eliminar el manual.');
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId || !editTitle || !editCategory) return;
    setUploading(true);
    try {
      const { error } = await supabase.from('process_manuals').update({
        title: editTitle.trim(),
        category: editCategory.trim(),
        updated_at: new Date().toISOString()
      }).eq('id', editId);
      
      if (error) throw error;
      
      toast.success('Cambios guardados.');
      setEditId(null);
      fetchManuals();
    } catch (err: any) {
      toast.error('Error al actualizar.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-700 pb-20">
      
      {/* Sidebar - Folder Structure */}
      <div className="w-full lg:w-72 space-y-6">
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 rounded-[2rem] p-6 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Categorías</h3>
            <Folder className="w-4 h-4 text-slate-400" />
          </div>
          
          <nav className="space-y-1">
            <button 
              onClick={() => setSelectedCat(null)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${selectedCat === null ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400'}`}
            >
              <LayoutGrid className="w-4 h-4" /> Todos
            </button>
            
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-bold text-sm ${selectedCat === cat ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400'}`}
              >
                <div className="flex items-center gap-3">
                  <Folder className={`w-4 h-4 ${selectedCat === cat ? 'text-white' : 'text-indigo-500'}`} />
                  <span className="truncate">{cat}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${selectedCat === cat ? 'bg-white/20' : 'bg-slate-100 dark:bg-white/5'}`}>
                  {manuals.filter(m => m.category === cat).length}
                </span>
              </button>
            ))}
          </nav>

          {isAdmin && (
            <button 
              onClick={() => setShowUploadModal(true)}
              className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl transition-all shadow-lg shadow-emerald-600/20"
            >
              <Plus className="w-5 h-5" /> Subir Nuevo
            </button>
          )}
        </div>

        {/* Stats/Info */}
        <div className="hidden lg:block bg-indigo-600 rounded-[2rem] p-6 text-white shadow-xl shadow-indigo-600/20 overflow-hidden relative">
           <div className="relative z-10">
              <BookOpen className="w-8 h-8 mb-4 opacity-50" />
              <p className="text-2xl font-black">{manuals.length}</p>
              <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Manuales Totales</p>
           </div>
           <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 space-y-8">
        
        {/* Header & Search */}
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-xl backdrop-blur-md">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {selectedCat || "Explorador de Archivos"}
                </h2>
                <p className="text-slate-500 font-medium mt-1">Directorio oficial de procesos y manuales.</p>
              </div>
              <div className="w-full md:w-96 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Buscar manuales..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-100 dark:bg-white/5 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-900 dark:text-white"
                />
              </div>
           </div>

           {/* Recent Files Section */}
           {!selectedCat && !search && recentManuals.length > 0 && (
             <div className="mb-10">
                <div className="flex items-center gap-2 mb-4 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                  <Clock className="w-4 h-4" /> Agregados recientemente
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   {recentManuals.map(m => (
                     <a 
                       key={m.id} 
                       href={m.file_url} 
                       target="_blank" 
                       className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-transparent hover:border-indigo-500/30 transition-all group"
                     >
                       <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                          <FileText className="w-6 h-6 text-indigo-500" />
                       </div>
                       <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setViewingManual(m)}>
                         <p className="text-sm font-black text-slate-900 dark:text-white truncate">{m.title}</p>
                         <p className="text-[10px] font-bold text-slate-500 uppercase">{m.category}</p>
                       </div>
                       <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                     </a>
                   ))}
                </div>
             </div>
           )}

           {/* Files Table/List */}
           <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                <List className="w-4 h-4" /> Documentos en {selectedCat || "el Directorio"}
              </div>
              
              <div className="overflow-hidden border border-slate-100 dark:border-white/5 rounded-2xl">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-950/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Nombre del Documento</th>
                      <th className="px-6 py-4 hidden md:table-cell">Categoría</th>
                      <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {loading ? (
                      Array(5).fill(0).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="px-6 py-5"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full w-1/2"></div></td>
                          <td className="px-6 py-5 hidden md:table-cell"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full w-20"></div></td>
                          <td className="px-6 py-5"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full w-10 ml-auto"></div></td>
                        </tr>
                      ))
                    ) : filtered.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-20 text-center">
                           <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Search className="w-8 h-8 text-slate-300" />
                           </div>
                           <p className="text-slate-500 font-bold">No se encontraron manuales.</p>
                        </td>
                      </tr>
                    ) : (
                      filtered.map(m => (
                        <tr key={m.id} className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <div onClick={() => setViewingManual(m)} className="flex items-center gap-4 group/link cursor-pointer">
                              <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-500 group-hover/link:bg-indigo-500 group-hover/link:text-white transition-all">
                                <FileText className="w-5 h-5" />
                              </div>
                              <span className="font-bold text-slate-700 dark:text-slate-300 group-hover/link:text-indigo-600 dark:group-hover/link:text-indigo-400 transition-colors">{m.title}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 hidden md:table-cell">
                            <span className="px-3 py-1 bg-slate-100 dark:bg-white/5 text-slate-500 text-[10px] font-black uppercase rounded-lg border border-slate-200 dark:border-white/5">
                              {m.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                               <button 
                                 onClick={() => setViewingManual(m)} 
                                 className="p-2 text-slate-400 hover:text-indigo-500 transition-colors"
                                 title="Ver Documento"
                               >
                                 <Eye className="w-4 h-4" />
                               </button>
                               {isAdmin && (
                                 <>
                                   <button 
                                     onClick={() => { setEditTitle(m.title); setEditCategory(m.category); setEditId(m.id); }}
                                     className="p-2 text-slate-400 hover:text-emerald-500 transition-colors"
                                     title="Editar"
                                   >
                                     <Edit3 className="w-4 h-4" />
                                   </button>
                                   <button 
                                     onClick={() => handleDelete(m.id)}
                                     className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                                     title="Eliminar"
                                   >
                                     <Trash2 className="w-4 h-4" />
                                   </button>
                                 </>
                               )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
           </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
          <form onSubmit={handleUpload} className="bg-white dark:bg-slate-950 border dark:border-white/10 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative">
             <button type="button" onClick={() => setShowUploadModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-white/5 w-8 h-8 rounded-full flex items-center justify-center font-bold">✕</button>
             <h2 className="text-2xl font-extrabold mb-8 text-slate-900 dark:text-white flex items-center gap-3">
               <Plus className="w-6 h-6 text-emerald-500" /> Subir Manual
             </h2>
             
             <div className="space-y-6">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">Título del Documento</label>
                  <input required type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full px-5 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/50 font-bold" placeholder="Ej. Protocolo de Seguridad" />
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">Categoría (Folder)</label>
                  <input required type="text" value={newCategory} onChange={e => setNewCategory(e.target.value)} className="w-full px-5 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/50 font-bold" list="cat-suggestions" placeholder="Ej. TI, Recursos Humanos..." />
                  <datalist id="cat-suggestions">
                    {categories.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">Archivo PDF</label>
                  <div className="relative">
                    <input required type="file" accept=".pdf" onChange={e => setFile(e.target.files?.[0] || null)} className="w-full px-5 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl outline-none file:hidden text-sm font-bold text-slate-500 cursor-pointer" id="file-upload" />
                    <label htmlFor="file-upload" className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-black cursor-pointer transition-colors">
                      {file ? "Cambiar Archivo" : "Elegir PDF"}
                    </label>
                    <span className="block mt-2 text-[10px] text-slate-400 font-bold">
                      {file ? `Seleccionado: ${file.name}` : "Solo se permiten archivos PDF"}
                    </span>
                  </div>
                </div>
             </div>

             <button type="submit" disabled={uploading} className="w-full mt-10 bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50 flex justify-center items-center gap-3">
                {uploading ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Procesando...</>
                ) : (
                  <><ArrowUpRight className="w-5 h-5" /> Publicar en el Directorio</>
                )}
             </button>
          </form>
        </div>
      )}

      {/* Edit Modal */}
      {editId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
          <form onSubmit={handleEdit} className="bg-white dark:bg-slate-950 border dark:border-white/10 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative">
             <button type="button" onClick={() => setEditId(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-white/5 w-8 h-8 rounded-full flex items-center justify-center font-bold">✕</button>
             <h2 className="text-2xl font-extrabold mb-8 text-slate-900 dark:text-white flex items-center gap-3">
               <Edit3 className="w-6 h-6 text-indigo-500" /> Editar Manual
             </h2>
             
             <div className="space-y-6">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">Título del Documento</label>
                  <input required type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full px-5 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/50 font-bold" />
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">Categoría (Folder)</label>
                  <input required type="text" value={editCategory} onChange={e => setEditCategory(e.target.value)} className="w-full px-5 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/50 font-bold" list="cat-suggestions" />
                </div>
             </div>

             <button type="submit" disabled={uploading} className="w-full mt-10 bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50 flex justify-center items-center gap-3">
                {uploading ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</>
                ) : (
                  'Guardar Cambios'
                )}
             </button>
          </form>
        </div>
      )}

      {/* Viewer Modal */}
      {viewingManual && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-950 w-full max-w-6xl h-[90vh] rounded-[2.5rem] flex flex-col shadow-2xl relative overflow-hidden border dark:border-white/10">
             <div className="p-6 border-b dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
                      <FileText className="w-5 h-5" />
                   </div>
                   <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white">{viewingManual.title}</h3>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{viewingManual.category}</p>
                   </div>
                </div>
                <div className="flex items-center gap-2">
                   <a href={viewingManual.file_url} target="_blank" className="p-3 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors text-slate-500" title="Abrir en pestaña nueva">
                      <ExternalLink className="w-5 h-5" />
                   </a>
                   <a href={viewingManual.file_url} download className="p-3 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors text-slate-500" title="Descargar">
                      <Download className="w-5 h-5" />
                   </a>
                   <button onClick={() => setViewingManual(null)} className="p-3 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors text-slate-500 font-bold" title="Cerrar">
                      <X className="w-6 h-6" />
                   </button>
                </div>
             </div>
             <div className="flex-1 bg-slate-100 dark:bg-slate-900 overflow-hidden">
                <iframe 
                  src={`${viewingManual.file_url}#toolbar=0`} 
                  className="w-full h-full border-none"
                  title={viewingManual.title}
                />
             </div>
          </div>
        </div>
      )}

    </div>
  );
}
