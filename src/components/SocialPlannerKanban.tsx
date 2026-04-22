import { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Plus, 
  MoreHorizontal, 
  Calendar, 
  Instagram, 
  Facebook, 
  Twitter as X, 
  Linkedin, 
  Play, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Hash,
  Trash2,
  Edit2,
  ChevronRight,
  ChevronLeft,
  Layout,
  CalendarDays
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { nativeToast as toast } from './NativeToaster';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { es } from 'date-fns/locale/es';
registerLocale('es', es);

// ==========================================
// CONFIGURATION & TYPES
// ==========================================

const COLUMNS = [
  { id: 'Por Hacer',    label: 'Por Hacer',    color: 'bg-slate-500',      light: 'bg-slate-500/10',    border: 'border-slate-500/20' },
  { id: 'En Progreso',  label: 'En Progreso',  color: 'bg-blue-500',       light: 'bg-blue-500/10',     border: 'border-blue-500/20' },
  { id: 'En Revisión',  label: 'En Revisión',  color: 'bg-amber-500',      light: 'bg-amber-500/10',    border: 'border-amber-500/20' },
  { id: 'Programado',   label: 'Programado',   color: 'bg-indigo-500',     light: 'bg-indigo-500/10',   border: 'border-indigo-500/20' },
  { id: 'Completado',   label: 'Completado',   color: 'bg-emerald-500',    light: 'bg-emerald-500/10',  border: 'border-emerald-500/20' },
];

const PLATFORMS = [
  { id: 'Instagram', icon: Instagram, color: 'text-pink-500' },
  { id: 'Facebook',  icon: Facebook,  color: 'text-blue-600' },
  { id: 'X',         icon: X,         color: 'text-slate-900 dark:text-white' },
  { id: 'LinkedIn',  icon: Linkedin,  color: 'text-blue-700' },
  { id: 'TikTok',    icon: Play,      color: 'text-black dark:text-white' },
  { id: 'YouTube',   icon: Play,      color: 'text-red-600' },
];

interface Post {
  id: string;
  title: string;
  content: string;
  status: string;
  platform: string;
  scheduled_at: string | null;
  media_url: string | null;
  created_at: string;
}

export default function SocialPlannerKanban() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    status: 'Por Hacer',
    platform: 'Instagram',
    scheduled_at: '',
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('social_media_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setPosts(data || []);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        content: formData.content,
        status: formData.status,
        platform: formData.platform,
        scheduled_at: formData.scheduled_at || null,
      };

      if (editingPost) {
        const { error } = await supabase
          .from('social_media_posts')
          .update(payload)
          .eq('id', editingPost.id);
        if (error) throw error;
        toast.success('Publicación actualizada correctamente.');
      } else {
        const { error } = await supabase
          .from('social_media_posts')
          .insert([payload]);
        if (error) throw error;
        toast.success('Nueva publicación creada.');
      }

      setShowModal(false);
      setEditingPost(null);
      setFormData({ title: '', content: '', status: 'Por Hacer', platform: 'Instagram', scheduled_at: '' });
      fetchPosts();
    } catch (err) {
      toast.error('Ocurrió un error al guardar.');
    }
  };

  const movePost = async (id: string, newStatus: string) => {
    try {
      // Optimistic update
      const oldPosts = [...posts];
      setPosts(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));

      const { error } = await supabase
        .from('social_media_posts')
        .update({ status: newStatus })
        .eq('id', id);
        
      if (error) {
        setPosts(oldPosts);
        throw error;
      }
      
      toast.success(`Movido a ${newStatus}`);
    } catch (err) {
      toast.error('No se pudo mover la publicación.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta planificación?')) return;
    try {
      const { error } = await supabase.from('social_media_posts').delete().eq('id', id);
      if (error) throw error;
      setPosts(prev => prev.filter(p => p.id !== id));
      toast.success('Eliminado.');
    } catch (err) {
      toast.error('Error al eliminar.');
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.setData('postId', id);
    // Efecto de semitransparencia (la clase 'dragging' se añade en el componente KanbanCard)
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    setDragOverCol(colId);
  };

  const handleDrop = async (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('postId');
    setDraggedId(null);
    setDragOverCol(null);
    
    const post = posts.find(p => p.id === id);
    if (post && post.status !== colId) {
      movePost(id, colId);
    }
  };

  return (
    <div className="space-y-6">
      <style>{`
        .react-datepicker-wrapper { width: 100%; }
        .react-datepicker {
          font-family: inherit;
          background-color: #0f172a !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          border-radius: 1.5rem !important;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
          color: white !important;
          padding: 1rem !important;
        }
        .react-datepicker__header {
          background-color: transparent !important;
          border-bottom: 1px solid rgba(255,255,255,0.1) !important;
          padding-top: 0.5rem !important;
        }
        .react-datepicker__current-month, .react-datepicker__day-name, .react-datepicker-time__header {
          color: #94a3b8 !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
          font-size: 0.7rem !important;
          letter-spacing: 0.05em !important;
          margin-bottom: 0.5rem !important;
        }
        .react-datepicker__day {
          color: #cbd5e1 !important;
          border-radius: 0.75rem !important;
          transition: all 0.2s !important;
          font-weight: 600 !important;
        }
        .react-datepicker__day:hover {
          background-color: rgba(99, 102, 241, 0.2) !important;
          color: #818cf8 !important;
        }
        .react-datepicker__day--selected {
          background-color: #4f46e5 !important;
          color: white !important;
          font-weight: bold !important;
        }
        .react-datepicker__day--today {
          border: 1px solid #4f46e5 !important;
          color: #818cf8 !important;
        }
        .react-datepicker__time-container {
          border-left: 1px solid rgba(255,255,255,0.1) !important;
          background-color: #0f172a !important;
          width: 100px !important;
        }
        .react-datepicker__time-box { width: 100px !important; }
        .react-datepicker__time-list-item {
          background-color: transparent !important;
          color: #94a3b8 !important;
          transition: all 0.2s !important;
          padding: 10px 0 !important;
        }
        .react-datepicker__time-list-item:hover {
          background-color: rgba(79, 70, 229, 0.2) !important;
          color: #818cf8 !important;
        }
        .react-datepicker__time-list-item--selected {
          background-color: #4f46e5 !important;
          color: white !important;
          font-weight: bold !important;
        }
      `}</style>

      {/* Header Sección */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-indigo-600/10 rounded-xl">
               <Layout className="w-8 h-8 text-indigo-600" />
            </div>
            Planificador de Contenidos
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Arrastra y suelta para organizar tus publicaciones en redes sociales.</p>
        </div>
        <button 
          onClick={() => { setEditingPost(null); setFormData({ title: '', content: '', status: 'Por Hacer', platform: 'Instagram', scheduled_at: '' }); setShowModal(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-xl shadow-indigo-500/25 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" /> Nueva Idea
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/10">
        {COLUMNS.map(col => (
          <div 
            key={col.id} 
            className="flex-1 min-w-[320px] max-w-[350px]"
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={() => setDragOverCol(null)}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-8 rounded-full ${col.color} shadow-lg shadow-current/20`} />
                <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-lg">{col.label}</h3>
                <span className="text-xs bg-slate-200/50 dark:bg-white/5 text-slate-500 dark:text-slate-400 px-3 py-1 rounded-full font-black">
                  {posts.filter(p => p.status === col.id).length}
                </span>
              </div>
            </div>

            {/* Column Content */}
            <div className={`flex flex-col gap-4 p-4 rounded-[2rem] border-2 border-dashed transition-all duration-300 min-h-[600px] ${
              dragOverCol === col.id 
                ? `${col.border} bg-indigo-500/5 scale-[1.02]` 
                : 'border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/40'
            }`}>
              <AnimatePresence mode="popLayout">
                {posts.filter(p => p.status === col.id).map(post => (
                  <KanbanCard 
                    key={post.id} 
                    post={post} 
                    isDragging={draggedId === post.id}
                    onDragStart={(e) => handleDragStart(e, post.id)}
                    onDragEnd={() => { setDraggedId(null); setDragOverCol(null); }}
                    onEdit={() => { 
                      setEditingPost(post); 
                      setFormData({ 
                        title: post.title, 
                        content: post.content || '', 
                        status: post.status, 
                        platform: post.platform, 
                        scheduled_at: post.scheduled_at || '' 
                      }); 
                      setShowModal(true); 
                    }}
                    onDelete={() => handleDelete(post.id)}
                  />
                ))}
              </AnimatePresence>
              
              {/* Silhouette / Drop Placeholder */}
              {dragOverCol === col.id && draggedId && posts.find(p => p.id === draggedId)?.status !== col.id && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 0.5, scale: 1 }}
                  className="bg-indigo-500/10 border-2 border-indigo-500/20 border-dashed rounded-[1.5rem] p-8 flex items-center justify-center text-indigo-500"
                >
                  <Plus className="w-8 h-8 animate-pulse" />
                </motion.div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Creación/Edición */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-xl bg-slate-50 dark:bg-[#0f172a] border-slate-200 dark:border-white/10 rounded-[2rem] p-8 overflow-visible">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black dark:text-white">
              {editingPost ? 'Editar Publicación' : 'Nueva Publicación'}
            </DialogTitle>
            <DialogDescription className="text-slate-500 font-medium">
              Define los detalles de tu próximo gran post.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-6 pt-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Título de la Idea</label>
              <input 
                required
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-indigo-500/10 dark:text-white font-bold transition-all placeholder:text-slate-400"
                placeholder="Ej. Reel sobre analítica mensual"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Plataforma</label>
                <div className="relative">
                  <select 
                    value={formData.platform}
                    onChange={e => setFormData({...formData, platform: e.target.value})}
                    className="w-full appearance-none bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-indigo-500/10 dark:text-white font-bold transition-all cursor-pointer"
                  >
                    {PLATFORMS.map(p => <option key={p.id} value={p.id} className="bg-slate-900">{p.id}</option>)}
                  </select>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 rotate-90 pointer-events-none" />
                </div>
              </div>
              
              <div className="space-y-2 flex flex-col">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Programar</label>
                <DatePicker
                    selected={formData.scheduled_at ? new Date(formData.scheduled_at) : null}
                    onChange={(date: Date | null) => {
                        if (date) setFormData({...formData, scheduled_at: date.toISOString()});
                    }}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="dd/MM/yyyy HH:mm"
                    locale="es"
                    customInput={<PremiumDateInput label="Fecha y Hora" icon={<CalendarDays className="w-5 h-5" />} />}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Copy / Descripción</label>
              <textarea 
                rows={4}
                value={formData.content}
                onChange={e => setFormData({...formData, content: e.target.value})}
                className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-indigo-500/10 dark:text-white font-medium resize-none transition-all placeholder:text-slate-400"
                placeholder="Escribe aquí el texto que acompañará la publicación..."
              />
            </div>

            <DialogFooter className="gap-3">
              <Button type="button" variant="ghost" onClick={() => setShowModal(false)} className="rounded-2xl font-bold px-8">Cancelar</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black px-10 py-6 h-auto shadow-xl shadow-indigo-500/20">
                {editingPost ? 'Guardar Cambios' : 'Agendar Post'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ==========================================
// KANBAN CARD COMPONENT
// ==========================================

function KanbanCard({ post, isDragging, onDragStart, onDragEnd, onEdit, onDelete }: { 
  post: Post, 
  isDragging: boolean,
  onDragStart: (e: React.DragEvent) => void,
  onDragEnd: () => void,
  onEdit: () => void, 
  onDelete: () => void
}) {
  const platform = PLATFORMS.find(p => p.id === post.platform) || PLATFORMS[0];
  const Icon = platform.icon;

  return (
    <motion.div
      layout
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ 
        opacity: isDragging ? 0.3 : 1, 
        y: 0, 
        scale: isDragging ? 0.9 : 1,
        boxShadow: isDragging ? 'none' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
      }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ y: -5, shadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
      className={`bg-white dark:bg-[#1a2133] border border-slate-200 dark:border-white/5 rounded-[1.5rem] p-5 cursor-grab active:cursor-grabbing group/card relative transition-all duration-200 ${isDragging ? 'z-50' : 'z-0'}`}
    >
      {/* Platform Bagde */}
      <div className="flex items-center justify-between mb-3 text-white">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${platform.color} bg-slate-100 dark:bg-white/5 border border-white/5`}>
          <Icon className="w-3.5 h-3.5" />
          {post.platform}
        </div>
        <div className="opacity-0 group-hover/card:opacity-100 flex gap-2 transition-all duration-300 transform translate-x-2 group-hover/card:translate-x-0">
          <button onClick={onEdit} className="p-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-lg transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
          <button onClick={onDelete} className="p-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      <h4 className="font-extrabold text-slate-800 dark:text-white mb-3 leading-snug text-sm">{post.title}</h4>
      
      {post.content && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-3 mb-4 leading-relaxed font-medium">{post.content}</p>
      )}

      {/* Footer Card */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-white/2 px-3 py-1.5 rounded-xl">
          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
          {post.scheduled_at 
            ? new Date(post.scheduled_at).toLocaleDateString('es-VE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) 
            : 'Por agendar'}
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
             <ChevronRight className="w-4 h-4 text-slate-400 -rotate-45" />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Premium Custom input for DatePicker (reutilizado) ────────────────
const PremiumDateInput = ({ value, onClick, label, icon }: any) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full group flex items-center gap-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 rounded-2xl transition-all hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-indigo-500/5 shadow-sm text-left"
  >
    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-500 group-hover:text-indigo-500 transition-colors">
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest leading-none mb-1">{label}</p>
      <p className="text-sm font-bold text-slate-900 dark:text-white">{value || 'Seleccionar...'}</p>
    </div>
    <Edit2 className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
  </button>
);
