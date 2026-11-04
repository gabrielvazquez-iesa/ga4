import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Globe, TrendingUp, TrendingDown, ExternalLink, CheckCircle2, 
  Clock, Maximize2, X, ChevronRight, RefreshCw,
  Sun, Moon, ArrowDown, Sparkles, Search, 
  Bot, Palette, Check, Wrench
} from 'lucide-react';
import TiltedGridHero from './ui/tilted-grid-hero';

// =================================================================
// 1. DATA AUDITADA DE ECOSISTEMA E INDICADORES IESA (GA4 EN VIVO)
// =================================================================

interface SiteMetric {
  id: string;
  name: string;
  url: string;
  domainDisplay: string;
  category: 'core' | 'internacional' | 'comunidad';
  users2025: number;
  time2025: string;
  organic2025: number;
  direct2025: number;
  users2026: number;
  time2026: string;
  organic2026: number;
  direct2026: number;
  role: string;
}

const INITIAL_SITES_DATA: SiteMetric[] = [
  {
    id: 'iesa-ve',
    name: 'IESA Principal',
    url: 'https://www.iesa.edu.ve',
    domainDisplay: 'www.iesa.edu.ve',
    category: 'core',
    users2025: 282339,
    time2025: '4m 44s',
    organic2025: 113187,
    direct2025: 59371,
    users2026: 180872,
    time2026: '3m 10s',
    organic2026: 113921,
    direct2026: 66225,
    role: 'Portal institucional principal, centro de admisiones y oferta académica integral.'
  },
  {
    id: 'debates-iesa',
    name: 'Debates IESA',
    url: 'https://www.debatesiesa.com',
    domainDisplay: 'www.debatesiesa.com',
    category: 'core',
    users2025: 72227,
    time2025: '3m 10s',
    organic2025: 39113,
    direct2025: 37385,
    users2026: 63445,
    time2026: '2m 38s',
    organic2026: 39113,
    direct2026: 37385,
    role: 'Revista de divulgación gerencial, análisis económico y liderazgo de opinión.'
  },
  {
    id: 'iesa-foundation',
    name: 'IESA Foundation',
    url: 'https://iesafoundation.org',
    domainDisplay: 'iesafoundation.org',
    category: 'comunidad',
    users2025: 15248,
    time2025: '1m 23s',
    organic2025: 715,
    direct2025: 15266,
    users2026: 647158,
    time2026: '0m 04s',
    organic2026: 669,
    direct2026: 639078,
    role: 'Iniciativas filantrópicas, recaudación de fondos y becas estudiantiles.'
  },
  {
    id: 'iesa-alumni',
    name: 'IESA Alumni',
    url: 'https://www.iesaalumni.org',
    domainDisplay: 'www.iesaalumni.org',
    category: 'comunidad',
    users2025: 15427,
    time2025: '2m 08s',
    organic2025: 5529,
    direct2025: 10953,
    users2026: 11201,
    time2026: '1m 35s',
    organic2026: 2689,
    direct2026: 9137,
    role: 'Red global de relacionamiento, networking y actualización para egresados.'
  },
  {
    id: 'iesa-pa',
    name: 'IESA Panamá',
    url: 'https://www.iesa.edu.pa',
    domainDisplay: 'www.iesa.edu.pa',
    category: 'internacional',
    users2025: 4310,
    time2025: '0m 52s',
    organic2025: 3278,
    direct2025: 1209,
    users2026: 1632,
    time2026: '1m 49s',
    organic2026: 1039,
    direct2026: 760,
    role: 'Sede en Ciudad del Saber para atención y formación del mercado centroamericano.'
  },
  {
    id: 'consultoria-pa',
    name: 'Consultoría IESA Panamá',
    url: 'https://consultoria.iesa.edu.pa',
    domainDisplay: 'consultoria.iesa.edu.pa',
    category: 'internacional',
    users2025: 1613,
    time2025: '1m 05s',
    organic2025: 243,
    direct2025: 1471,
    users2026: 955,
    time2026: '0m 44s',
    organic2026: 79,
    direct2026: 811,
    role: 'Servicios de asesoría estratégica empresarial in-company.'
  },
  {
    id: 'intl-faculty',
    name: 'International Faculty',
    url: 'https://www.iesa.edu.pa/internationalfaculty',
    domainDisplay: 'www.iesa.edu.pa/internationalfaculty',
    category: 'internacional',
    users2025: 1618,
    time2025: '2m 10s',
    organic2025: 1473,
    direct2025: 393,
    users2026: 780,
    time2026: '1m 03s',
    organic2026: 529,
    direct2026: 330,
    role: 'Directorio y portal de vinculación del cuerpo docente internacional.'
  },
  {
    id: 'aol',
    name: 'AOL (Aulas Online)',
    url: 'https://aol.iesa.edu.ve',
    domainDisplay: 'aol.iesa.edu.ve',
    category: 'comunidad',
    users2025: 826,
    time2025: '1m 10s',
    organic2025: 351,
    direct2025: 604,
    users2026: 681,
    time2026: '2m 32s',
    organic2026: 59,
    direct2026: 635,
    role: 'Plataforma educativa y entorno de clases virtuales para la comunidad activa.'
  },
  {
    id: 'iesa-do',
    name: 'IESA Dominicana',
    url: 'https://www.iesa.edu.do',
    domainDisplay: 'www.iesa.edu.do',
    category: 'internacional',
    users2025: 937,
    time2025: '0m 57s',
    organic2025: 275,
    direct2025: 748,
    users2026: 714,
    time2026: '0m 50s',
    organic2026: 158,
    direct2026: 587,
    role: 'Formación ejecutiva y extensión académica en República Dominicana.'
  },
  {
    id: 'cslr',
    name: 'Centro de Sostenibilidad (CSLR)',
    url: 'https://www.iesa.edu.pa/cslr/',
    domainDisplay: 'www.iesa.edu.pa/cslr',
    category: 'comunidad',
    users2025: 651,
    time2025: '2m 38s',
    organic2025: 342,
    direct2025: 174,
    users2026: 275,
    time2026: '2m 30s',
    organic2026: 71,
    direct2026: 156,
    role: 'Investigación en gobernanza corporativa y liderazgo sostenible.'
  },
  {
    id: 'ciea',
    name: 'CIEA (Emprendimiento)',
    url: 'https://ciea.iesa.edu.pa',
    domainDisplay: 'ciea.iesa.edu.pa',
    category: 'comunidad',
    users2025: 423,
    time2025: '2m 34s',
    organic2025: 204,
    direct2025: 127,
    users2026: 439,
    time2026: '2m 40s',
    organic2026: 109,
    direct2026: 171,
    role: 'Centro de Innovación y aceleración de iniciativas de negocio.'
  }
];

// =================================================================
// 2. CATÁLOGO DE LAS 15 PÁGINAS (PUBLICADAS, PIPELINE Y DESARROLLO)
// =================================================================

export interface ProjectItem {
  id: string;
  name: string;
  urlPath: string;
  status: 'published' | 'future' | 'development';
  category: 'Postgrados' | 'Estudiantil' | 'Institucional' | 'Innovación';
  image: string;
  description: string;
  objective: string;
}

