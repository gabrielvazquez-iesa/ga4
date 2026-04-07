import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Plus, BookOpen, Trash2, ExternalLink, Tag, Edit3 } from 'lucide-react';
import { Toaster, toast } from 'sonner';

export default function ManualsDirectory() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [manuals, setManuals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCat, setSelectedCat] = useState('');
  const [uploading, setUploading] = useState(false);

  // Feedback Modal
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

  // Upload modal
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [file, setFile] = useState<File | null>(null);

  // Edit modal
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');

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
      const uniqueCats = Array.from(new Set(data.map(m => m.category))).filter(Boolean) as string[];
      setCategories(uniqueCats);
    }
    setLoading(false);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !newTitle || !newCategory) return toast.error('Rellena todos los campos');
    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${newCategory}/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('manuals').upload(filePath, file);
      if (uploadError) throw new Error('Error subiendo archivo. ¿Creaste el Storage Bucket "manuals"?: ' + uploadError.message);

      const { data: urlData } = supabase.storage.from('manuals').getPublicUrl(filePath);

      const { data: { session } } = await supabase.auth.getSession();
      
      const { error: dbError } = await supabase.from('process_manuals').insert({
        title: newTitle,
        category: newCategory,
        file_url: urlData.publicUrl,
        uploaded_by: session?.user?.id
      });
      if (dbError) throw new Error('Error guardando registro. ¿Corriste el Script SQL?: ' + dbError.message);

      setFeedback({ type: 'success', message: '¡Manual publicado con éxito! Ya puedes verlo en el directorio oficial.' });
      setShowModal(false);
      setNewTitle('');
      setNewCategory('');
      setFile(null);
      fetchManuals();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, file_url: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este manual del registro? Esta acción no se puede deshacer.')) return;
    try {
      await supabase.from('process_manuals').delete().eq('id', id);
      fetchManuals();
      toast.success('Manual eliminado correctamente.');
    } catch (err: any) {
      toast.error('Error al borrar: ' + err.message);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId || !editTitle || !editCategory) return;
    setUploading(true);
    try {
      const { error } = await supabase.from('process_manuals').update({
        title: editTitle,
        category: editCategory,
        updated_at: new Date().toISOString()
      }).eq('id', editId);
      
      if (error) throw new Error('Error al actualizar: ' + error.message);
      
      setFeedback({ type: 'success', message: 'Los cambios se han guardado correctamente.' });
      setEditId(null);
      fetchManuals();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setUploading(false);
    }
  };

  const openEdit = (m: any) => {
    setEditTitle(m.title);
    setEditCategory(m.category);
    setEditId(m.id);
  };

  const filtered = manuals.filter(m => 
    (selectedCat === '' || m.category === selectedCat) &&
    (search === '' || m.title.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <Toaster position="top-right" theme="dark" />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/80 dark:bg-slate-900/60 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-white/5 backdrop-blur-sm">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-3 text-slate-900 dark:text-white">
             <div className="w-12 h-12 bg-indigo-500/10 text-indigo-500 flex items-center justify-center rounded-2xl border border-indigo-500/20">
               <BookOpen className="w-6 h-6" />
             </div>
             Directorio de Manuales
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Buscador y repositorio oficial de procesos.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-lg shadow-indigo-500/20">
          <Plus className="w-5 h-5" /> Subir Manual
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-white/50 dark:bg-slate-900/40 p-2 rounded-2xl border border-slate-200 dark:border-white/5 backdrop-blur-sm">
         <div className="flex-1 relative">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
           <input 
             type="text" 
             placeholder="Palabras clave en el título..." 
             className="w-full pl-12 pr-4 py-3 bg-transparent border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none font-bold text-slate-900 dark:text-white"
             value={search}
             onChange={e => setSearch(e.target.value)}
           />
         </div>
         <div className="w-px bg-slate-200 dark:bg-slate-800 hidden sm:block mx-2 shrink-0 my-2" />
         <select
           value={selectedCat}
           onChange={e => setSelectedCat(e.target.value)}
           className="px-4 py-3 bg-transparent border-none outline-none font-bold text-slate-700 dark:text-slate-300 min-w-[200px] cursor-pointer"
         >
            <option value="" className="text-slate-900">Todas las Categorías</option>
            {categories.map(c => <option key={c} value={c} className="text-slate-900">{c}</option>)}
         </select>
      </div>

      {loading ? (
         <div className="flex justify-center py-32"><div className="w-12 h-12 animate-spin rounded-full border-4 border-indigo-500/30 border-t-indigo-500" /></div>
      ) : filtered.length === 0 ? (
         <div className="text-center py-32 bg-white/50 dark:bg-slate-900/30 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 backdrop-blur-sm">
           <BookOpen className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
           <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">Aún no hay manuales en este listado.</p>
           {isAdmin && <p className="text-sm mt-2 text-indigo-500">Haz clic en Subir Manual para agregar el primero.</p>}
         </div>
      ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
           {filtered.map(m => (
             <a key={m.id} href={m.file_url} target="_blank" className="group flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 hover:-translate-y-1 hover:shadow-2xl hover:border-indigo-500/30 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors" />
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-indigo-500/10">
                    <Tag className="w-3.5 h-3.5" /> {m.category}
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.preventDefault(); openEdit(m); }} className="p-2 text-indigo-500 hover:bg-indigo-500/10 rounded-xl transition-colors" title="Editar">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={(e) => { e.preventDefault(); handleDelete(m.id, m.file_url); }} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors" title="Borrar">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-extrabold mb-4 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-3 text-slate-900 dark:text-white inline-block mt-auto relative z-10 leading-snug">{m.title}</h3>
                
                <div className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 gap-1.5 mt-auto relative z-10 pt-4 border-t border-slate-100 dark:border-white/5 w-full">
                  <ExternalLink className="w-4 h-4" />
                  Abrir documento PDF
                </div>
             </a>
           ))}
         </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
          <form onSubmit={handleUpload} className="bg-white dark:bg-slate-950 border dark:border-white/10 w-full max-w-lg rounded-[2rem] p-8 shadow-2xl relative">
             <button type="button" onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-white/5 w-8 h-8 rounded-full flex items-center justify-center font-bold">✕</button>
             <h2 className="text-2xl font-extrabold mb-8 text-slate-900 dark:text-white">Subir Nuevo Manual</h2>
             
             <div className="space-y-5">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">Título oficial</label>
                  <input required type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 font-medium" placeholder="Ej. Protocolo de Redes" />
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">Categoría o Área</label>
                  <input required type="text" value={newCategory} onChange={e => setNewCategory(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 font-medium" list="cats" placeholder="Ej. Operaciones, Social Media..." />
                  <datalist id="cats">
                    {categories.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">Documento (.PDF)</label>
                  <input required type="file" accept=".pdf" onChange={e => setFile(e.target.files?.[0] || null)} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:text-white file:font-bold file:cursor-pointer text-slate-500 dark:text-slate-300 font-medium cursor-pointer" />
                </div>
             </div>

             <button type="submit" disabled={uploading} className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg disabled:opacity-50 flex justify-center items-center gap-2">
                {uploading ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Subiendo...</>
                ) : (
                  'Confirmar y Publicar'
                )}
             </button>
          </form>
        </div>
      )}

      {/* Edit Modal */}
      {editId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
          <form onSubmit={handleEdit} className="bg-white dark:bg-slate-950 border dark:border-white/10 w-full max-w-lg rounded-[2rem] p-8 shadow-2xl relative">
             <button type="button" onClick={() => setEditId(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-white/5 w-8 h-8 rounded-full flex items-center justify-center font-bold">✕</button>
             <h2 className="text-2xl font-extrabold mb-8 text-slate-900 dark:text-white">Modificar Manual</h2>
             
             <div className="space-y-5">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">Nuevo título oficial</label>
                  <input required type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 font-medium" />
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">Categoría o Área</label>
                  <input required type="text" value={editCategory} onChange={e => setEditCategory(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 font-medium" list="cats" />
                </div>
             </div>

             <button type="submit" disabled={uploading} className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg disabled:opacity-50 flex justify-center items-center gap-2">
                {uploading ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</>
                ) : (
                  'Guardar Cambios'
                )}
             </button>
          </form>
        </div>
      )}
      {/* Feedback Modal */}
      {feedback.type && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in zoom-in duration-300">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl text-center relative overflow-hidden">
            <div className={`absolute top-0 inset-x-0 h-2 ${feedback.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
            
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${feedback.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
              {feedback.type === 'success' ? (
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
              ) : (
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
              )}
            </div>

            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
              {feedback.type === 'success' ? '¡Excelente!' : 'Hubo un problema'}
            </h2>
            
            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-8">
              {feedback.message}
            </p>

            <button 
              onClick={() => setFeedback({ type: null, message: '' })}
              className={`w-full py-4 rounded-2xl font-bold text-white transition-all shadow-lg active:scale-95 ${feedback.type === 'success' ? 'bg-green-600 hover:bg-green-500 shadow-green-500/20' : 'bg-red-600 hover:bg-red-500 shadow-red-500/20'}`}
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
