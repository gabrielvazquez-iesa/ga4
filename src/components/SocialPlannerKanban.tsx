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
  CalendarDays,
  Globe,
  Maximize2,
  Minimize2,
  ZoomIn,
  Filter,
  Search,
  Tag,
  Monitor
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { nativeToast as toast } from './NativeToaster';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { es } from 'date-fns/locale/es';
import { format, subMonths, startOfMonth, endOfMonth, parseISO } from 'date-fns';
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
  { id: 'Instagram',  icon: Instagram, color: 'text-pink-500' },
  { id: 'Facebook',   icon: Facebook,  color: 'text-blue-600' },
  { id: 'X',          icon: X,         color: 'text-slate-900 dark:text-white' },
  { id: 'LinkedIn',   icon: Linkedin,  color: 'text-blue-700' },
  { id: 'TikTok',     icon: Play,      color: 'text-black dark:text-white' },
  { id: 'Página Web', icon: Globe,     color: 'text-emerald-500' },
  { id: 'YouTube',    icon: Play,      color: 'text-red-600' },
];

const CATEGORIES = ['General', 'Diseño gráfico', 'Desarrollo web', 'Comunicador social'];

interface Post {
  id: string;
  title: string;
  content: string;
  status: string;
  platform: string;
  category: string;
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
  
