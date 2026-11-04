import React, { useState, useEffect } from 'react';
import { 
  Globe, TrendingUp, BarChart3, Layers, Search, Compass, ExternalLink, 
  ShieldCheck, CheckCircle2, AlertCircle, Eye, Clock, Users, ArrowUpRight, 
  ArrowRight, ChevronRight, ChevronLeft, Maximize2, Minimize2, Filter, 
  Sparkles, BookOpen, Cpu, FileText, Layout, Award, Target, Zap, 
  Share2, MousePointerClick, RefreshCw, X, HelpCircle, MonitorPlay, FileBarChart
} from 'lucide-react';

// ==========================================
// DATASETS ESTRUCTURADOS (2025 vs 2026)
// ==========================================

interface EcosystemSite {
  id: string;
  name: string;
  url: string;
  category: 'core' | 'international' | 'periphery';
  users2025: number;
  time2025: string;
  organic2025: number;
  direct2025: number;
  ref2025: number;
  users2026: number; // Corte mayo
  time2026: string;
  organic2026: number;
  direct2026: number;
  role: string;
  diagnosis: string;
}

const ECOSYSTEM_DATA: EcosystemSite[] = [
  {
    id: 'iesa-ve',
    name: 'IESA Principal',
    url: 'https://www.iesa.edu.ve',
    category: 'core',
    users2025: 285507,
    time2025: '2m 47s',
    organic2025: 113187,
    direct2025: 59371,
    ref2025: 12769,
    users2026: 78928,
    time2026: '2m 37s',
    organic2026: 49209,
    direct2026: 25706,
    role: 'Hub Central & Autoridad Institucional',
    diagnosis: 'Concentra el 60% del tráfico total. Principal punto de conversión para postgrados y programas ejecutivos.'
  },
  {
    id: 'debates-iesa',
    name: 'Debates IESA',
    url: 'https://www.debatesiesa.com',
    category: 'core',
    users2025: 143958,
    time2025: '2m 28s',
    organic2025: 131196,
    direct2025: 49006,
    ref2025: 11848,
    users2026: 59728,
    time2026: '5m 54s',
    organic2026: 38950,
    direct2026: 31484,
    role: 'Motor de Contenidos & Captación Orgánica',
    diagnosis: 'Retención récord (5m 54s). Es el imán SEO del IESA, pero requiere puentes de conversión directa hacia la oferta académica.'
  },
  {
    id: 'iesa-alumni',
    name: 'IESA Alumni',
    url: 'https://www.iesaalumni.org',
    category: 'periphery',
    users2025: 15699,
    time2025: '2m 14s',
    organic2025: 5529,
    direct2025: 10953,
    ref2025: 984,
    users2026: 4786,
    time2026: '1m 46s',
    organic2026: 1181,
    direct2026: 3322,
    role: 'Red de Egresados y Comunidad',
    diagnosis: 'Tráfico predominantemente directo (70%). Alta lealtad pero escaso descubrimiento orgánico.'
  },
  {
    id: 'iesa-foundation',
    name: 'IESA Foundation',
    url: 'https://iesafoundation.org',
    category: 'periphery',
    users2025: 15330,
    time2025: '1m 23s',
    organic2025: 715,
    direct2025: 15266,
    ref2025: 178,
    users2026: 1709,
    time2026: '1m 53s',
    organic2026: 293,
    direct2026: 1418,
    role: 'Filantropía & Financiamiento',
    diagnosis: 'Dependencia casi total de campañas directas e institucionales. Requiere sinergia con el portal principal.'
  },
  {
    id: 'iesa-panama',
    name: 'IESA Panamá',
    url: 'https://www.iesa.edu.pa',
    category: 'international',
    users2025: 4310,
    time2025: '0m 52s',
    organic2025: 3278,
    direct2025: 1209,
    ref2025: 411,
    users2026: 1632,
    time2026: '1m 49s',
    organic2026: 1039,
    direct2026: 760,
    role: 'Sede Regional Centroamérica',
    diagnosis: 'Tiempo en sitio duplicado (de 52s a 1m 49s). 63% del tráfico proviene de búsquedas orgánicas.'
  },
  {
    id: 'consultoria-pa',
    name: 'Consultoría IESA Panamá',
    url: 'https://consultoria.iesa.edu.pa',
    category: 'international',
    users2025: 1613,
    time2025: '1m 05s',
    organic2025: 243,
    direct2025: 1471,
    ref2025: 51,
    users2026: 955,
    time2026: '0m 44s',
    organic2026: 79,
    direct2026: 811,
    role: 'Servicios de Asesoría Corporativa B2B',
    diagnosis: 'Audiencia de nicho empresarial; fuerte canalización comercial directa.'
  },
  {
    id: 'intl-faculty',
    name: 'International Faculty',
    url: 'https://www.iesa.edu.pa/internationalfaculty',
    category: 'international',
    users2025: 1618,
    time2025: '2m 10s',
    organic2025: 1473,
    direct2025: 393,
    ref2025: 10,
    users2026: 780,
    time2026: '1m 03s',
    organic2026: 529,
    direct2026: 330,
    role: 'Claustro Docente Global',
    diagnosis: 'Excelente captación orgánica (67% orgánico). Alto valor de credibilidad académica.'
  },
  {
    id: 'aol',
    name: 'AOL (Aulas Online)',
    url: 'https://aol.iesa.edu.ve',
    category: 'periphery',
    users2025: 826,
    time2025: '1m 10s',
    organic2025: 351,
    direct2025: 604,
    ref2025: 19,
    users2026: 681,
    time2026: '2m 32s',
    organic2026: 59,
    direct2026: 635,
    role: 'Campus Virtual & Estudiantes Activos',
    diagnosis: 'Tiempo promedio subió notablemente a 2m 32s. Fuerte uso recurrente de la comunidad activa.'
  },
  {
    id: 'iesa-dominicana',
    name: 'IESA Dominicana',
    url: 'https://www.iesa.edu.do',
    category: 'international',
    users2025: 937,
    time2025: '2m 54s',
    organic2025: 275,
    direct2025: 748,
    ref2025: 2,
    users2026: 337,
    time2026: '0m 41s',
    organic2026: 69,
    direct2026: 281,
    role: 'Presencia en el Caribe',
    diagnosis: 'Presencia institucional en expansión en República Dominicana.'
  },
  {
    id: 'cslr',
    name: 'Centro de Sostenibilidad (CSLR)',
    url: 'https://www.iesa.edu.pa/cslr/',
    category: 'periphery',
    users2025: 651,
    time2025: '2m 38s',
    organic2025: 342,
    direct2025: 174,
    ref2025: 136,
    users2026: 275,
    time2026: '2m 30s',
    organic2026: 71,
    direct2026: 156,
    role: 'Investigación ESG & Liderazgo Responsable',
    diagnosis: 'Alta afinidad temática; tiempo de lectura superior a 2m 30s.'
  },
  {
    id: 'ciea',
    name: 'CIEA (Emprendimiento)',
    url: 'https://www.iesa.edu.pa/ciea',
    category: 'periphery',
    users2025: 388,
    time2025: '1m 32s',
    organic2025: 204,
    direct2025: 127,
    ref2025: 274,
    users2026: 195,
    time2026: '1m 53s',
    organic2026: 63,
    direct2026: 51,
    role: 'Innovación y Startups',
    diagnosis: 'Generador de alianzas con ecosistemas de innovación regionales.'
  }
];