const PROJECTS: ProjectItem[] = [
  // 1. EN DESARROLLO (DE PRIMERO)
  {
    id: 'checkout-refactor',
    name: 'Refactorización checkout de productos',
    urlPath: 'https://www.iesa.edu.ve/checkout',
    status: 'development',
    category: 'Innovación',
    image: '/img/paginas-nuevas/checkout-step-by-step.svg',
    description: 'Rediseño del flujo de checkout y postulación mediante un asistente paso a paso (step-by-step) para eliminar cuellos de botella y reducir la fricción de conversión.',
    objective: 'Maximizar la tasa de conversión y agilizar los pagos y admisiones sin fricción.'
  },
  {
    id: 'multi-idioma-acreditadoras',
    name: 'Sitio bilingüe multi-idioma (acreditadoras)',
    urlPath: 'https://www.iesa.edu.ve/en',
    status: 'development',
    category: 'Internacional',
    image: '/img/paginas-nuevas/multi-idioma-acreditadoras.svg',
    description: 'Despliegue de 109 páginas bilingües (Español / Inglés) estructuradas para auditorías de las cuatro agencias acreditadoras internacionales (AACSB, AMBA, NASPAA, EFMD), abarcando los pilares institucionales y el directorio completo de perfiles de profesores e investigadores.',
    objective: 'Cumplimiento de estándares de acreditación internacional y proyección académica global de la facultad docente.'
  },

  // 2. PÁGINAS ACTIVAS E INSTITUCIONALES PUBLICADAS
  {
    id: 'hub-posgrados',
    name: 'Hub central de posgrados',
    urlPath: 'https://www.iesa.edu.ve/postgrados',
    status: 'published',
    category: 'Postgrados',
    image: '/img/paginas-nuevas/hub-posgrados.png',
    description: 'Portal consolidador de la oferta académica integral de maestrías y especializaciones.',
    objective: 'Facilitar la navegación del aspirante entre todas las opciones formativas.'
  },
  {
    id: 'especializacion-legal',
    name: 'Especialización en gerencia legal corporativa',
    urlPath: 'https://www.iesa.edu.ve/especializacion-en-gerencia-legal-corporativa',
    status: 'published',
    category: 'Postgrados',
    image: '/img/paginas-nuevas/especializacion-legal.png',
    description: 'Nueva oferta que articula el derecho societario con la toma de decisiones empresariales.',
    objective: 'Presentar la nueva especialización a firmas y departamentos legales.'
  },
  {
    id: 'landing-legal',
    name: 'Landing de admisión gerencia legal',
    urlPath: 'https://www.iesa.edu.ve/admisiones/gerencia-legal',
    status: 'published',
    category: 'Postgrados',
    image: '/img/paginas-nuevas/landing-especializacion-legal.png',
    description: 'Página de aterrizaje orientada a captación directa y descarga del brochure informativo.',
    objective: 'Generación directa de leads para el equipo de admisiones.'
  },
  {
    id: 'electivas',
    name: 'Portal de electivas IESA',
    urlPath: 'https://electivas.iesa.edu.ve',
    status: 'published',
    category: 'Estudiantil',
    image: '/img/paginas-nuevas/electivas.png',
    description: 'Plataforma para la selección y consulta de materias electivas trimestrales.',
    objective: 'Agilizar la elección de asignaturas e inscripción académica.'
  },
  {
    id: 'faq',
    name: 'Centro de preguntas frecuentes (FAQ)',
    urlPath: 'https://www.iesa.edu.ve/preguntas-frecuentes',
    status: 'published',
    category: 'Institucional',
    image: '/img/paginas-nuevas/faq.png',
    description: 'Banco estructurado de respuestas para dudas sobre admisiones, pagos y modalidades de clase.',
    objective: 'Atención continua al usuario y alimentación directa para motores de IA (GEO).'
  },
  {
    id: 'emprende-tech',
    name: 'Emprende Tech IESA',
    urlPath: 'https://www.iesa.edu.ve/emprende-tech',
    status: 'published',
    category: 'Innovación',
    image: '/img/paginas-nuevas/emprende-tech.png',
    description: 'Plataforma para el impulso de startups, innovación y proyectos tecnológicos.',
    objective: 'Articular alianzas entre emprendedores, docentes e inversionistas.'
  },
  {
    id: 'expo-empleo',
    name: 'Expo Empleo IESA',
    urlPath: 'https://www.iesa.edu.ve/expo-empleo',
    status: 'published',
    category: 'Institucional',
    image: '/img/paginas-nuevas/expo-empleo.png',
    description: 'Feria virtual de talento corporativo para conectar a estudiantes con empresas aliadas.',
    objective: 'Elevar la empleabilidad y relación estratégica con empleadores.'
  },
  {
    id: 'sostenibilidad',
    name: 'Sostenibilidad en acción',
    urlPath: 'https://www.iesa.edu.ve/sostenibilidad',
    status: 'published',
    category: 'Innovación',
    image: '/img/paginas-nuevas/sostenibilidad-accion.png',
    description: 'Portal de iniciativas y proyectos de impacto social, ambiental y gobernanza (ASG).',
    objective: 'Comunicar el compromiso institucional con el desarrollo sostenible.'
  },

  // 3. LOS CLUBES JUNTOS EN EL ORDEN (GERENCIA Y POLÍTICAS PÚBLICAS)
  {
    id: 'club-gerencia',
    name: 'Club de gerencia IESA',
    urlPath: 'https://www.iesa.edu.ve/club-de-gerencia',
    status: 'published',
    category: 'Estudiantil',
    image: '/img/paginas-nuevas/club-gerencia.png',
    description: 'Comunidad directiva, encuentros profesionales y foros empresariales exclusivos.',
    objective: 'Fortalecer el networking y la vida comunitaria estudiantil.'
  },
  {
    id: 'club-politicas',
    name: 'Club de políticas y asuntos públicos',
    urlPath: 'https://www.iesa.edu.ve/club-politicas-publicas',
    status: 'future',
    category: 'Estudiantil',
    image: '/img/paginas-nuevas/club-politicas-publicas.png',
    description: 'Espacio de análisis y debate sobre institucionalidad, entorno económico y sociedad.',
    objective: 'Fomentar el debate riguroso entre estudiantes y expertos.'
  },

  // 4. INICIATIVA PENDIENTE ADICIONAL (INTERNACIONALIZACIÓN)
  {
    id: 'internacionalizacion',
    name: 'Portal de internacionalización',
    urlPath: 'https://www.iesa.edu.ve/internacionalizacion',
    status: 'future',
    category: 'Institucional',
    image: '/img/paginas-nuevas/internacionalizacion.png',
    description: 'Directorio de convenios académicos internacionales, alianzas y dobles titulaciones.',
    objective: 'Visibilizar la proyección global y movilidad académica del IESA.'
  },

  // 5. AL FINAL DEL LISTADO: LAS TRES MAESTRÍAS
  {
    id: 'mba',
    name: 'Maestría en administración (MBA)',
    urlPath: 'https://www.iesa.edu.ve/postgrados/maestria-en-administracion-mba',
    status: 'published',
    category: 'Postgrados',
    image: '/img/paginas-nuevas/maestria-administracion-mba.png',
    description: 'Landing optimizada del programa insignia con acreditaciones internacionales (AACSB, AMBA, EFMD).',
    objective: 'Presentar el claustro, plan de estudios y agilizar la postulación de aspirantes.'
  },
  {
    id: 'finanzas',
    name: 'Maestría en finanzas',
    urlPath: 'https://www.iesa.edu.ve/postgrados/maestria-en-finanzas',
    status: 'published',
    category: 'Postgrados',
    image: '/img/paginas-nuevas/maestria-finanzas.png',
    description: 'Programa para profesionales del sector financiero, bancario y tesorería corporativa.',
    objective: 'Dar visibilidad al perfil de egreso y requisitos de ingreso.'
  },
  {
    id: 'gerencia-publica',
    name: 'Maestría en gerencia pública',
    urlPath: 'https://www.iesa.edu.ve/postgrados/maestria-en-gerencia-publica',
    status: 'published',
    category: 'Postgrados',
    image: '/img/paginas-nuevas/maestria-gerencia-publica.png',
    description: 'Programa para servidores públicos, líderes de ONGs y consultores en desarrollo.',
    objective: 'Formar en gestión pública ética y formulación de políticas sostenibles.'
  }
];