  // New States: Filters & UI Controls
  const [filterCategory, setFilterCategory] = useState('Todas');
  const [filterMonth, setFilterMonth] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [zoom, setZoom] = useState(100);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    status: 'Por Hacer',
    platform: 'Instagram',
    category: 'General',
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
        category: formData.category,
        scheduled_at: formData.scheduled_at || null,
      };

      if (editingPost) {
        const { error } = await supabase
          .from('social_media_posts')
          .update(payload)
          .eq('id', editingPost.id);
        if (error) throw error;
        toast.success('Publicación actualizada.');
      } else {
        const { error } = await supabase
          .from('social_media_posts')
          .insert([payload]);
        if (error) throw error;
        toast.success('Nueva publicación creada.');
      }

      setShowModal(false);
      setEditingPost(null);
      setFormData({ title: '', content: '', status: 'Por Hacer', platform: 'Instagram', category: 'General', scheduled_at: '' });
      fetchPosts();
    } catch (err) {
      toast.error('Error al guardar.');
    }
  };

  const movePost = async (id: string, newStatus: string) => {
    try {
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
      toast.error('No se pudo mover.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta planificación?')) return;
    try {
      const { error } = await supabase.from('social_media_posts').delete().eq('id', id);
      if (error) throw error;
      setPosts(prev => prev.filter(p => p.id !== id));
      toast.success('Eliminado.');
    } catch (err) {
      toast.error('Error al eliminar.');
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.setData('postId', id);
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    setDragOverCol(colId);
  };

  const handleDrop = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('postId');
    setDraggedId(null);
    setDragOverCol(null);
    const post = posts.find(p => p.id === id);
    if (post && post.status !== colId) movePost(id, colId);
  };

  // --- Filtering Logic ---
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchCategory = filterCategory === 'Todas' || post.category === filterCategory;
      const matchSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (post.content?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      
      let matchMonth = true;
      if (filterMonth !== 'Todos') {
        const postDate = post.scheduled_at ? parseISO(post.scheduled_at) : parseISO(post.created_at);
        const filterDate = parseISO(filterMonth);
        matchMonth = postDate.getMonth() === filterDate.getMonth() && 
                     postDate.getFullYear() === filterDate.getFullYear();
      }

      return matchCategory && matchSearch && matchMonth;
    });
  }, [posts, filterCategory, filterMonth, searchTerm]);

  // Generate last 6 months for the filter
  const months = useMemo(() => {
    const list = [];
    for (let i = 0; i < 6; i++) {
      const d = subMonths(new Date(), i);
      list.push({ 
        value: format(d, 'yyyy-MM'), 
        label: format(d, 'MMMM yyyy', { locale: es }) 
      });
    }
    return list;
  }, []);

  const toggleFullScreen = () => {
    const newState = !isFullScreen;
    setIsFullScreen(newState);
    
    // As per user request: Collapse sidebar when in fullscreen
    if (newState) {
      localStorage.setItem('sidebar_collapsed', 'true');
      document.documentElement.setAttribute('data-sidebar-collapsed', 'true');
      // Trigger a window resize event to let layout adjust
      window.dispatchEvent(new Event('resize'));
    }
  };

  return (
    <div className={`space-y-6 transition-all duration-500 ${isFullScreen ? 'fixed inset-4 bg-white dark:bg-[#050B14] z-[100] p-6 rounded-[2.5rem] shadow-2xl overflow-y-auto border border-white/5' : ''}`}>
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
        .react-datepicker__current-month, .react-datepicker__day-name {
          color: #94a3b8 !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
        }
        .react-datepicker__day {
          color: #cbd5e1 !important;
          border-radius: 0.75rem !important;
          font-weight: 600 !important;
        }
        .react-datepicker__day--selected { background-color: #4f46e5 !important; }
        .kanban-board {
          transform-origin: top left;
          transition: transform 0.2s ease-out;
        }
      `}</style>

      {/* --- Filter Bar --- */}
      <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between bg-white/50 dark:bg-white/5 backdrop-blur-md p-4 rounded-[2rem] border border-slate-200 dark:border-white/5">
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-200 dark:border-white/5">
            <button 
              onClick={() => setFilterCategory('Todas')}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${filterCategory === 'Todas' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-500 hover:bg-white dark:hover:bg-white/5'}`}
            >
              Todas
            </button>
            {CATEGORIES.map(cat => (
              <button 
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${filterCategory === cat ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-500 hover:bg-white dark:hover:bg-white/5'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Month Filter */}
          <div className="relative">
            <select 
              value={filterMonth}
              onChange={e => setFilterMonth(e.target.value)}
              className="appearance-none bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-2xl pl-10 pr-10 py-2.5 text-xs font-black text-slate-700 dark:text-slate-300 outline-none focus:ring-4 focus:ring-indigo-500/10 cursor-pointer"
            >
              <option value="Todos">Cualquier Mes</option>
              {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <ChevronRight className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-4 w-full xl:w-auto">
          {/* Search */}
          <div className="relative flex-1 xl:flex-none xl:min-w-[250px]">
             <input 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar idea..."
              className="w-full bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10"
             />
             <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>

          <div className="h-8 w-px bg-slate-200 dark:bg-white/10 hidden md:block" />

          {/* Zoom Slider */}
          <div className="hidden md:flex items-center gap-3 bg-slate-100 dark:bg-slate-900/50 px-4 py-2 rounded-2xl border border-slate-200 dark:border-white/5">
            <ZoomIn className="w-4 h-4 text-slate-400" />
            <input 
              type="range" min="60" max="100" step="5" 
              value={zoom} onChange={e => setZoom(Number(e.target.value))}
              className="w-24 accent-indigo-600"
            />
            <span className="text-[10px] font-black text-slate-500 w-8">{zoom}%</span>
          </div>

          {/* Full Screen Toggle */}
          <button 
            onClick={toggleFullScreen}
            className={`p-2.5 rounded-2xl transition-all ${isFullScreen ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-100 dark:bg-slate-900/50 text-slate-500 hover:text-indigo-500'}`}
          >
            {isFullScreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Header Sección */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-indigo-600/20 rounded-xl">
               <Monitor className="w-8 h-8 text-indigo-500" />
            </div>
            Planner Profesional
          </h2>
        </div>
        <button 
          onClick={() => { setEditingPost(null); setFormData({ title: '', content: '', status: 'Por Hacer', platform: 'Instagram', category: 'General', scheduled_at: '' }); setShowModal(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-xl shadow-indigo-500/25 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" /> Nueva Tarea
        </button>
      </div>

      {/* Kanban Board */}
      <div 
        className="kanban-board flex gap-6 overflow-x-auto pb-12 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/10"
        style={{ transform: `scale(${zoom / 100})` }}
      >
        {COLUMNS.map(col => (
          <div 
            key={col.id} 
            className="flex-1 min-w-[320px] max-w-[360px]"
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={() => setDragOverCol(null)}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-8 rounded-full ${col.color} shadow-lg`} />
                <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-lg">{col.label}</h3>
                <span className="text-xs bg-slate-200/50 dark:bg-white/5 text-slate-500 px-3 py-1 rounded-full font-black">
                  {filteredPosts.filter(p => p.status === col.id).length}
                </span>
              </div>
            </div>

            <div className={`flex flex-col gap-5 p-5 rounded-[2.5rem] border-2 border-dashed transition-all duration-300 min-h-[700px] ${
              dragOverCol === col.id ? `${col.border} bg-indigo-500/5 scale-[1.01]` : 'border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/20'
            }`}>
              <AnimatePresence mode="popLayout">
                {filteredPosts.filter(p => p.status === col.id).map(post => (
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
                        category: post.category || 'General',
                        scheduled_at: post.scheduled_at || '' 
                      }); 
                      setShowModal(true); 
                    }}
                    onDelete={() => handleDelete(post.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Formulario */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-2xl bg-white dark:bg-[#050B14] border-slate-200 dark:border-white/10 rounded-[3rem] p-10 overflow-visible shadow-3xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black dark:text-white">Planificación de Tarea</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-6 pt-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descripción de la Tarea / Nota</label>
              <input 
                required
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-indigo-500/10 dark:text-white font-bold"
                placeholder="Ej. Nota de prensa: Nuevo Producto"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Plataforma</label>
                <div className="relative">
                  <select 
                    value={formData.platform}
                    onChange={e => setFormData({...formData, platform: e.target.value})}
                    className="w-full appearance-none bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-indigo-500/10 dark:text-white font-bold cursor-pointer transition-all"
                  >
                    {PLATFORMS.map(p => <option key={p.id} value={p.id} className="bg-slate-900">{p.id}</option>)}
                  </select>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 rotate-90" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Filtro / Área</label>
                <div className="relative">
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full appearance-none bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-indigo-500/10 dark:text-white font-bold cursor-pointer transition-all"
                  >
                    {CATEGORIES.map(cat => <option key={cat} value={cat} className="bg-slate-900">{cat}</option>)}
                  </select>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 rotate-90" />
                </div>
              </div>
            </div>

            <div className="space-y-2 flex flex-col">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha Programada</label>
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

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Detalle / Copy</label>
              <textarea 
                rows={4}
                value={formData.content}
                onChange={e => setFormData({...formData, content: e.target.value})}
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-indigo-500/10 dark:text-white font-medium resize-none transition-all placeholder:text-slate-400"
                placeholder="Instrucciones o contenido para la pieza..."
              />
            </div>

            <DialogFooter className="gap-3">
              <Button type="button" variant="ghost" onClick={() => setShowModal(false)} className="rounded-2xl font-bold px-8">Cerrar</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black px-12 py-7 h-auto shadow-2xl shadow-indigo-500/30 text-lg">
                {editingPost ? 'Actualizar' : 'Agendar'}
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
      className={`bg-white dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-white/5 rounded-[2rem] p-6 cursor-grab active:cursor-grabbing group/card relative transition-all duration-300 ${isDragging ? 'opacity-30 scale-95 z-50' : 'opacity-100 z-0'}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${platform.color} bg-slate-100 dark:bg-white/5 border border-white/5`}>
          <Icon className="w-4 h-4" />
          {post.platform}
        </div>
        <div className="opacity-0 group-hover/card:opacity-100 flex gap-2 transition-all">
          <button onClick={onEdit} className="p-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-xl transition-all"><Edit2 className="w-4 h-4" /></button>
          <button onClick={onDelete} className="p-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>

      {post.category && post.category !== 'General' && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-full text-[9px] font-bold text-slate-500 mb-2">
          <Tag className="w-3 h-3 text-indigo-500" />
          {post.category}
        </div>
      )}

      <h4 className="font-black text-slate-800 dark:text-white mb-3 text-base leading-tight">{post.title}</h4>
      {post.content && <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mb-5 font-medium leading-relaxed">{post.content}</p>}

      <div className="flex items-center justify-between pt-5 border-t border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 bg-slate-50 dark:bg-white/2 px-3 py-2 rounded-xl border border-dotted border-slate-200 dark:border-white/10">
          <Clock className="w-4 h-4 text-indigo-500" />
          {post.scheduled_at 
            ? new Date(post.scheduled_at).toLocaleDateString('es-VE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) 
            : 'Pendiente'}
        </div>
      </div>
    </motion.div>
  );
}

const PremiumDateInput = ({ value, onClick, label, icon }: any) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full group flex items-center gap-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-5 rounded-2xl transition-all hover:border-indigo-500/50 hover:bg-white dark:hover:bg-indigo-500/10 shadow-sm text-left"
  >
    <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 transition-colors">
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">{label}</p>
      <p className="text-sm font-black text-slate-900 dark:text-white">{value || 'Seleccionar...'}</p>
    </div>
    <Edit2 className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
  </button>
);