// ==========================================
// NUEVOS PROYECTOS (14 PÁGINAS)
// ==========================================

interface NewPageProject {
  id: string;
  name: string;
  status: 'published' | 'in_development';
  image: string;
  category: 'Postgrados' | 'Estudiantil & Egresados' | 'Institucional & Empleabilidad' | 'Innovación & ESG';
  description: string;
  targetAudience: string;
  strategicGoal: string;
  techStatus: string;
}

const NEW_PAGE_PROJECTS: NewPageProject[] = [
  // PUBLICADAS
  {
    id: 'mba',
    name: 'Maestría en Administración (MBA)',
    status: 'published',
    image: '/img/paginas-nuevas/maestria-administracion-mba.png',
    category: 'Postgrados',
    description: 'Landing de conversión central del MBA con acreditaciones internacionales (AACSB, AMBA, EFMD).',
    targetAudience: 'Profesionales y ejecutivos en transición a gerencia media/alta.',
    strategicGoal: 'Generación directa de leads calificados y solicitudes de admisión.',
    techStatus: 'En producción con seguimiento GA4 y Search Console activo.'
  },
  {
    id: 'finanzas',
    name: 'Maestría en Finanzas',
    status: 'published',
    image: '/img/paginas-nuevas/maestria-finanzas.png',
    category: 'Postgrados',
    description: 'Programa líder en formación de estrategas financieros corporativos y banca de inversión.',
    targetAudience: 'Economistas, banqueros, directores de finanzas y consultores.',
    strategicGoal: 'Captación en un segmento de alta demanda y alta tasa de conversión orgánica (CTR 4.5%).',
    techStatus: 'En producción. 13.6K vistas acumuladas en 2026.'
  },
  {
    id: 'mercadeo',
    name: 'Maestría en Mercadeo',
    status: 'published',
    image: '/img/paginas-nuevas/maestria-administracion-mba.png', // Mapeo de backup
    category: 'Postgrados',
    description: 'Especialización en marketing digital, estrategia comercial y analítica de clientes.',
    targetAudience: 'Gerentes de marca, directores comerciales y líderes digitales.',
    strategicGoal: 'Mayor efectividad de clic orgánico (CTR 5.80% en Google).',
    techStatus: 'En producción. Tráfico en constante aceleración.'
  },
  {
    id: 'gerencia-publica',
    name: 'Maestría en Gerencia Pública',
    status: 'published',
    image: '/img/paginas-nuevas/maestria-gerencia-publica.png',
    category: 'Postgrados',
    description: 'Formación para servidores públicos, líderes de ONGs y organismos multilaterales.',
    targetAudience: 'Directores de instituciones públicas, tercer sector y organismos de desarrollo.',
    strategicGoal: 'Posicionar al IESA como referente de políticas públicas y gobernanza ética.',
    techStatus: 'En producción. 6.3K páginas vistas y 882 clics en Google.'
  },
  {
    id: 'especializacion-legal',
    name: 'Especialización en Gerencia Legal',
    status: 'published',
    image: '/img/paginas-nuevas/especializacion-legal.png',
    category: 'Postgrados',
    description: 'Nuevo programa interdisciplinario que une derecho corporativo con visión de negocio.',
    targetAudience: 'Abogados corporativos, socios de firmas y asesores legales internos.',
    strategicGoal: 'Nuevo lanzamiento fiscal 2026 con CTR orgánico récord de 28.6% en su nicho.',
    techStatus: 'Lanzada en septiembre 2026. 451 vistas iniciales.'
  },
  {
    id: 'landing-legal',
    name: 'Landing de Campaña Gerencia Legal',
    status: 'published',
    image: '/img/paginas-nuevas/landing-especializacion-legal.png',
    category: 'Postgrados',
    description: 'Landing page especializada de alto impacto visual para pauta y captación rápida.',
    targetAudience: 'Leads provenientes de Meta Ads y LinkedIn Ads.',
    strategicGoal: 'Maximizar el ratio de descarga de pensum y agendamiento con admisiones.',
    techStatus: 'En producción integrada a campañas activas.'
  },
  {
    id: 'hub-posgrados',
    name: 'Hub Central de Posgrados',
    status: 'published',
    image: '/img/paginas-nuevas/hub-posgrados.png',
    category: 'Postgrados',
    description: 'Portal consolidador de la oferta académica integral de maestrías y especializaciones.',
    targetAudience: 'Aspirantes generales explorando opciones formativas.',
    strategicGoal: 'Reducir el rebote y guiar la navegación del usuario hacia el programa idóneo.',
    techStatus: 'En producción. Nodo central de la arquitectura web.'
  },
  {
    id: 'electivas',
    name: 'Portal de Electivas IESA',
    status: 'published',
    image: '/img/paginas-nuevas/electivas.png',
    category: 'Estudiantil & Egresados',
    description: 'Plataforma para selección y consulta de materias electivas por trimestre.',
    targetAudience: 'Estudiantes activos de todos los postgrados.',
    strategicGoal: 'Autogestión académica y visibilidad de materias de vanguardia.',
    techStatus: 'En producción en subdominio electivas.iesa.edu.ve.'
  },
  {
    id: 'faq',
    name: 'Centro de Preguntas Frecuentes (FAQ)',
    status: 'published',
    image: '/img/paginas-nuevas/faq.png',
    category: 'Institucional & Empleabilidad',
    description: 'Repositorio inteligente de respuestas a dudas sobre admisiones, pagos y modalidad.',
    targetAudience: 'Aspirantes en fase de decisión y estudiantes activos.',
    strategicGoal: 'Descongestionar el canal de atención y resolver objeciones de matrícula 24/7.',
    techStatus: 'En producción con optimización semántica.'
  },
  // POR LEVANTAR / EN ROADMAP
  {
    id: 'club-gerencia',
    name: 'Club de Gerencia IESA',
    status: 'in_development',
    image: '/img/paginas-nuevas/club-gerencia.png',
    category: 'Estudiantil & Egresados',
    description: 'Espacio de comunidad directiva, masterclasses exclusivas y foros de debate empresarial.',
    targetAudience: 'Alumnos, egresados y profesores invitados.',
    strategicGoal: 'Fidelización de la red IESA y generación de networking de alto nivel.',
    techStatus: 'Maquetado completado. Pendiente de integración con base de datos de egresados.'
  },
  {
    id: 'club-politicas',
    name: 'Club de Políticas y Asuntos Públicos',
    status: 'in_development',
    image: '/img/paginas-nuevas/club-politicas-publicas.png',
    category: 'Estudiantil & Egresados',
    description: 'Plataforma de discusión técnica sobre políticas económicas, marco regulatorio y sociedad.',
    targetAudience: 'Especialistas en políticas públicas, egresados de la MGP y analistas.',
    strategicGoal: 'Canalizar el debate institucional y posicionar la voz del IESA en la agenda país.',
    techStatus: 'Diseño listo. Planificada publicación en Q1.'
  },
  {
    id: 'emprende-tech',
    name: 'Emprende Tech IESA',
    status: 'in_development',
    image: '/img/paginas-nuevas/emprende-tech.png',
    category: 'Innovación & ESG',
    description: 'Hub de incubación y aceleración para startups de base tecnológica en la región.',
    targetAudience: 'Emprendedores tecnológicos, inversionistas ángel y fondos de Venture Capital.',
    strategicGoal: 'Atraer talento emprendedor joven y vincular la academia con el capital de riesgo.',
    techStatus: 'Estructura montada. En revisión de contenidos con el CIEA.'
  },
  {
    id: 'expo-empleo',
    name: 'Expo Empleo IESA',
    status: 'in_development',
    image: '/img/paginas-nuevas/expo-empleo.png',
    category: 'Institucional & Empleabilidad',
    description: 'Feria virtual de talento corporativo y plataforma de conexión laboral egresado-empresa.',
    targetAudience: 'Empresas multinacionales patrocinadoras y estudiantes de último trimestre.',
    strategicGoal: 'Demostrar el alto índice de empleabilidad y ROI de los títulos del IESA.',
    techStatus: 'Fase de prototipo funcional. Lanzamiento previsto para la temporada de graduación.'
  },
  {
    id: 'internacionalizacion',
    name: 'Portal de Internacionalización',
    status: 'in_development',
    image: '/img/paginas-nuevas/internacionalizacion.png',
    category: 'Institucional & Empleabilidad',
    description: 'Directorio de convenios internacionales, dobles titulaciones y misiones académicas.',
    targetAudience: 'Aspirantes que buscan proyección global y universidades socias en el exterior.',
    strategicGoal: 'Reforzar las credenciales de la triple corona del IESA y captar alumnos foráneos.',
    techStatus: 'Contenido validado con Dirección Académica. Próximo despliegue.'
  },
  {
    id: 'sostenibilidad',
    name: 'Sostenibilidad en Acción',
    status: 'in_development',
    image: '/img/paginas-nuevas/sostenibilidad-accion.png',
    category: 'Innovación & ESG',
    description: 'Portal de iniciativas de impacto social, ambiental y gobernanza (ESG) del IESA.',
    targetAudience: 'Organismos multilaterales, empresas con agenda de sostenibilidad y donantes.',
    strategicGoal: 'Visibilizar el impacto transformador del IESA en la sociedad.',
    techStatus: 'Diseño concluido. En cola de publicación.'
  }
];