const HERO_IMAGES = [
  { src: "/img/hero/Posgrados.png", alt: "Posgrados IESA" },
  { src: "/img/hero/maestria-en-administracion.png", alt: "Maestría en Administración (MBA)" },
  { src: "/img/hero/electivas.png", alt: "Portal de Electivas IESA" },
  { src: "/img/hero/Emprende-Tech-IESA.png", alt: "Emprende Tech IESA" },
  { src: "/img/hero/Expo-Empleo.png", alt: "Expo Empleo IESA" },
];

// =================================================================
// 3. MÉTRICAS BASE DE POSTGRADOS 2026 (GA4 + GSC)
// =================================================================

interface PostgradItem {
  name: string;
  shortName: string;
  views: number;
  clicks: number;
  impressions: number;
  ctr: string;
  note: string;
}

const INITIAL_POSTGRAD_METRICS: PostgradItem[] = [
  {
    name: 'Maestría en Administración (MBA)',
    shortName: 'MBA',
    views: 15191,
    clicks: 1918,
    impressions: 55042,
    ctr: '3.48%',
    note: 'Programa de mayor volumen con 15.191 vistas y fuerte interés orgánico continuo.'
  },
  {
    name: 'Maestría en Finanzas',
    shortName: 'Finanzas',
    views: 13742,
    clicks: 1451,
    impressions: 31971,
    ctr: '4.54%',
    note: 'Sólida demanda especializada con 11.831 sesiones y 2m 29s de permanencia.'
  },
  {
    name: 'Maestría en Mercadeo',
    shortName: 'Mercadeo',
    views: 8794,
    clicks: 1290,
    impressions: 22100,
    ctr: '5.84%',
    note: 'El CTR más eficiente en postgrados (5.84%), demostrando alta afinidad de búsqueda.'
  },
  {
    name: 'Maestría en Gerencia y Operaciones',
    shortName: 'Operaciones',
    views: 8581,
    clicks: 812,
    impressions: 18450,
    ctr: '4.40%',
    note: 'Excelente retención de lectura con más de 2 minutos de promedio por sesión.'
  },
  {
    name: 'Maestría en Gerencia Pública',
    shortName: 'Gerencia Pública',
    views: 6382,
    clicks: 694,
    impressions: 16210,
    ctr: '4.28%',
    note: 'Público objetivo definido y sostenido en instituciones públicas y organizaciones civiles.'
  },
  {
    name: 'Especialización Gerencia Legal',
    shortName: 'Gerencia Legal',
    views: 543,
    clicks: 148,
    impressions: 515,
    ctr: '28.74%',
    note: 'Programa nuevo lanzado en septiembre 2026 con un CTR récord del 28.74% en Google.'
  }
];

const TRAFFIC_CHANNELS_DATA = [
  { name: 'Búsqueda Orgánica (Google)', value: 64, color: '#4f46e5' },
  { name: 'Tráfico Directo (Reconocimiento)', value: 22, color: '#06b6d4' },
  { name: 'Redes Sociales', value: 9, color: '#10b981' },
  { name: 'Referidos & Otros Canales', value: 5, color: '#f59e0b' },
];

