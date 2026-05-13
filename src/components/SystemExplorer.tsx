import { useState, useRef, useEffect } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { 
  Database, ShieldCheck, Globe, Instagram, 
  BarChart3, KeyRound, BookOpen, LayoutDashboard, 
  Cpu, ArrowRight, MousePointer2, Info, Lock
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
          const isAdminUser = ['admin@iesa.edu.ve', 'gabriel.vazquez@iesa.edu.ve'].includes(email);
          setIsAdmin(isAdminUser);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("Error checking admin status:", err);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAdmin();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold text-sm">Cargando mapa del sistema...</p>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-12">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <Lock className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Acceso Denegado</h2>
        <p className="text-slate-500 mt-2">Este módulo es exclusivo para administradores del sistema.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing overflow-hidden" ref={containerRef}>
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:40px_40px]"></div>

      {/* Connection Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--accent-color)" stopOpacity="0.1" />
            <stop offset="50%" stopColor="var(--accent-color)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--accent-color)" stopOpacity="0.1" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        {nodes.map(node => 
          node.connections.map(targetId => {
            const target = nodes.find(n => n.id === targetId);
            if (!target) return null;
            return (
              <g key={`${node.id}-${targetId}`}>
                <motion.line
                  x1={node.x + 80} y1={node.y + 40}
                  x2={target.x + 80} y2={target.y + 40}
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-accent/30"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
                <circle r="3" fill="var(--accent-color)" filter="url(#glow)">
                  <animateMotion 
                    dur="3s" 
                    repeatCount="indefinite" 
                    path={`M ${node.x + 80} ${node.y + 40} L ${target.x + 80} ${target.y + 40}`} 
                  />
                </circle>
              </g>
            );
          })
        )}
      </svg>

      {/* Nodes */}
      {nodes.map((node) => (
        <motion.div
          key={node.id}
          drag
          dragConstraints={containerRef}
          onDrag={(e, info) => {
            setNodes(prev => prev.map(n => n.id === node.id ? { ...n, x: n.x + info.delta.x, y: n.y + info.delta.y } : n));
          }}
          onClick={() => setSelectedNode(node)}
          className={`absolute w-40 p-4 rounded-3xl border backdrop-blur-xl shadow-xl cursor-pointer transition-all duration-300 z-10 ${
            selectedNode?.id === node.id 
            ? 'border-accent ring-4 ring-accent/20 scale-105' 
            : 'border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-800/70'
          }`}
          style={{ left: node.x, top: node.y }}
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${
            node.type === 'input' ? 'bg-blue-500/10 text-blue-500' :
            node.type === 'core' ? 'bg-accent/10 text-accent' :
            node.type === 'security' ? 'bg-red-500/10 text-red-500' :
            'bg-green-500/10 text-green-500'
          }`}>
            <node.icon className="w-6 h-6" />
          </div>
          <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">
            {node.name}
          </h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-1">
            {node.type.toUpperCase()}
          </p>
        </motion.div>
      ))}

      {/* Instructions Overlay */}
      <div className="absolute top-6 right-6 flex items-center gap-3 pointer-events-none">
        <div className="px-4 py-2 bg-slate-900/80 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2 text-white text-xs font-bold shadow-2xl">
          <MousePointer2 className="w-3 h-3" /> Arrastra los nodos para organizar el mapa
        </div>
      </div>

      {/* Side Detail Panel */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="absolute top-6 bottom-6 right-6 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.4)] p-8 z-20 flex flex-col"
          >
            <div className="flex justify-between items-start mb-8">
              <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center ${
                selectedNode.type === 'input' ? 'bg-blue-500/10 text-blue-500' :
                selectedNode.type === 'core' ? 'bg-accent/10 text-accent' :
                selectedNode.type === 'security' ? 'bg-red-500/10 text-red-500' :
                'bg-green-500/10 text-green-500'
              }`}>
                <selectedNode.icon className="w-8 h-8" />
              </div>
              <button onClick={() => setSelectedNode(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
              {selectedNode.name}
            </h2>
            <div className="mt-2 inline-flex items-center px-3 py-1 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-lg">
              {selectedNode.type}
            </div>

            <p className="mt-6 text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              {selectedNode.desc}
            </p>

            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Info className="w-3 h-3" /> Conexiones de Salida
              </h4>
              <div className="space-y-3">
                {selectedNode.connections.map(id => {
                  const target = nodes.find(n => n.id === id);
                  return (
                    <div key={id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-transparent hover:border-accent/20 transition-all group">
                      <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                        {target && <target.icon className="w-4 h-4 text-accent" />}
                      </div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{target?.name}</span>
                      <ArrowRight className="w-3 h-3 ml-auto text-slate-300 group-hover:text-accent transition-colors" />
                    </div>
                  );
                })}
                {selectedNode.connections.length === 0 && (
                  <p className="text-xs text-slate-400 italic">Este es un nodo terminal (Final de flujo).</p>
                )}
              </div>
            </div>

            <button 
              onClick={() => setSelectedNode(null)}
              className="mt-auto w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Cerrar Detalles
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function X(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