// ==========================================
// MÉTRICAS DE POSTGRADOS (10 MESES ACUMULADOS 2026)
// ==========================================

const POSTGRADUATE_METRICS = [
  {
    name: 'MBA',
    views: 15074,
    users: 10219,
    clicks: 1918,
    impressions: 55163,
    ctr: 3.48,
    highlight: 'Líder en volumen total de tráfico institucional.',
    status: 'Maduro / Alta Intención'
  },
  {
    name: 'Maestría en Finanzas',
    views: 13640,
    users: 9101,
    clicks: 1451,
    impressions: 31954,
    ctr: 4.54,
    highlight: 'Excelente conversión orgánica y alta tasa de clics.',
    status: 'Alta Demanda'
  },
  {
    name: 'Maestría en Mercadeo',
    views: 8716,
    users: 6069,
    clicks: 714,
    impressions: 12301,
    ctr: 5.80,
    highlight: 'Mayor CTR orgánico del catálogo regular (5.80%).',
    status: 'Alta Eficiencia'
  },
  {
    name: 'Especialización Gerencia Operaciones',
    views: 8528,
    users: 6254,
    clicks: 484,
    impressions: 11288,
    ctr: 4.29,
    highlight: 'Fuerte tracción en sector industrial y logístico.',
    status: 'Estable'
  },
  {
    name: 'Maestría en Gerencia Pública',
    views: 6311,
    users: 4604,
    clicks: 882,
    impressions: 17767,
    ctr: 4.96,
    highlight: 'Alto interés en sector de desarrollo y políticas.',
    status: 'Crecimiento'
  },
  {
    name: 'Especialización Gerencia Legal',
    views: 451,
    users: 270,
    clicks: 35,
    impressions: 122,
    ctr: 28.69,
    highlight: 'Lanzamiento reciente (sep-oct) con CTR de nicho superior.',
    status: 'Nueva Incorporación'
  }
];

