import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, ShieldCheck, Globe, Instagram, 
  BarChart3, KeyRound, BookOpen, LayoutDashboard, 
  Cpu, ArrowRight, MousePointer2, Info, Lock, X
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Node {
  id: string;
  name: string;
  type: 'input' | 'core' | 'module' | 'security';
  icon: any;
  desc: string;
  x: number;
  y: number;
  connections: string[];
}

export default function SystemExplorer() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fallback para el color de acento
  const accentColor = typeof window !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#3b82f6' : '#3b82f6';

  const [nodes, setNodes] = useState<Node[]>([
    { 
      id: 'ga4', name: 'Google Analytics 4', type: 'input', icon: BarChart3, 
      desc: 'Fuente principal de métricas web y tráfico UTM.',
      x: 50, y: 50, connections: ['api_routes', 'ecosystem'] 
    },
    { 
      id: 'meta_api', name: 'Meta Ads API', type: 'input', icon: Instagram, 
      desc: 'Provee datos de gasto y rendimiento de campañas sociales.',
      x: 50, y: 250, connections: ['api_routes'] 
    },
    { 
      id: 'api_routes', name: 'Astro API Routes', type: 'core', icon: Cpu, 
      desc: 'Procesamiento de datos y puentes hacia APIs externas.',
      x: 300, y: 150, connections: ['supabase', 'dashboard', 'meta_report'] 
    },
    { 
      id: 'auth', name: 'Supabase Auth', type: 'security', icon: ShieldCheck, 
      desc: 'Gestión de sesiones y políticas de seguridad (RLS).',
      x: 300, y: 400, connections: ['supabase', 'vault'] 
    },
    { 
      id: 'supabase', name: 'Supabase DB', type: 'core', icon: Database, 
      desc: 'Almacenamiento central de perfiles, bóveda y metadatos.',
      x: 550, y: 275, connections: ['dashboard', 'vault', 'manuals', 'ecosystem'] 
    },
    { 
      id: 'dashboard', name: 'GA4 Dashboard', type: 'module', icon: LayoutDashboard, 
      desc: 'Visualización general de KPIs y salud digital.',
      x: 800, y: 50, connections: [] 
    },
    { 
      id: 'meta_report', name: 'Reporte Meta Ads', type: 'module', icon: Globe, 
      desc: 'Análisis detallado de UTMs y conversiones de pago.',
      x: 800, y: 200, connections: [] 
    },
    { 
      id: 'vault', name: 'Bóveda', type: 'module', icon: KeyRound, 
      desc: 'Gestión encriptada de accesos y credenciales.',
      x: 800, y: 350, connections: [] 
    },
    { 
      id: 'manuals', name: 'Manuales', type: 'module', icon: BookOpen, 
      desc: 'Base de conocimientos y guías de operación.',
      x: 800, y: 500, connections: [] 
    },
    { 
      id: 'ecosystem', name: 'Ecosistema', type: 'module', icon: Globe, 
      desc: 'Monitoreo de propiedades digitales externas.',
      x: 550, y: 50, connections: [] 
    }
  ]);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const email = (session.user.email || '').toLowerCase();
          // Log para depuración interna (invisible para el usuario)
          console.log("Checking admin for:", email);
          const isAdminUser = ['admin@iesa.edu.ve', 'gabriel.vazquez@iesa.edu.ve'].includes(email);
          setIsAdmin(isAdminUser);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAdmin();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 min-h-[500px]">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold text-sm">Cargando mapa del sistema...</p>
      </div>
    );
  }

  // Si no es admin pero logramos cargar, forzamos render para depurar o denegar
  if (isAdmin === false) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-12 min-h-[500px]">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <Lock className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Acceso Denegado</h2>
        <p className="text-slate-500 mt-2">Este módulo es exclusivo para administradores.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[600px] relative bg-slate-50 dark:bg-[#050B14] cursor-grab active:cursor-grabbing overflow-hidden" ref={containerRef}>
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:40px_40px]"></div>

      {/* SVG Connections */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        {nodes.map(node => 
          node.connections.map(targetId => {
            const target = nodes.find(n => n.id === targetId);
            if (!target) return null;
            return (
              <line
                key={`${node.id}-${targetId}`}
                x1={node.x + 80} y1={node.y + 40}
                x2={target.x + 80} y2={target.y + 40}
                stroke={accentColor}
                strokeWidth="2"
                strokeOpacity="0.2"
              />
            );
          })
        )}
      </svg>

      {/* Draggable Nodes */}
      {nodes.map((node) => (
        <motion.div
          key={node.id}
          drag
          dragConstraints={containerRef}
          onDrag={(e, info) => {
            setNodes(prev => prev.map(n => n.id === node.id ? { ...n, x: n.x + info.delta.x, y: n.y + info.delta.y } : n));
          }}
          onClick={() => setSelectedNode(node)}
          initial={false}
          className={`absolute w-40 p-4 rounded-3xl border backdrop-blur-xl shadow-xl cursor-pointer z-10 transition-shadow ${
            selectedNode?.id === node.id 
            ? 'border-blue-500 ring-4 ring-blue-500/20' 
            : 'border-slate-200 dark:border-white/10 bg-white/90 dark:bg-slate-800/90'
          }`}
          style={{ left: node.x, top: node.y }}
        >
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 ${
            node.type === 'input' ? 'bg-blue-500/10 text-blue-500' :
            node.type === 'core' ? 'bg-orange-500/10 text-orange-500' :
            node.type === 'security' ? 'bg-red-500/10 text-red-500' :
            'bg-green-500/10 text-green-500'
          }`}>
            <node.icon className="w-5 h-5" />
          </div>
          <h3 className="text-[11px] font-black text-slate-900 dark:text-white uppercase truncate">
            {node.name}
          </h3>
        </motion.div>
      ))}

      {/* Floating Panel Detail */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ x: 350, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 350, opacity: 0 }}
            className="absolute top-6 bottom-6 right-6 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-2xl p-6 z-20 overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                <selectedNode.icon className="w-6 h-6 text-blue-500" />
              </div>
              <button onClick={() => setSelectedNode(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>
            <h2 className="text-xl font-black dark:text-white">{selectedNode.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 leading-relaxed">{selectedNode.desc}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-6 left-6 px-4 py-2 bg-slate-900 text-white text-[10px] font-bold rounded-full">
        Interactúa arrastrando los nodos
      </div>
    </div>
  );
}