export default function StandalonePresentation() {
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [sitesData, setSitesData] = useState<SiteMetric[]>(INITIAL_SITES_DATA);
  const [postgradData, setPostgradData] = useState<PostgradItem[]>(INITIAL_POSTGRAD_METRICS);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'core' | 'internacional' | 'comunidad'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'future' | 'development'>('all');
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [isLiveGA4, setIsLiveGA4] = useState<boolean>(false);
  const [isLoadingLive, setIsLoadingLive] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('3 de noviembre de 2026');
  const modalScrollRef = useRef<HTMLDivElement>(null);

  // Inicialización y persistencia garantizada del tema claro/oscuro
  useEffect(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark') {
        setTheme('dark');
        document.documentElement.classList.add('dark');
        document.body?.classList.add('dark');
      } else if (saved === 'light') {
        setTheme('light');
        document.documentElement.classList.remove('dark');
        document.body?.classList.remove('dark');
      } else {
        const isHtmlDark = document.documentElement.classList.contains('dark');
        setTheme(isHtmlDark ? 'dark' : 'light');
      }
    } catch (e) {}
  }, []);

  const changeTheme = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
    try {
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.body?.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body?.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    } catch (e) {}
  };

  const toggleTheme = () => {
    changeTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const isDark = theme === 'dark';

  // Sincronización en vivo con Google Analytics 4
  const fetchLiveMetrics = async () => {
    setIsLoadingLive(true);
    try {
      const res = await fetch('/api/live-presentation-metrics');
      if (res.ok) {
        const json = await res.json();
        if (json.isLive && json.properties) {
          setIsLiveGA4(true);
          setLastUpdated('3 de noviembre de 2026 (En vivo)');

          setSitesData(prev => prev.map(site => {
            const liveProp = json.properties.find((p: any) => p.name === site.name);
            if (liveProp && liveProp.y2026) {
              return {
                ...site,
                users2026: liveProp.y2026.users || site.users2026,
                time2026: liveProp.y2026.time || site.time2026,
                organic2026: liveProp.y2026.organic || site.organic2026,
                direct2026: liveProp.y2026.direct || site.direct2026,
              };
            }
            return site;
          }));

          if (json.postgrades) {
            setPostgradData(prev => prev.map(p => {
              const liveP = json.postgrades.find((lp: any) => lp.name === p.name);
              if (liveP && liveP.views > 0) {
                return {
                  ...p,
                  views: liveP.views
                };
              }
              return p;
            }));
          }
        }
      }
    } catch (e) {
      console.warn("Usando datos auditados oficiales.");
    } finally {
      setIsLoadingLive(false);
    }
  };

  useEffect(() => {
    fetchLiveMetrics();
  }, []);

  // Cerrar modal con la tecla Escape y resetear scroll al abrir
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedProject(null);
      }
    };

    if (selectedProject) {
      window.addEventListener('keydown', handleKeyDown);
      if (modalScrollRef.current) {
        modalScrollRef.current.scrollTop = 0;
      }
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedProject]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const filteredProjects = PROJECTS.filter(p => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'published') return p.status === 'published';
    if (statusFilter === 'future') return p.status === 'future';
    if (statusFilter === 'development') return p.status === 'development';
    return true;
  });

  const filteredSites = sitesData.filter(s => {
    if (categoryFilter === 'all') return true;
    return s.category === categoryFilter;
  });

  // Cálculo de comparativas 2025 vs 2026
  const sitesComparisonList = useMemo(() => {
    const p1 = sitesData.find(s => s.id === 'iesa-ve');
    const p2 = sitesData.find(s => s.id === 'debates-iesa');
    const p3 = sitesData.find(s => s.id === 'iesa-alumni');
    const p4 = sitesData.find(s => s.id === 'iesa-pa');

    return [
      { name: 'IESA Principal', u2025: p1?.users2025 || 282339, u2026: p1?.users2026 || 180872 },
      { name: 'Debates IESA', u2025: p2?.users2025 || 72227, u2026: p2?.users2026 || 63445 },
      { name: 'IESA Alumni', u2025: p3?.users2025 || 15427, u2026: p3?.users2026 || 11201 },
      { name: 'IESA Panamá', u2025: p4?.users2025 || 4310, u2026: p4?.users2026 || 1632 }
    ];
  }, [sitesData]);

  const maxCompareUser = Math.max(...sitesComparisonList.flatMap(s => [s.u2025, s.u2026]));
  const maxPostgradView = Math.max(...postgradData.map(p => p.views));

  return (
    <div className={`min-h-screen font-sans antialiased transition-colors duration-300 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* =================================================================
          CABECERA FLOTANTE TIPO PÍLDORA (FLOATING PILL NAVBAR)
          ================================================================= */}
      <div className="sticky top-4 sm:top-5 z-50 px-4 sm:px-6 pointer-events-none">
        <header className={`max-w-6xl mx-auto rounded-full border backdrop-blur-xl px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between pointer-events-auto transition-all duration-300 shadow-xl ${
          isDark 
            ? 'bg-slate-950/80 border-slate-800/90 shadow-2xl shadow-indigo-950/25 text-white' 
            : 'bg-white/85 border-slate-200/90 shadow-lg shadow-slate-300/40 text-slate-900'
        }`}>
          
          {/* Logo y Metadatos */}
          <div className="flex items-center gap-3">
            <img 
              src={isDark ? "/img/logo-white.png" : "/img/logo-black.png"} 
              alt="Logo IESA" 
              className="h-7 sm:h-8 w-auto object-contain transition-opacity duration-300"
            />
            <div className={`h-5 w-px hidden sm:block ${isDark ? 'bg-slate-800' : 'bg-slate-300'}`} />
            <div className="hidden sm:block">
              <p className={`text-[11px] font-bold tracking-wider uppercase leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Presentación ejecutiva
              </p>
              <p className={`text-[10px] mt-0.5 leading-none ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Gabriel Vázquez · Webmaster
              </p>
            </div>
          </div>

          {/* Navegación a las 3 Secciones */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold">
            <button
              onClick={() => scrollToSection('ecosistema')}
              className={`px-3.5 py-1.5 rounded-full transition cursor-pointer ${
                isDark ? 'text-slate-300 hover:text-white hover:bg-slate-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              1. Ecosistema actual
            </button>
            <button
              onClick={() => scrollToSection('paginas-nuevas')}
              className={`px-3.5 py-1.5 rounded-full transition cursor-pointer ${
                isDark ? 'text-slate-300 hover:text-white hover:bg-slate-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              2. 16 proyectos web
            </button>
            <button
              onClick={() => scrollToSection('metricas-estrategias')}
              className={`px-3.5 py-1.5 rounded-full transition cursor-pointer ${
                isDark ? 'text-slate-300 hover:text-white hover:bg-slate-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              3. UX, SEO y GEO
            </button>
          </nav>

          {/* Sincronización GA4 y Selector de Modo Claro / Oscuro */}
          <div className="flex items-center gap-2">
            <button
              onClick={fetchLiveMetrics}
              disabled={isLoadingLive}
              className={`px-3 py-1.5 rounded-full border transition-all text-xs flex items-center gap-1.5 cursor-pointer ${
                isDark 
                  ? 'bg-slate-900/90 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white' 
                  : 'bg-slate-100/90 hover:bg-slate-200/80 border-slate-200 text-slate-700 shadow-2xs'
              }`}
              title="Sincronizar métricas con Google Analytics 4"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingLive ? 'animate-spin text-indigo-400' : ''}`} />
              <span className="hidden md:inline font-medium text-[11px]">GA4 {isLiveGA4 ? 'Conectado' : 'Auditado'}</span>
            </button>

            {/* Selector Segmentado de Modo Claro / Oscuro */}
            <div className={`flex items-center p-0.5 rounded-full border text-xs transition-all ${
              isDark 
                ? 'bg-slate-900/90 border-slate-800' 
                : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                onClick={() => changeTheme('light')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer ${
                  !isDark 
                    ? 'bg-white text-indigo-600 shadow-xs' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Activar Modo Claro"
              >
                <Sun className="w-3.5 h-3.5" />
                <span className="text-[11px]">Claro</span>
              </button>
              <button
                onClick={() => changeTheme('dark')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer ${
                  isDark 
                    ? 'bg-indigo-600 text-white shadow-xs' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Activar Modo Oscuro"
              >
                <Moon className="w-3.5 h-3.5" />
                <span className="text-[11px]">Oscuro</span>
              </button>
            </div>
          </div>
        </header>
      </div>

      {/* =================================================================
          HERO BANNER CON TILTED GRID (STREAM CURVO EN 3D DE CAPTURAS)
          ================================================================= */}
      <section className={`relative overflow-hidden border-b transition-colors ${
        isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-100/60'
      }`}>
        <TiltedGridHero
          images={HERO_IMAGES}
          speed={8.5}
          tileHeight={30}
          aspectRatio={16 / 9}
          curve={70}
          fade={15}
          className="min-h-[600px] md:min-h-[660px] flex items-center justify-center py-20 px-6 md:px-12"
        >
          {/* Tarjeta flotante central con texto de la presentación */}
          <div className={`relative z-20 max-w-3xl mx-auto text-center space-y-7 p-8 sm:p-12 rounded-3xl border backdrop-blur-md shadow-2xl transition-colors ${
            isDark 
              ? 'bg-slate-950/85 border-slate-800 text-white shadow-indigo-950/30' 
              : 'bg-white/90 border-slate-200/90 text-slate-900 shadow-slate-300/60'
          }`}>
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold backdrop-blur-md bg-indigo-500/10 text-indigo-500 border-indigo-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Coordinación de Comunicaciones · IESA</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.15]">
                Evolución y rendimiento del ecosistema digital IESA
              </h1>

              <p className={`text-base sm:text-lg max-w-2xl mx-auto leading-relaxed ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}>
                Diagnóstico del inventario digital institucional con datos reales de Google Analytics 4, catálogo de 16 proyectos web y plan de posicionamiento en UX, SEO y Motores de IA (GEO).
              </p>
            </div>

            {/* Metadatos del Expositor */}
            <div className={`flex flex-wrap items-center justify-center gap-6 text-xs ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              <div>
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Expositor:</span> Gabriel Vázquez
              </div>
              <div>
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Cargo:</span> Webmaster — Coordinación de Comunicaciones
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Data GA4:</span> {lastUpdated}
              </div>
            </div>

            {/* Botones de Navegación Rápida */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => scrollToSection('ecosistema')}
                className="px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>1. Ecosistema actual</span>
                <ArrowDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollToSection('paginas-nuevas')}
                className={`px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm border transition-all flex items-center gap-2 cursor-pointer ${
                  isDark 
                    ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700' 
                    : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200 shadow-xs'
                }`}
              >
                <span>2. 16 proyectos web</span>
                <ArrowDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollToSection('metricas-estrategias')}
                className={`px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm border transition-all flex items-center gap-2 cursor-pointer ${
                  isDark 
                    ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700' 
                    : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200 shadow-xs'
                }`}
              >
                <span>3. UX, SEO y GEO</span>
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </TiltedGridHero>
      </section>

      {/* =================================================================
          CUERPO PRINCIPAL (ESPACIOS AMPLIOS Y SECCIONES CLARAS)
          ================================================================= */}
      <main className="max-w-7xl mx-auto px-6 md:px-10 py-24 space-y-36">

        {/* =============================================================
            PUNTO 1: EL ECOSISTEMA DIGITAL ACTUAL
            ============================================================= */}
        <section id="ecosistema" className="space-y-16 scroll-mt-28">
          
          <div className="max-w-3xl space-y-3">
            <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest">
              Punto 1 de la presentación
            </p>
            <h2 className={`text-3xl sm:text-4xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              El ecosistema digital actual
            </h2>
            <p className={`text-base leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Comportamiento del tráfico, usuarios y sesiones en los dominios del IESA. El portal principal concentra las admisiones académicas, mientras Debates IESA aporta difusión de contenido y liderazgo de opinión.
            </p>
          </div>

          {/* Tarjetas Resumen de los 2 Pilares Centrales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* IESA Principal */}
            <div className={`p-8 rounded-3xl border transition-all ${
              isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className={`flex items-center justify-between pb-6 border-b ${
                isDark ? 'border-slate-800' : 'border-slate-100'
              }`}>
                <div>
                  <h3 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>IESA Principal</h3>
                  <a href="https://www.iesa.edu.ve" target="_blank" rel="noreferrer" className="text-xs text-indigo-500 hover:underline flex items-center gap-1 mt-1 font-mono">
                    www.iesa.edu.ve <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                  Portal central
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 my-6">
                <div>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Usuarios 2026</p>
                  <p className="text-2xl font-black text-indigo-500 mt-1">180.872</p>
                </div>
                <div>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Sesiones</p>
                  <p className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>272.404</p>
                </div>
                <div>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Permanencia</p>
                  <p className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>3m 10s</p>
                </div>
              </div>

              <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Centro neurálgico de conversión institucional, admisiones a postgrados, programas de formación ejecutiva e información corporativa.
              </p>
            </div>

            {/* Debates IESA */}
            <div className={`p-8 rounded-3xl border transition-all ${
              isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className={`flex items-center justify-between pb-6 border-b ${
                isDark ? 'border-slate-800' : 'border-slate-100'
              }`}>
                <div>
                  <h3 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Debates IESA</h3>
                  <a href="https://www.debatesiesa.com" target="_blank" rel="noreferrer" className="text-xs text-cyan-500 hover:underline flex items-center gap-1 mt-1 font-mono">
                    www.debatesiesa.com <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                  Medio editorial
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 my-6">
                <div>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Usuarios 2026</p>
                  <p className="text-2xl font-black text-cyan-500 mt-1">63.445</p>
                </div>
                <div>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Sesiones</p>
                  <p className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>85.695</p>
                </div>
                <div>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Permanencia</p>
                  <p className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>2m 38s</p>
                </div>
              </div>

              <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Revista de divulgación gerencial y económica con un tráfico orgánico calificado que alimenta el prestigio académico del instituto.
              </p>
            </div>
          </div>

          {/* GRÁFICAS EJECUTIVAS: COMPARATIVA Y CANALES */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Gráfica 1: Comparativa Anual (2025 vs 2026) */}
            <div className={`p-8 rounded-3xl border ${
              isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="space-y-1 mb-6">
                <h4 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Comparativa de usuarios por portal (2025 vs 2026)
                </h4>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Volumen anual auditado de usuarios en los principales dominios institucionales.
                </p>
              </div>

              {/* Gráfica de Barras Comparativas Side-by-Side */}
              <div className="space-y-6 pt-2">
                {sitesComparisonList.map((site) => {
                  const pct25 = (site.u2025 / maxCompareUser) * 100;
                  const pct26 = (site.u2026 / maxCompareUser) * 100;

                  return (
                    <div key={site.name} className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className={isDark ? 'text-slate-200' : 'text-slate-800'}>{site.name}</span>
                        <span className={`text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {site.u2026.toLocaleString()} (2026) vs {site.u2025.toLocaleString()} (2025)
                        </span>
                      </div>

                      {/* Barras 2025 y 2026 */}
                      <div className="space-y-1.5">
                        {/* Barra 2025 */}
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'} w-12`}>2025</span>
                          <div className={`flex-1 h-3 rounded-full overflow-hidden ${
                            isDark ? 'bg-slate-800' : 'bg-slate-100'
                          }`}>
                            <div 
                              className="h-full bg-slate-400 rounded-full transition-all duration-700"
                              style={{ width: `${Math.max(pct25, 4)}%` }}
                            />
                          </div>
                          <span className={`text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'} w-16 text-right`}>
                            {site.u2025.toLocaleString()}
                          </span>
                        </div>

                        {/* Barra 2026 */}
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-indigo-500 w-12">2026</span>
                          <div className={`flex-1 h-3.5 rounded-full overflow-hidden ${
                            isDark ? 'bg-slate-800' : 'bg-slate-100'
                          }`}>
                            <div 
                              className="h-full bg-indigo-600 rounded-full transition-all duration-700"
                              style={{ width: `${Math.max(pct26, 4)}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-mono font-bold text-indigo-500 w-16 text-right">
                            {site.u2026.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Leyenda */}
              <div className={`flex items-center justify-center gap-6 mt-6 pt-4 border-t text-xs ${
                isDark ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-slate-400" />
                  <span>Año 2025 (12 meses consolidados)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-indigo-600" />
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Año 2026 (10 meses hasta Nov 3)</span>
                </div>
              </div>
            </div>

            {/* Gráfica 2: Canales de Tráfico */}
            <div className={`p-8 rounded-3xl border ${
              isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="space-y-1 mb-6">
                <h4 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Distribución de canales de adquisición
                </h4>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Origen de las visitas: el 64% de los usuarios llega a través de búsquedas en Google.
                </p>
              </div>

              <div className="space-y-5 pt-2">
                {TRAFFIC_CHANNELS_DATA.map(channel => (
                  <div key={channel.name} className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className={isDark ? 'text-slate-200' : 'text-slate-700'}>{channel.name}</span>
                      <span className={`font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{channel.value}%</span>
                    </div>
                    <div className={`h-3.5 w-full rounded-full overflow-hidden ${
                      isDark ? 'bg-slate-800' : 'bg-slate-100'
                    }`}>
                      <div 
                        className="h-full rounded-full transition-all duration-700" 
                        style={{ width: `${channel.value}%`, backgroundColor: channel.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <p className={`text-xs mt-8 pt-4 border-t leading-relaxed ${
                isDark ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'
              }`}>
                La alta concentración orgánica resalta la importancia estratégica del SEO y de mantener contenidos relevantes en todo el ecosistema.
              </p>
            </div>
          </div>

          {/* TABLA DE MÉTRICAS CON INDICADOR VERDE / ROJO DE VARIACIÓN */}
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Inventario completo de dominios y portales periféricos
                </h3>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Comparativa de usuarios con indicador de tendencia (Verde = Aumento · Rojo = Disminución)
                </p>
              </div>

              <div className="flex items-center gap-2">
                {(['all', 'core', 'internacional', 'comunidad'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition cursor-pointer ${
                      categoryFilter === cat 
                        ? 'bg-indigo-600 text-white shadow-xs' 
                        : isDark ? 'bg-slate-900 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    {cat === 'all' ? 'Todos los dominios' : cat}
                  </button>
                ))}
              </div>
            </div>

            <div className={`rounded-3xl border overflow-hidden ${
              isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className={`border-b font-semibold uppercase tracking-wider text-[11px] ${
                    isDark ? 'bg-slate-950/60 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}>
                    <tr>
                      <th className="py-4 px-6">Dominio / portal</th>
                      <th className="py-4 px-6">Rol estratégico</th>
                      <th className="py-4 px-6 text-right">Usuarios 2025</th>
                      <th className="py-4 px-6 text-right">Usuarios 2026</th>
                      <th className="py-4 px-6 text-center">Variación</th>
                      <th className="py-4 px-6 text-right">Permanencia</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-200/80'}`}>
                    {filteredSites.map(site => {
                      const diff = site.users2026 - site.users2025;
                      const pct = site.users2025 > 0 ? ((diff / site.users2025) * 100).toFixed(1) : '0';
                      const isUp = diff >= 0;

                      return (
                        <tr key={site.id} className={`${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'} transition-colors`}>
                          <td className={`py-4 px-6 font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            <div>{site.name}</div>
                            <a href={site.url} target="_blank" rel="noreferrer" className="text-[11px] text-indigo-500 hover:underline flex items-center gap-1 font-mono mt-0.5">
                              {site.domainDisplay} <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </td>
                          <td className={`py-4 px-6 max-w-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                            {site.role}
                          </td>
                          <td className={`py-4 px-6 text-right font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            {site.users2025.toLocaleString()}
                          </td>
                          <td className="py-4 px-6 text-right font-mono font-bold text-indigo-500">
                            {site.users2026.toLocaleString()}
                          </td>
                          
                          {/* Indicador Verde / Rojo de Variación */}
                          <td className="py-4 px-6 text-center">
                            {isUp ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold font-mono bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                <TrendingUp className="w-3 h-3" /> +{pct}%
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold font-mono bg-rose-500/10 text-rose-600 border border-rose-500/20">
                                <TrendingDown className="w-3 h-3" /> {pct}%
                              </span>
                            )}
                          </td>

                          <td className={`py-4 px-6 text-right font-mono ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                            {site.time2026}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <p className={`text-[11px] italic ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              * Nota metodológica: El año 2025 comprende 12 meses consolidados, mientras que 2026 refleja 10 meses acumulados (corte al 3 de noviembre). Portales como IESA Foundation y Debates IESA presentan un crecimiento significativo o un ritmo equivalente al proyectarse al cierre de año.
            </p>
          </div>
        </section>

        {/* =============================================================
            PUNTO 2: NUEVAS PÁGINAS INCORPORADAS Y PROYECTOS FUTUROS
            ============================================================= */}
        <section id="paginas-nuevas" className="space-y-16 scroll-mt-28">
          
          <div className={`flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b ${
            isDark ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <div className="max-w-2xl space-y-3">
              <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest">
                Punto 2 de la presentación
              </p>
              <h2 className={`text-3xl sm:text-4xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Nuevas páginas incorporadas y proyectos futuros
              </h2>
              <p className={`text-base leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Catálogo de 16 proyectos web trabajados durante el año fiscal: 12 páginas publicadas en producción, 2 pendientes (Club de políticas y asuntos públicos, Portal de internacionalización) y 2 proyectos estratégicos en desarrollo (Refactorización del checkout y Sitio bilingüe multi-idioma de 109 páginas para acreditadoras).
              </p>
            </div>

            {/* Filtro Simple */}
            <div className={`flex flex-wrap items-center gap-2 p-1.5 rounded-2xl border text-xs ${
              isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white shadow-xs'
            }`}>
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                  statusFilter === 'all' 
                    ? 'bg-indigo-600 text-white shadow-xs' 
                    : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Todas ({PROJECTS.length})
              </button>
              <button
                onClick={() => setStatusFilter('published')}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                  statusFilter === 'published' 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Publicadas ({PROJECTS.filter(p => p.status === 'published').length})
              </button>
              <button
                onClick={() => setStatusFilter('future')}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                  statusFilter === 'future' 
                    ? 'bg-indigo-600 text-white shadow-xs' 
                    : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Pendientes ({PROJECTS.filter(p => p.status === 'future').length})
              </button>
              <button
                onClick={() => setStatusFilter('development')}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                  statusFilter === 'development' 
                    ? 'bg-amber-600 text-white shadow-xs' 
                    : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                En desarrollo ({PROJECTS.filter(p => p.status === 'development').length})
              </button>
            </div>
          </div>

          {/* Grid de 16 Páginas en Mockup Mac */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map(project => (
              <div 
                key={project.id}
                className={`rounded-3xl border overflow-hidden transition-all duration-300 flex flex-col group ${
                  isDark 
                    ? 'bg-slate-900/60 border-slate-800 hover:border-indigo-500/70 shadow-lg' 
                    : 'bg-white border-slate-200 hover:border-indigo-400 shadow-md shadow-slate-200/50'
                }`}
              >
                {/* Cabecera Mockup Mac con URL Clickeable */}
                <div className={`px-4 py-3 flex items-center justify-between border-b ${
                  isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100 border-slate-200'
                }`}>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                  </div>

                  {/* Enlace clickeable en la barra de URL */}
                  <a
                    href={project.urlPath}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className={`px-3 py-1 rounded-md text-[10px] font-mono max-w-[210px] truncate border flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isDark 
                        ? 'bg-slate-900 text-indigo-400 border-slate-700 hover:bg-slate-800 hover:text-indigo-300' 
                        : 'bg-white text-indigo-600 border-slate-300 hover:bg-slate-50 hover:text-indigo-700'
                    }`}
                    title={`Abrir ${project.urlPath} en nueva pestaña`}
                  >
                    <span className="truncate">{project.urlPath.replace('https://', '')}</span>
                    <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-80" />
                  </a>

                  <div className="w-6" />
                </div>

                {/* Vista Previa con Auto-Scroll Suave en Hover */}
                <div 
                  className={`relative h-64 overflow-hidden cursor-pointer ${
                    isDark ? 'bg-slate-950' : 'bg-slate-100'
                  }`}
                  onClick={() => setSelectedProject(project)}
                >
                  <img 
                    src={project.image} 
                    alt={project.name}
                    className="w-full object-cover object-top transition-transform duration-[14s] ease-linear group-hover:-translate-y-[calc(100%-256px)]"
                  />

                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="bg-indigo-600/90 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg flex items-center gap-1.5">
                      <Maximize2 className="w-4 h-4" /> Ver estructura completa
                    </span>
                  </div>

                  {/* Badge de Estado */}
                  <div className="absolute top-3 left-3">
                    {project.status === 'published' && (
                      <span className="bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        <CheckCircle2 className="w-3 h-3" /> Publicada
                      </span>
                    )}
                    {project.status === 'future' && (
                      <span className="bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        <Clock className="w-3 h-3" /> Pendiente
                      </span>
                    )}
                    {project.status === 'development' && (
                      <span className="bg-amber-600 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        <Wrench className="w-3 h-3" /> En desarrollo (UX/UI)
                      </span>
                    )}
                  </div>
                </div>

                {/* Detalle y Objetivo del Proyecto */}
                <div className={`p-6 flex-1 flex flex-col justify-between space-y-4 ${
                  isDark ? 'bg-slate-900/40' : 'bg-white'
                }`}>
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider">
                      {project.category}
                    </div>
                    <h4 className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {project.name}
                    </h4>
                    <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {project.description}
                    </p>
                  </div>

                  <div className={`pt-3 border-t flex items-center justify-between ${
                    isDark ? 'border-slate-800' : 'border-slate-100'
                  }`}>
                    <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Objetivo: {project.objective}
                    </span>
                    <button 
                      onClick={() => setSelectedProject(project)}
                      className="text-xs font-bold text-indigo-500 hover:underline flex items-center gap-1 shrink-0 ml-2 cursor-pointer"
                    >
                      Examinar <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =============================================================
            PUNTO 3: MÉTRICAS DE PÁGINAS NUEVAS, UX, SEO Y GEO
            ============================================================= */}
        <section id="metricas-estrategias" className="space-y-16 scroll-mt-28">
          
          <div className="max-w-3xl space-y-3">
            <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest">
              Punto 3 de la presentación
            </p>
            <h2 className={`text-3xl sm:text-4xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Métricas de páginas nuevas y plan estratégico
            </h2>
            <p className={`text-base leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Rendimiento de los programas de postgrado en Google Analytics 4 y plan de acción estructurado en tres pilares sencillos: Experiencia de Usuario (UX/UI), Posicionamiento en Buscadores (SEO) y Optimización para Inteligencia Artificial (GEO).
            </p>
          </div>

          {/* Gráfica de Vistas por Programa de Postgrado */}
          <div className={`p-8 rounded-3xl border ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="space-y-1 mb-8">
              <h4 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Demanda y vistas por programa de postgrado (2026)
              </h4>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Visualizaciones de página en Google Analytics 4 de las landings de postgrado.
              </p>
            </div>

            {/* Barras de Demanda de Postgrados */}
            <div className="space-y-6">
              {postgradData.map((prog, idx) => {
                const pct = (prog.views / maxPostgradView) * 100;
                const colors = ['bg-indigo-600', 'bg-cyan-500', 'bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500'];
                const barColor = colors[idx % colors.length];

                return (
                  <div key={prog.name} className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                        <span className={isDark ? 'text-slate-200' : 'text-slate-800'}>{prog.name}</span>
                      </div>
                      <div className="flex items-center gap-3 font-mono">
                        <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{prog.clicks} clics en Google</span>
                        <span className="text-indigo-500 font-bold">{prog.views.toLocaleString()} vistas</span>
                      </div>
                    </div>

                    <div className={`h-4 w-full rounded-full overflow-hidden ${
                      isDark ? 'bg-slate-800' : 'bg-slate-100'
                    }`}>
                      <div 
                        className={`h-full ${barColor} rounded-full transition-all duration-700`}
                        style={{ width: `${Math.max(pct, 5)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tarjetas de Métricas de Postgrados */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {postgradData.map(item => (
              <div 
                key={item.name}
                className={`p-6 rounded-3xl border transition-all space-y-4 ${
                  isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {item.name}
                  </h4>
                  <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                    {item.ctr} CTR
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className={`p-3 rounded-2xl border ${
                    isDark ? 'bg-slate-950/60 border-slate-800/80 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}>
                    <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Vistas GA4</p>
                    <p className={`text-base font-black font-mono mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {item.views.toLocaleString()}
                    </p>
                  </div>
                  <div className={`p-3 rounded-2xl border ${
                    isDark ? 'bg-slate-950/60 border-slate-800/80 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}>
                    <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Clics Google</p>
                    <p className="text-base font-black font-mono text-emerald-600 mt-0.5">
                      {item.clicks.toLocaleString()}
                    </p>
                  </div>
                  <div className={`p-3 rounded-2xl border ${
                    isDark ? 'bg-slate-950/60 border-slate-800/80 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}>
                    <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Impresiones</p>
                    <p className={`text-base font-black font-mono mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {item.impressions.toLocaleString()}
                    </p>
                  </div>
                </div>

                <p className={`text-xs leading-relaxed pt-2 border-t ${
                  isDark ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-600'
                }`}>
                  {item.note}
                </p>
              </div>
            ))}
          </div>

          {/* LOS 3 PILARES DE ACCIÓN: UX & UI, SEO, GEO */}
          <div className="space-y-8 pt-8">
            <div className="space-y-2">
              <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Plan estratégico: tres pilares para impulsar conversión y relevancia
              </h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Estrategias claras y sin tecnicismos para consolidar la presencia digital del IESA.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* PILAR 1: UX & UI */}
              <div className={`p-8 rounded-3xl border flex flex-col transition-all ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <Palette className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-widest">Pilar 1</span>
                    <h4 className={`text-xl font-black mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      UX & UI: experiencia del aspirante
                    </h4>
                  </div>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Facilitar que el futuro estudiante encuentre la información en segundos y decida postularse sin complicaciones ni fricción.
                  </p>
                </div>

                <ul className={`mt-6 pt-5 border-t space-y-3.5 text-xs ${
                  isDark ? 'border-slate-800 text-slate-300' : 'border-slate-100 text-slate-600'
                }`}>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Navegación Intuitiva:</strong> Menús limpios organizados por áreas de interés profesional.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Formularios Ágiles:</strong> Reducción de campos requeridos y nuevo checkout paso a paso (step-by-step).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Diseño Móvil (Mobile-First):</strong> Experiencia visual impecable en teléfonos inteligentes.</span>
                  </li>
                </ul>
              </div>

              {/* PILAR 2: SEO */}
              <div className={`p-8 rounded-3xl border flex flex-col transition-all ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                    <Search className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-cyan-500 uppercase tracking-widest">Pilar 2</span>
                    <h4 className={`text-xl font-black mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      SEO: posicionamiento en Google
                    </h4>
                  </div>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Asegurar que las páginas del IESA aparezcan en los primeros resultados cuando las personas busquen maestrías o formación ejecutiva.
                  </p>
                </div>

                <ul className={`mt-6 pt-5 border-t space-y-3.5 text-xs ${
                  isDark ? 'border-slate-800 text-slate-300' : 'border-slate-100 text-slate-600'
                }`}>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Palabras Clave Estratégicas:</strong> Optimización para términos como "MBA Venezuela" o "Maestría en Finanzas".</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Enlazado Inteligente:</strong> Artículos de opinión de Debates IESA recomiendan programas académicos del portal principal.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Indexación Veloz:</strong> Configuración técnica para que Google reconozca páginas nuevas en menos de 24 horas.</span>
                  </li>
                </ul>
              </div>

              {/* PILAR 3: GEO */}
              <div className={`p-8 rounded-3xl border flex flex-col transition-all ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-purple-500 uppercase tracking-widest">Pilar 3</span>
                    <h4 className={`text-xl font-black mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      GEO: presencia en motores de IA
                    </h4>
                  </div>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Lograr que ChatGPT, Google Gemini y Perplexity recomienden al IESA cuando los usuarios pregunten por las mejores escuelas de negocios de la región.
                  </p>
                </div>

                <ul className={`mt-6 pt-5 border-t space-y-3.5 text-xs ${
                  isDark ? 'border-slate-800 text-slate-300' : 'border-slate-100 text-slate-600'
                }`}>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Respuestas Directas (FAQ):</strong> Preguntas y respuestas claras que los algoritmos de IA pueden sintetizar fácilmente.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Autoridad y Acreditaciones:</strong> Datos estructurados que confirman las acreditaciones internacionales (AACSB, AMBA, NASPAA, EFMD) ante los modelos de lenguaje.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Citación Continua:</strong> Presencia de investigaciones y docentes del IESA como fuentes autorizadas en internet.</span>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* =================================================================
          MODAL DE VISTA PREVIA DETALLADA DE LA PÁGINA
          ================================================================= */}
      {selectedProject && (
        <div 
          onClick={() => setSelectedProject(null)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 md:p-8 animate-in fade-in duration-200 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-5xl max-h-[92vh] rounded-3xl border flex flex-col shadow-2xl overflow-hidden cursor-default transition-colors ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            
            {/* Cabecera del Modal con URL Clickeable */}
            <div className={`px-6 py-4 flex items-center justify-between border-b shrink-0 ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                </div>
                <div className="min-w-0">
                  <h3 className={`font-bold text-sm sm:text-base truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {selectedProject.name}
                  </h3>
                  <a 
                    href={selectedProject.urlPath}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-mono text-indigo-500 hover:underline flex items-center gap-1 truncate mt-0.5"
                    title={`Abrir ${selectedProject.urlPath} en nueva pestaña`}
                  >
                    <span>{selectedProject.urlPath}</span>
                    <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 ml-4">
                <a
                  href={selectedProject.urlPath}
                  target="_blank"
                  rel="noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-xs"
                >
                  <span>Visitar página</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => setSelectedProject(null)}
                  className={`p-2 rounded-xl border transition cursor-pointer ${
                    isDark 
                      ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white' 
                      : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 shadow-xs'
                  }`}
                  aria-label="Cerrar modal"
                  title="Cerrar (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Contenedor de la Imagen con Scroll Vertical Fluido y Legible */}
            <div 
              ref={modalScrollRef}
              className={`flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-8 ${
                isDark ? 'bg-slate-950/90' : 'bg-slate-100/90'
              }`}
              style={{ maxHeight: 'calc(92vh - 135px)' }}
            >
              <div className="max-w-4xl mx-auto w-full flex flex-col items-center">
                <img 
                  src={selectedProject.image} 
                  alt={selectedProject.name} 
                  className={`w-full h-auto block rounded-2xl shadow-2xl border transition-all ${
                    isDark ? 'border-slate-800/80 shadow-slate-950/80' : 'border-slate-200/90 shadow-slate-300/60'
                  }`}
                />
              </div>
            </div>

            {/* Pie del Modal con Metadatos y Enlace */}
            <div className={`px-6 py-3.5 border-t text-xs flex flex-wrap items-center justify-between gap-3 shrink-0 ${
              isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              <div className="flex flex-wrap items-center gap-4">
                <span>Categoría: <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>{selectedProject.category}</strong></span>
                <span className="flex items-center gap-1.5">
                  Estado: 
                  {selectedProject.status === 'published' && (
                    <span className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                      <CheckCircle2 className="w-3 h-3" /> Publicada
                    </span>
                  )}
                  {selectedProject.status === 'future' && (
                    <span className="bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                      <Clock className="w-3 h-3" /> Pendiente
                    </span>
                  )}
                  {selectedProject.status === 'development' && (
                    <span className="bg-amber-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                      <Wrench className="w-3 h-3" /> En desarrollo (UX/UI)
                    </span>
                  )}
                </span>
                <span className="hidden md:inline text-[11px] max-w-md truncate">
                  Objetivo: <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{selectedProject.objective}</span>
                </span>
              </div>

              <a 
                href={selectedProject.urlPath} 
                target="_blank" 
                rel="noreferrer" 
                className="text-indigo-500 hover:text-indigo-400 font-bold flex items-center gap-1 transition"
              >
                <span>Abrir enlace en el navegador</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

          </div>
        </div>
      )}

      {/* Floating Theme Quick Switcher at Bottom Right */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleTheme}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full border shadow-2xl backdrop-blur-xl text-xs font-bold transition-all cursor-pointer hover:scale-105 active:scale-95 ${
            isDark
              ? 'bg-slate-900/95 hover:bg-slate-800 border-slate-700 text-amber-400 shadow-indigo-950/40'
              : 'bg-white/95 hover:bg-slate-50 border-slate-300 text-indigo-600 shadow-slate-300/60'
          }`}
          title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          <span>{isDark ? "Modo claro" : "Modo oscuro"}</span>
        </button>
      </div>

      {/* =================================================================
          PIE DE PÁGINA (DIRECCIÓN COMERCIAL)
          ================================================================= */}
      <footer className={`border-t py-12 px-6 text-center text-xs transition-colors ${
        isDark ? 'border-slate-800 bg-slate-950 text-slate-400' : 'border-slate-200 bg-white text-slate-600'
      }`}>
        <p className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          Instituto de Estudios Superiores de Administración (IESA)
        </p>
        <p className="mt-1">
          Coordinación de Comunicaciones · Preparado para la Dirección Comercial
        </p>
      </footer>

    </div>
  );
}
