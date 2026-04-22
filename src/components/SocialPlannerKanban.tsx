import { useState, useEffect, useMemo } from 'react';
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
  Layout
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { nativeToast as toast } from './NativeToaster';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';

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
        ...formData,
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
      const { error } = await supabase
        .from('social_media_posts')
        .update({ status: newStatus })
        .eq('id', id);
      if (error) throw error;
      
      setPosts(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
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

  return (
    <div className="space-y-6">
      {/* Header Sección */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Layout className="w-6 h-6 text-indigo-500" /> Planificador de Contenidos
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Gestiona el ciclo de vida de tus publicaciones en redes sociales.</p>
        </div>
        <button 
          onClick={() => { setEditingPost(null); setShowModal(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" /> Nueva Idea
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/10">
        {COLUMNS.map(col => (
          <div key={col.id} className="flex-1 min-w-[280px] group">
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-6 rounded-full ${col.color}`} />
                <h3 className="font-bold text-slate-700 dark:text-slate-200">{col.label}</h3>
                <span className="text-xs bg-slate-100 dark:bg-white/5 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                  {posts.filter(p => p.status === col.id).length}
                </span>
              </div>
            </div>

            {/* Column Content */}
            <div className={`flex flex-col gap-4 p-3 rounded-2xl border-2 border-dashed ${col.border} min-h-[500px] transition-colors group-hover:bg-slate-50/50 dark:group-hover:bg-white/2`}>
              <AnimatePresence mode="popLayout">
                {posts.filter(p => p.status === col.id).map(post => (
                  <KanbanCard 
                    key={post.id} 
                    post={post} 
                    onEdit={() => { 
                      setEditingPost(post); 
                      setFormData({ 
                        title: post.title, 
                        content: post.content || '', 
                        status: post.status, 
                        platform: post.platform, 
                        scheduled_at: post.scheduled_at ? new Date(post.scheduled_at).toISOString().slice(0, 16) : '' 
                      }); 
                      setShowModal(true); 
                    }}
                    onDelete={() => handleDelete(post.id)}
                    onMove={(status) => movePost(post.id, status)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Creación/Edición */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10">
          <DialogHeader>
            <DialogTitle>{editingPost ? 'Editar Publicación' : 'Nueva Publicación'}</DialogTitle>
            <DialogDescription>Define el contenido y la plataforma para esta publicación.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Título de la Idea</label>
              <input 
                required
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-white"
                placeholder="Ej. Reel sobre analítica mensual"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Plataforma</label>
                <select 
                  value={formData.platform}
                  onChange={e => setFormData({...formData, platform: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-white"
                >
                  {PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.id}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Programar para</label>
                <input 
                  type="datetime-local"
                  value={formData.scheduled_at}
                  onChange={e => setFormData({...formData, scheduled_at: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-white [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Copy / Descripción</label>
              <textarea 
                rows={4}
                value={formData.content}
                onChange={e => setFormData({...formData, content: e.target.value})}
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-white resize-none"
                placeholder="Escribe aquí el texto que acompañará la publicación..."
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {editingPost ? 'Guardar Cambios' : 'Crear Publicación'}
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

function KanbanCard({ post, onEdit, onDelete, onMove }: { 
  post: Post, 
  onEdit: () => void, 
  onDelete: () => void,
  onMove: (status: string) => void
}) {
  const [showActions, setShowActions] = useState(false);
  const platform = PLATFORMS.find(p => p.id === post.platform) || PLATFORMS[0];
  const Icon = platform.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow group/card relative"
    >
      {/* Platform Bagde */}
      <div className="flex items-center justify-between mb-2">
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${platform.color} bg-slate-100 dark:bg-white/5`}>
          <Icon className="w-3 h-3" />
          {post.platform}
        </div>
        <div className="opacity-0 group-hover/card:opacity-100 flex gap-1 transition-opacity">
          <button onClick={onEdit} className="p-1 text-slate-400 hover:text-indigo-500"><Edit2 className="w-3.5 h-3.5" /></button>
          <button onClick={onDelete} className="p-1 text-slate-400 hover:text-rose-500"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      <h4 className="font-bold text-slate-900 dark:text-white mb-2 leading-tight">{post.title}</h4>
      
      {post.content && (
        <p className="text-xs text-slate-500 line-clamp-2 mb-3">{post.content}</p>
      )}

      {/* Footer Card */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400">
          <Clock className="w-3 h-3" />
          {post.scheduled_at 
            ? new Date(post.scheduled_at).toLocaleDateString() 
            : 'Sin fecha'}
        </div>

        {/* Quick move controls */}
        <div className="flex gap-1">
          {COLUMNS.map(col => {
            if (col.id === post.status) return null;
            return (
              <button
                key={col.id}
                onClick={() => onMove(col.id)}
                title={`Mover a ${col.label}`}
                className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors hover:bg-indigo-500 hover:text-white text-slate-300 dark:hover:bg-indigo-500/50`}
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