export default function ExecutivePresentation() {
  const [activeTab, setActiveTab] = useState<'overview' | 'ecosystem' | 'new-pages' | 'metrics-seo' | 'egm-model'>('overview');
  const [isSlideMode, setIsSlideMode] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [ecosystemFilter, setEcosystemFilter] = useState<'all' | 'core' | 'international' | 'periphery'>('all');
  const [pageStatusFilter, setPageStatusFilter] = useState<'all' | 'published' | 'in_development'>('all');

  const totalSlides = 5;

  const handleNextSlide = () => {
    if (currentSlide < totalSlides - 1) setCurrentSlide(curr => curr + 1);
  };

  const handlePrevSlide = () => {
    if (currentSlide > 0) setCurrentSlide(curr => curr - 1);
  };

  // Keyboard navigation for presentation mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isSlideMode) return;
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        handleNextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevSlide();
      } else if (e.key === 'Escape') {
        setIsSlideMode(false);
        setSelectedImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSlideMode, currentSlide]);

  const filteredEcosystem = ECOSYSTEM_DATA.filter(site => {
    if (ecosystemFilter === 'all') return true;
    return site.category === ecosystemFilter;
  });

  const filteredProjects = NEW_PAGE_PROJECTS.filter(project => {
    if (pageStatusFilter === 'all') return true;
    return project.status === pageStatusFilter;
  });

  return (
    <div className="w-full space-y-8 pb-24 text-slate-800 dark:text-slate-100">
      
      {/* ==========================================
          HEADER EJECUTIVO INSTITUCIONAL
          ========================================== */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-slate-700/60 rounded-3xl p-6 md:p-10 text-white shadow-2xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-300">
              <span className="bg-indigo-900/60 border border-indigo-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-indigo-400" />
                Comité Directivo y Académico IESA
              </span>
              <span className="bg-slate-800/60 border border-slate-700 px-3 py-1 rounded-full text-slate-300">
                Jueves, 5 de Noviembre
              </span>
              <span className="bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 px-3 py-1 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Datos Auditados GA4 & GSC 2026
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
              Estrategia, Expansión y Métricas del Ecosistema Digital IESA
            </h1>

            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Diagnóstico comparativo del inventario digital, catálogo de páginas nuevas (publicadas y en pipeline), análisis de relevancia e indexación SEO, y marco metodológico de aseguramiento técnico con el <strong className="text-indigo-300">Elephant-Goldfish Model (EGM de Google)</strong>.
            </p>

            <div className="flex items-center gap-3 pt-2 text-xs text-slate-400">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white shadow">
                GV
              </div>
              <div>
                <p className="font-semibold text-slate-200">Gabriel Vázquez</p>
                <p className="text-slate-400">Coordinación de Mercadeo y Comunicaciones — IESA</p>
              </div>
            </div>
          </div>

          {/* Action Button: Mode Toggle */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              onClick={() => {
                setIsSlideMode(!isSlideMode);
                setCurrentSlide(0);
              }}
              className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
            >
              {isSlideMode ? (
                <>
                  <FileBarChart className="w-5 h-5" />
                  Ver como Informe Continuo
                </>
              ) : (
                <>
                  <MonitorPlay className="w-5 h-5 text-indigo-200" />
                  Iniciar Modo Presentación (Diapositivas)
                </>
              )}
            </button>

            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50">
                <p className="text-slate-400 font-medium">Tráfico Ecosistema</p>
                <p className="text-lg font-black text-white">641K+ <span className="text-[10px] text-emerald-400 font-bold">Vistas</span></p>
              </div>
              <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50">
                <p className="text-slate-400 font-medium">Portales Nuevos</p>
                <p className="text-lg font-black text-white">14 <span className="text-[10px] text-indigo-400 font-bold">Proyectos</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
          BARRA DE NAVEGACIÓN POR SECCIONES (TABS)
          ========================================== */}
      {!isSlideMode && (
        <div className="flex overflow-x-auto gap-2 p-1.5 bg-slate-100 dark:bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-200 dark:border-slate-800 scrollbar-none sticky top-16 z-30 shadow-sm">
          {[
            { id: 'overview', label: '1. Resumen Ejecutivo', icon: Sparkles },
            { id: 'ecosystem', label: '2. Ecosistema Actual (Inventario)', icon: Globe },
            { id: 'new-pages', label: '3. Nuevas Páginas (14 Proyectos)', icon: Layers },
            { id: 'metrics-seo', label: '4. Métricas & Estrategias SEO', icon: TrendingUp },
            { id: 'egm-model', label: '5. Gobernanza EGM (Google)', icon: Cpu },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-md shadow-slate-200 dark:shadow-indigo-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-white' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      {/* ==========================================
          VISTA EN MODO DIAPOSITIVAS (SLIDES)
          ========================================== */}
      {isSlideMode && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-12 shadow-2xl relative min-h-[580px] flex flex-col justify-between text-white">
          
          {/* Slide Progress Indicator */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                Diapositiva {currentSlide + 1} de {totalSlides}
              </span>
              <div className="flex gap-1.5">
                {Array.from({ length: totalSlides }).map((_, idx) => (
                  <div 
                    key={idx}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === currentSlide ? 'w-8 bg-indigo-500' : 'w-2 bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={() => setIsSlideMode(false)}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              Salir de Modo Diapositivas (Esc)
            </button>
          </div>

          {/* Slide Content by Index */}
          <div className="py-8 my-auto">
            {currentSlide === 0 && (
              <div className="space-y-6 max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-900/60 border border-indigo-500/40 text-indigo-300 text-xs font-bold uppercase tracking-widest">
                  Presentación de Alto Impacto — Comité Directivo & Académico
                </div>
                <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
                  Evolución y Madurez del Ecosistema Digital IESA 2026
                </h2>
                <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
                  Cómo estamos articulando nuestras plataformas para captar más alumnos, retener profesionales de alto nivel e implementar estándares de gobernanza técnica probados en Google.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 text-left">
                  <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700">
                    <p className="text-xs font-bold text-indigo-400 uppercase">Punto 1</p>
                    <h3 className="font-bold text-white text-base mt-1">Ecosistema & Inventario</h3>
                    <p className="text-xs text-slate-400 mt-2">Diagnóstico de 11 portales. Sinergia entre IESA Principal y Debates IESA.</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700">
                    <p className="text-xs font-bold text-indigo-400 uppercase">Punto 2</p>
                    <h3 className="font-bold text-white text-base mt-1">14 Nuevas Páginas</h3>
                    <p className="text-xs text-slate-400 mt-2">Novedades en Postgrados, Empleabilidad, Clubes e Innovación ESG.</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700">
                    <p className="text-xs font-bold text-indigo-400 uppercase">Punto 3</p>
                    <h3 className="font-bold text-white text-base mt-1">Métricas, SEO & EGM</h3>
                    <p className="text-xs text-slate-400 mt-2">CTR en Google, captación orgánica y rigor técnico anti-alucinaciones.</p>
                  </div>
                </div>
              </div>
            )}

            {currentSlide === 1 && (
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Punto 1</span>
                  <h2 className="text-3xl md:text-4xl font-black text-white mt-1">El Ecosistema Digital Actual: Núcleo y Periféricas</h2>
                  <p className="text-slate-300 text-sm">Comparación del inventario de capacidades entre las páginas del IESA.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                        <Globe className="w-4 h-4" /> IESA Principal (iesa.edu.ve)
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30">Hub de Conversión</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-3 bg-slate-900/60 rounded-xl">
                        <p className="text-[11px] text-slate-400">Vistas 2026</p>
                        <p className="text-xl font-black text-white">544.7K</p>
                      </div>
                      <div className="p-3 bg-slate-900/60 rounded-xl">
                        <p className="text-[11px] text-slate-400">Usuarios Activos</p>
                        <p className="text-xl font-black text-white">185.0K</p>
                      </div>
                      <div className="p-3 bg-slate-900/60 rounded-xl">
                        <p className="text-[11px] text-slate-400">Tráfico Orgánico</p>
                        <p className="text-xl font-black text-emerald-400">67.6K</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Representa el 60% de la actividad global. Concentra las búsquedas de postgrados, inscripciones y la autoridad institucional máxima ante los buscadores.
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4" /> Debates IESA (debatesiesa.com)
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-500/30">Motor de Contenido</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-3 bg-slate-900/60 rounded-xl">
                        <p className="text-[11px] text-slate-400">Vistas 2026</p>
                        <p className="text-xl font-black text-white">96.2K</p>
                      </div>
                      <div className="p-3 bg-slate-900/60 rounded-xl">
                        <p className="text-[11px] text-slate-400">Permanencia</p>
                        <p className="text-xl font-black text-indigo-300">5m 54s</p>
                      </div>
                      <div className="p-3 bg-slate-900/60 rounded-xl">
                        <p className="text-[11px] text-slate-400">Tráfico Orgánico</p>
                        <p className="text-xl font-black text-indigo-400">38.9K</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      El imán de captación de perfiles gerenciales. Los lectores se quedan casi 6 minutos consumiendo análisis de alto nivel.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200">
                  💡 <strong>Conclusión Estratégica:</strong> Debates IESA atrae a los tomadores de decisiones; el reto pendiente es construir pasarelas de conversión que lleven a ese lector a matricularse en los postgrados de IESA Principal.
                </div>
              </div>
            )}

            {currentSlide === 2 && (
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Punto 2</span>
                  <h2 className="text-3xl md:text-4xl font-black text-white mt-1">14 Nuevos Proyectos Web del Año Fiscal</h2>
                  <p className="text-slate-300 text-sm">Separación estratégica entre proyectos en producción y los que están en pipeline.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-5 rounded-2xl bg-slate-800/80 border border-emerald-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-emerald-400 text-base flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" /> Publicadas en Producción (9)
                      </h3>
                      <span className="text-[10px] bg-emerald-950 px-2.5 py-1 rounded-full text-emerald-300">En Operación</span>
                    </div>
                    <ul className="text-xs space-y-2 text-slate-300">
                      <li>• <strong>Landing pages de Postgrados:</strong> MBA, Finanzas, Mercadeo, Gerencia Pública.</li>
                      <li>• <strong>Especializaciones:</strong> Gerencia Legal Corporativa y Gerencia de Operaciones.</li>
                      <li>• <strong>Hub de Posgrados:</strong> Rediseño completo para navegación ágil.</li>
                      <li>• <strong>Portal de Electivas:</strong> Gestión académica en tiempo real (electivas.iesa.edu.ve).</li>
                      <li>• <strong>Centro FAQ:</strong> Respuestas inmediatas y reducción de fricción en admisiones.</li>
                    </ul>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-800/80 border border-amber-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-amber-400 text-base flex items-center gap-2">
                        <Clock className="w-5 h-5" /> Levantadas por Publicar / Pipeline (5)
                      </h3>
                      <span className="text-[10px] bg-amber-950 px-2.5 py-1 rounded-full text-amber-300">En Cola</span>
                    </div>
                    <ul className="text-xs space-y-2 text-slate-300">
                      <li>• <strong>Club de Gerencia & Club de Políticas Públicas:</strong> Comunidades activas de networking.</li>
                      <li>• <strong>Emprende Tech IESA:</strong> Aceleradora y vínculo con startups e inversores.</li>
                      <li>• <strong>Expo Empleo IESA:</strong> Feria virtual de empleabilidad y bolsa de trabajo.</li>
                      <li>• <strong>Portal de Internacionalización:</strong> Credenciales y convenios con universidades globales.</li>
                      <li>• <strong>Sostenibilidad en Acción:</strong> Visibilidad de iniciativas ESG y liderazgo responsable.</li>
                    </ul>
                  </div>
                </div>

                <p className="text-center text-xs text-slate-400">
                  (En el informe continuo puedes ver las capturas de pantalla completas de cada una de estas 14 plataformas).
                </p>
              </div>
            )}

            {currentSlide === 3 && (
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Punto 3</span>
                  <h2 className="text-3xl md:text-4xl font-black text-white mt-1">Rendimiento en Buscadores (Google SEO) & Indexación</h2>
                  <p className="text-slate-300 text-sm">Análisis de la intención de búsqueda real de los aspirantes a postgrado en 2026.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                  <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700">
                    <p className="text-[11px] text-slate-400">MBA</p>
                    <p className="text-xl font-black text-white mt-1">15.0K <span className="text-xs text-slate-400">vistas</span></p>
                    <p className="text-xs text-emerald-400 mt-1 font-bold">1.9K Clics GSC (3.48% CTR)</p>
                  </div>
                  <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700">
                    <p className="text-[11px] text-slate-400">Maestría en Finanzas</p>
                    <p className="text-xl font-black text-white mt-1">13.6K <span className="text-xs text-slate-400">vistas</span></p>
                    <p className="text-xs text-emerald-400 mt-1 font-bold">1.4K Clics GSC (4.54% CTR)</p>
                  </div>
                  <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700">
                    <p className="text-[11px] text-slate-400">Maestría en Mercadeo</p>
                    <p className="text-xl font-black text-white mt-1">8.7K <span className="text-xs text-slate-400">vistas</span></p>
                    <p className="text-xs text-indigo-400 mt-1 font-bold">5.80% CTR (Líder CTR)</p>
                  </div>
                  <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700">
                    <p className="text-[11px] text-slate-400">Gerencia Legal</p>
                    <p className="text-xl font-black text-white mt-1">451 <span className="text-xs text-slate-400">vistas</span></p>
                    <p className="text-xs text-amber-400 mt-1 font-bold">28.6% CTR (Lanzamiento)</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/60 text-xs space-y-1.5">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Share2 className="w-4 h-4 text-indigo-400" /> 1. Arquitectura Pillar-Cluster
                    </span>
                    <p className="text-slate-400">Conectar artículos de Debates con páginas de maestrías afines para transferir autoridad de dominio.</p>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/60 text-xs space-y-1.5">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-emerald-400" /> 2. Indexación Automática
                    </span>
                    <p className="text-slate-400">Despacho directo vía Google Indexing API para que las páginas nuevas se indexen en menos de 24 horas.</p>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/60 text-xs space-y-1.5">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-400" /> 3. Datos Estructurados Schema
                    </span>
                    <p className="text-slate-400">Marcado JSON-LD de tipo Curso (Course) para destacar fechas de inicio y matrícula en las SERPs de Google.</p>
                  </div>
                </div>
              </div>
            )}

            {currentSlide === 4 && (
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Gobernanza de Vanguardia</span>
                  <h2 className="text-3xl md:text-4xl font-black text-white mt-1">Metodología Elephant-Goldfish Model (Google)</h2>
                  <p className="text-slate-300 text-sm">Cómo aseguramos que las plataformas se desarrollen sin deuda técnica ni errores.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 space-y-3">
                    <span className="text-2xl">🐘</span>
                    <h3 className="font-bold text-white text-base">El Elefante (Deep Context)</h3>
                    <p className="text-xs text-indigo-200 leading-relaxed">
                      Mantiene toda la memoria institucional, requerimientos académicos, reglas de negocio del IESA y esquemas de medición de GA4. Diseña las especificaciones formales.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-blue-950/40 border border-blue-500/40 space-y-3">
                    <span className="text-2xl">🐟</span>
                    <h3 className="font-bold text-white text-base">El Pez Dorado (Zero Context)</h3>
                    <p className="text-xs text-blue-200 leading-relaxed">
                      Subagentes de IA aislados con memoria efímera (cero sesgos de la charla). Auditan cada página con frialdad: ¿Es accesible? ¿Cumple SEO? ¿Falta código? ¿Hay sobreingeniería?
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-3">
                    <span className="text-2xl">👤</span>
                    <h3 className="font-bold text-white text-base">El Humano (Comité Directivo)</h3>
                    <p className="text-xs text-emerald-200 leading-relaxed">
                      El árbitro supremo. Ningún código se publica sin aprobación humana. EGM convierte a la IA en un copiloto riguroso, manteniendo el control ético e institucional 100% en el IESA.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 text-center">
                  ✅ <strong>Garantía para la Institución:</strong> Cero improvisación (*"Vibe Coding"*). Cada landing page cuenta con una especificación técnica viva y monitoreo continuo contra el desfase documental (*Drift Detection*).
                </div>
              </div>
            )}
          </div>

          {/* Slide Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-800">
            <button
              onClick={handlePrevSlide}
              disabled={currentSlide === 0}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition ${
                currentSlide === 0
                  ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500'
                  : 'bg-slate-800 hover:bg-slate-700 text-white'
              }`}
            >
              <ChevronLeft className="w-4 h-4" /> Diapositiva Anterior
            </button>

            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Usa las teclas de flecha ← / → para navegar
            </span>

            <button
              onClick={handleNextSlide}
              disabled={currentSlide === totalSlides - 1}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs transition ${
                currentSlide === totalSlides - 1
                  ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
              }`}
            >
              Siguiente Diapositiva <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ==========================================
          VISTA EN MODO INFORME CONTINUO (REPORT VIEW)
          ========================================== */}
      {!isSlideMode && (
        <div className="space-y-16">

          {/* ------------------------------------------
              SECCIÓN 1: RESUMEN EJECUTIVO
              ------------------------------------------ */}
          {(activeTab === 'overview' || activeTab === 'all') && (
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl border border-indigo-200 dark:border-indigo-800/40 text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">Resumen Ejecutivo: Los 3 Puntos Clave</h2>
                  <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">Lineamiento directivo para la presentación de este jueves.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-indigo-500 transition group">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                    01
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-500 transition">
                    Ecosistema Digital Actual
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Diagnóstico comparativo de 11 propiedades web (2025 vs 2026). Demuestra el liderazgo de <strong>IESA Principal</strong> como generador de autoridad y la consolidación de <strong>Debates IESA</strong> como un activo estratégico de captación orgánica con un tiempo de lectura de <strong>casi 6 minutos</strong>.
                  </p>
                  <button 
                    onClick={() => setActiveTab('ecosystem')}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:gap-2 transition-all"
                  >
                    Ver Inventario Completo <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-indigo-500 transition group">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                    02
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-500 transition">
                    14 Nuevos Proyectos
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Catálogo de las 9 landing pages y portales incorporados en producción durante el año fiscal (Postgrados, Hub y Electivas) más los 5 proyectos clave listos para levantarse (Clubes estudiantiles, Emprende Tech, Expo Empleo e Internacionalización).
                  </p>
                  <button 
                    onClick={() => setActiveTab('new-pages')}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:gap-2 transition-all"
                  >
                    Explorar Galería de Proyectos <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-indigo-500 transition group">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                    03
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-500 transition">
                    Métricas SEO & Metodología EGM
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Comportamiento de la demanda en Google para los postgrados (CTR de hasta 5.8% y 28% en nicho legal). Marco de gobernanza con <strong>Elephant-Goldfish Model de Google</strong> para blindar los desarrollos de software y analíticas.
                  </p>
                  <button 
                    onClick={() => setActiveTab('metrics-seo')}
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:gap-2 transition-all"
                  >
                    Ver Estrategias SEO y EGM <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* ------------------------------------------
              SECCIÓN 2: ECOSISTEMA ACTUAL (INVENTARIO)
              ------------------------------------------ */}
          {(activeTab === 'ecosystem' || activeTab === 'all') && (
            <section className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-800/40 text-blue-600 dark:text-blue-400">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Punto 1: Ecosistema Digital Actual</h2>
                    <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
                      Comparativa histórica (2025 vs 2026) y matriz de relaciones del inventario de capacidades.
                    </p>
                  </div>
                </div>

                {/* Category Filter */}
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                  <span className="text-slate-400 pl-2 font-medium">Filtrar:</span>
                  {[
                    { id: 'all', label: 'Todas' },
                    { id: 'core', label: 'Núcleo' },
                    { id: 'international', label: 'Internacionales' },
                    { id: 'periphery', label: 'Periféricas' }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setEcosystemFilter(f.id as any)}
                      className={`px-3 py-1.5 rounded-lg font-bold transition ${
                        ecosystemFilter === f.id
                          ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table Card */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                        <th className="p-4">Propiedad / Dominio</th>
                        <th className="p-4">Rol en el Ecosistema</th>
                        <th className="p-4 text-right">Usuarios 2025</th>
                        <th className="p-4 text-center">Tiempo 2025</th>
                        <th className="p-4 text-right">Usuarios 2026*</th>
                        <th className="p-4 text-center">Tiempo 2026</th>
                        <th className="p-4">Diagnóstico Estratégico</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                      {filteredEcosystem.map(site => (
                        <tr key={site.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                          <td className="p-4">
                            <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                              {site.name}
                              <a href={site.url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-500">
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono">{site.url.replace('https://', '')}</span>
                          </td>
                          <td className="p-4">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              site.category === 'core' 
                                ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                                : site.category === 'international'
                                ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}>
                              {site.role}
                            </span>
                          </td>
                          <td className="p-4 text-right font-mono text-slate-600 dark:text-slate-300">
                            {site.users2025.toLocaleString()}
                          </td>
                          <td className="p-4 text-center font-mono text-slate-500">
                            {site.time2025}
                          </td>
                          <td className="p-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                            {site.users2026.toLocaleString()}
                          </td>
                          <td className="p-4 text-center font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {site.time2026}
                          </td>
                          <td className="p-4 text-slate-600 dark:text-slate-300 max-w-xs text-xs leading-relaxed">
                            {site.diagnosis}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 flex flex-wrap justify-between items-center gap-2">
                  <span>*Datos de 2026 reflejan el corte oficial auditado de la matriz Ecosistema IESA.</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Fuente: Google Analytics 4 API & Google Search Console API</span>
                </div>
              </div>

              {/* Insights Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 space-y-2">
                  <h4 className="font-bold text-indigo-900 dark:text-indigo-300 text-sm">1. La Joya de Engagement: Debates IESA</h4>
                  <p className="text-xs text-indigo-800 dark:text-indigo-200/80 leading-relaxed">
                    El tiempo promedio de permanencia saltó a <strong>5m 54s</strong>. Los usuarios leen artículos completos de economía y gerencia, posicionando al IESA como una autoridad intelectual en la región.
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 space-y-2">
                  <h4 className="font-bold text-emerald-900 dark:text-emerald-300 text-sm">2. Sinergia y Pasarelas de Conversión</h4>
                  <p className="text-xs text-emerald-800 dark:text-emerald-200/80 leading-relaxed">
                    Existe una oportunidad inmediata de incorporar banners nativos contextuales en los artículos de Debates para derivar tráfico calificado hacia la postulación de maestrías afines.
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 space-y-2">
                  <h4 className="font-bold text-amber-900 dark:text-amber-300 text-sm">3. Desafío en Portales Periféricos</h4>
                  <p className="text-xs text-amber-800 dark:text-amber-200/80 leading-relaxed">
                    Sitios como Alumni, Foundation y Panamá dependen fuertemente del tráfico directo (más del 70%). Deben nutrirse del SEO global del dominio raíz para ganar visibilidad orgánica autónoma.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* ------------------------------------------
              SECCIÓN 3: NUEVAS PÁGINAS (14 PROYECTOS)
              ------------------------------------------ */}
          {(activeTab === 'new-pages' || activeTab === 'all') && (
            <section className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl border border-emerald-200 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Punto 2: Nuevas Páginas y Proyectos del Año Fiscal</h2>
                    <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
                      Inventario visual de las 14 plataformas: 9 publicadas en producción y 5 preparadas en el pipeline de desarrollo.
                    </p>
                  </div>
                </div>

                {/* Filter Controls */}
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                  <span className="text-slate-400 pl-2 font-medium">Estado:</span>
                  {[
                    { id: 'all', label: 'Todas (14)' },
                    { id: 'published', label: 'Publicadas (9)' },
                    { id: 'in_development', label: 'En Pipeline (5)' }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setPageStatusFilter(f.id as any)}
                      className={`px-3 py-1.5 rounded-lg font-bold transition ${
                        pageStatusFilter === f.id
                          ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gallery Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map(project => (
                  <div 
                    key={project.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                  >
                    {/* Image Thumbnail Container */}
                    <div 
                      className="relative h-48 bg-slate-100 dark:bg-slate-950 overflow-hidden cursor-pointer"
                      onClick={() => setSelectedImage(project.image)}
                    >
                      <img 
                        src={project.image} 
                        alt={project.name}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <span className="text-white text-xs font-semibold flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg backdrop-blur">
                          <Maximize2 className="w-3.5 h-3.5" /> Ampliar Captura
                        </span>
                      </div>

                      {/* Status Badge */}
                      <div className="absolute top-3 left-3">
                        {project.status === 'published' ? (
                          <span className="bg-emerald-600/90 backdrop-blur text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow">
                            <CheckCircle2 className="w-3 h-3" /> Publicada
                          </span>
                        ) : (
                          <span className="bg-amber-600/90 backdrop-blur text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow">
                            <Clock className="w-3 h-3" /> En Pipeline
                          </span>
                        )}
                      </div>

                      <div className="absolute top-3 right-3">
                        <span className="bg-slate-900/80 backdrop-blur text-slate-300 text-[10px] font-medium px-2 py-0.5 rounded-md">
                          {project.category}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug">
                          {project.name}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                          {project.description}
                        </p>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                        <div>
                          <span className="text-slate-400 font-medium">Audiencia Objetivo:</span>
                          <p className="font-semibold text-slate-700 dark:text-slate-300">{project.targetAudience}</p>
                        </div>
                        <div>
                          <span className="text-slate-400 font-medium">Objetivo Institucional:</span>
                          <p className="font-semibold text-indigo-600 dark:text-indigo-400">{project.strategicGoal}</p>
                        </div>
                      </div>

                      <div className="pt-2 text-[10px] font-mono text-slate-400">
                        {project.techStatus}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ------------------------------------------
              SECCIÓN 4: MÉTRICAS DE POSTGRADOS & ESTRATEGIAS SEO
              ------------------------------------------ */}
          {(activeTab === 'metrics-seo' || activeTab === 'all') && (
            <section className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-50 dark:bg-amber-900/30 rounded-xl border border-amber-200 dark:border-amber-800/40 text-amber-600 dark:text-amber-400">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">Punto 3: Métricas Reales & Estrategias de Indexación</h2>
                  <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
                    Desempeño acumulado en 2026 en Google y hoja de ruta de aceleración orgánica.
                  </p>
                </div>
              </div>

              {/* Performance Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {POSTGRADUATE_METRICS.map((prog, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">{prog.name}</h3>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {prog.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl">
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">Vistas (GA4)</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white font-mono mt-0.5">{prog.views.toLocaleString()}</p>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl">
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">Usuarios Únicos</p>
                        <p className="text-lg font-black text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">{prog.users.toLocaleString()}</p>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl">
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">Clics en Google</p>
                        <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">{prog.clicks.toLocaleString()}</p>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl">
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">CTR Promedio</p>
                        <p className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5">{prog.ctr.toFixed(2)}%</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400">
                      💡 <strong>Comportamiento:</strong> {prog.highlight}
                    </div>
                  </div>
                ))}
              </div>

              {/* 4 Pillars Action Plan */}
              <div className="bg-gradient-to-br from-indigo-900/10 via-slate-900/5 to-transparent p-6 md:p-8 rounded-3xl border border-indigo-100 dark:border-indigo-900/50 space-y-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-500" />
                  Estrategias para Impulsar Indexación y Relevancia en el Ecosistema
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">Estrategia 1</span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Arquitectura Pillar-Cluster</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Conectar los 50 artículos de mayor tráfico en <em>Debates IESA</em> con las páginas de maestrías relevantes. Esto inyecta autoridad temática (Domain Authority) directamente en los programas comerciales.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">Estrategia 2</span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Google Indexing API</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Configuración del protocolo de notificación en tiempo real a Googlebot para indexar landings de eventos (Expo Empleo) y convocatorias de postgrado en menos de 24 horas, evitando demoras de rastreo.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">Estrategia 3</span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Marcado Schema.org (JSON-LD)</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Implementar datos enriquecidos para <code>EducationalOccupationalProgram</code> y <code>Course</code>. Permite que Google muestre costos, modalidades y fechas en las tarjetas de resultados orgánicos.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase">Estrategia 4</span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Optimización de CTR en SERP</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Ajuste de meta-títulos y descripciones con llamados a la acción (CTAs) de admisión para elevar el CTR promedio del catálogo de 3.5% al objetivo directivo del 6.0%.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ------------------------------------------
              SECCIÓN 5: GOBERNANZA EGM (GOOGLE)
              ------------------------------------------ */}
          {(activeTab === 'egm-model' || activeTab === 'all') && (
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-50 dark:bg-purple-900/30 rounded-xl border border-purple-200 dark:border-purple-800/40 text-purple-600 dark:text-purple-400">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">Gobernanza y Calidad Técnica: Elephant-Goldfish Model (EGM)</h2>
                  <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
                    La metodología de ingeniería de software de Google que adoptamos para garantizar coherencia, calidad de código y cero deuda técnica.
                  </p>
                </div>
              </div>

              {/* The Three Pillars Diagram */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">🐘</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                      Deep Context
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">El Elefante (Arquitecto)</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Mantiene todo el contexto acumulativo del IESA: historia del proyecto, directrices de marca, arquitectura de las APIs de GA4 y código existente. Explora requisitos y redacta las especificaciones técnicas formales.
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">🐟</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                      Zero Context
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">El Pez Dorado (Auditor Ciego)</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Subagentes aislados que evalúan el documento sin conocer la charla previa. No tienen sesgo de confirmación ni complacencia. Auditan la simplicidad (YAGNI), posibles fallos a escala y preparación técnica.
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">👤</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      Supervisión Total
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">El Humano (Comité / Ingeniero)</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    El único dueño de las decisiones. Evalúa los hallazgos de los revisores, calibra los trade-offs presupuestarios y aprueba el diseño antes de implementar una sola línea de código en producción.
                  </p>
                </div>
              </div>

              {/* The EGM Pipeline for IESA */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 space-y-4">
                <h4 className="font-bold text-slate-900 dark:text-white text-base">
                  ¿Por qué es indispensable este modelo para el IESA?
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-1.5">
                    <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" /> Blindaje contra la Alucinación y Complacencia
                    </p>
                    <p>
                      En el desarrollo tradicional asistido por IA, los modelos tienden a alabar las ideas del usuario y escribir código con errores silenciosos. EGM prohíbe la adulación (<em>"No Glazing"</em>) y fuerza a la IA a buscar los puntos débiles de cada landing page antes de construirla.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-1.5">
                    <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <RefreshCw className="w-4 h-4 text-indigo-500" /> Monitoreo Continuo de Desfase (Drift Report)
                    </p>
                    <p>
                      El comando <code>/egm-drift-report</code> compara periódicamente las especificaciones de oferta académica con el código publicado en la web para asegurar que nunca existan datos desactualizados en precios, fechas o pensums.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

        </div>
      )}

      {/* ==========================================
          MODAL DE ZOOM PARA CAPTURAS EN ALTA RESOLUCIÓN
          ========================================== */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-white">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-400" /> Inspección de Landing Page
              </span>
              <button 
                onClick={() => setSelectedImage(null)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-auto p-4 flex items-center justify-center bg-slate-950/50">
              <img 
                src={selectedImage} 
                alt="Detalle de Landing Page" 
                className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

