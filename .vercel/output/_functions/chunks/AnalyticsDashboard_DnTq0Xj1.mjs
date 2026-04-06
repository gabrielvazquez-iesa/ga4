import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { useState, useEffect, useMemo } from 'react';
import { a as apiFetch } from './api-fetch__Gu9eav4.mjs';
import { ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Line, AreaChart, Area, LineChart } from 'recharts';
import { Activity, Users, Percent, ArrowUpRight, ArrowDownRight, Target, Clock, MousePointerClick, Gauge, FileText, ExternalLink, Eye, TrendingUp, TrendingDown, Minus, BarChart2, Download, RefreshCw } from 'lucide-react';
import { Toaster, toast } from 'sonner';

function MoMModule({ days, filterPath }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchMoM = async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`/api/ga4-mom?days=${days}${filterPath ? `&pathFilter=${filterPath}` : ""}`);
        const json = await res.json();
        if (json.data) setData(json.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMoM();
  }, [days]);
  if (loading || !data) {
    return /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsx("div", { className: "h-32 bg-white/5 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-white/5" }, i)) });
  }
  const { current, previous } = data;
  const calcDiff = (curr, prev) => {
    if (!prev) return curr > 0 ? 100 : 0;
    return (curr - prev) / prev * 100;
  };
  const currentSessions = current.sessions || 0;
  const previousSessions = previous.sessions || 0;
  const sessionsDiff = calcDiff(currentSessions, previousSessions);
  const currentUsers = current.activeUsers || 0;
  const previousUsers = previous.activeUsers || 0;
  const usersDiff = calcDiff(currentUsers, previousUsers);
  const currentConv = current.conversionRate || 0;
  const previousConv = previous.conversionRate || 0;
  const convDiff = calcDiff(currentConv, previousConv);
  const kpis = [
    { label: "Sesiones Totales", value: currentSessions, diff: sessionsDiff, icon: Activity, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
    { label: "Usuarios Activos", value: currentUsers, diff: usersDiff, icon: Users, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
    { label: "Tasa de Conversión", value: `${(currentConv * 100).toFixed(2)}%`, diff: convDiff, icon: Percent, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" }
  ];
  return /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: kpis.map((kpi, i) => {
    const isPositive = kpi.diff >= 0;
    return /* @__PURE__ */ jsxs("div", { className: `bg-white/80 dark:bg-slate-900/60 border ${kpi.bg} rounded-2xl p-5 backdrop-blur-sm shadow-sm relative overflow-hidden group`, children: [
      /* @__PURE__ */ jsx("div", { className: `absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity ${kpi.bg.split(" ")[0]}` }),
      /* @__PURE__ */ jsxs("div", { className: "relative z-10", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start mb-3", children: [
          /* @__PURE__ */ jsx("div", { className: `w-10 h-10 rounded-xl ${kpi.bg.split(" ")[0]} flex items-center justify-center`, children: /* @__PURE__ */ jsx(kpi.icon, { className: `w-5 h-5 ${kpi.color}` }) }),
          /* @__PURE__ */ jsxs("div", { className: `flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${isPositive ? "bg-emerald-500/20 text-emerald-500" : "bg-rose-500/20 text-rose-500"}`, children: [
            isPositive ? /* @__PURE__ */ jsx(ArrowUpRight, { className: "w-3 h-3" }) : /* @__PURE__ */ jsx(ArrowDownRight, { className: "w-3 h-3" }),
            Math.abs(kpi.diff).toFixed(1),
            "% vs anterior"
          ] })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-2xl font-extrabold text-slate-900 dark:text-white tracking-tighter", children: typeof kpi.value === "number" ? kpi.value.toLocaleString() : kpi.value }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-slate-500 dark:text-slate-400 mt-1", children: [
          kpi.label,
          " (vs ",
          days,
          "d prev)"
        ] })
      ] })
    ] }, i);
  }) });
}

function EngagementModule({ days, filterPath }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchEngagement = async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`/api/ga4-engagement?days=${days}${filterPath ? `&pathFilter=${filterPath}` : ""}`);
        const json = await res.json();
        if (json.data) setData(json.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEngagement();
  }, [days]);
  return /* @__PURE__ */ jsxs("div", { className: "bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-sm overflow-hidden flex flex-col h-full", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-6", children: [
      /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center border border-orange-500/30", children: /* @__PURE__ */ jsx(Target, { className: "w-4 h-4 text-orange-400" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "font-bold text-slate-900 dark:text-white leading-tight", children: "Engagement de Contenido" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500", children: "Páginas de mayor impacto y conversiones" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "overflow-x-auto flex-1", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm text-left", children: [
      /* @__PURE__ */ jsx("thead", { className: "text-xs text-slate-500 uppercase bg-slate-50 dark:bg-white/5 border-y border-slate-200 dark:border-white/10", children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { className: "px-4 py-3 font-semibold", children: "URL Path" }),
        /* @__PURE__ */ jsx("th", { className: "px-4 py-3 font-semibold", children: "T. Promedio" }),
        /* @__PURE__ */ jsx("th", { className: "px-4 py-3 font-semibold", children: "Interacciones" }),
        /* @__PURE__ */ jsx("th", { className: "px-4 py-3 font-semibold", children: "Score Efectividad" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { children: loading ? Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ jsxs("tr", { className: "animate-pulse border-b border-slate-100 dark:border-white/5", children: [
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx("div", { className: "h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" }) }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx("div", { className: "h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" }) }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx("div", { className: "h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" }) }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx("div", { className: "h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" }) })
      ] }, i)) : data.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 4, className: "px-4 py-8 text-center text-slate-500", children: "No hay datos disponibles." }) }) : data.map((row, i) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors", children: [
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3 font-medium text-slate-700 dark:text-slate-300 max-w-[200px] truncate", title: row.path, children: row.path }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-slate-500 dark:text-slate-400", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(Clock, { className: "w-3 h-3" }),
          " ",
          Math.floor(row.avgDuration),
          "s"
        ] }) }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-slate-500 dark:text-slate-400", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(MousePointerClick, { className: "w-3 h-3" }),
          " ",
          row.events
        ] }) }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("div", { className: "w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2", children: /* @__PURE__ */ jsx(
            "div",
            {
              className: `h-2 rounded-full ${row.score > 70 ? "bg-emerald-500" : row.score > 40 ? "bg-amber-500" : "bg-rose-500"}`,
              style: { width: `${row.score}%` }
            }
          ) }),
          /* @__PURE__ */ jsx("span", { className: "text-xs font-bold w-6", children: row.score })
        ] }) })
      ] }, i)) })
    ] }) })
  ] });
}

function PerformanceModule({ days, filterPath }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchPerf = async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`/api/ga4-performance?days=${days}${filterPath ? `&pathFilter=${filterPath}` : ""}`);
        const json = await res.json();
        if (json.data) {
          const formatted = json.data.map((d) => {
            const dateObj = new Date(d.date);
            return {
              ...d,
              label: dateObj.toLocaleDateString("es-VE", { day: "2-digit", month: "2-digit" })
            };
          });
          setData(formatted);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPerf();
  }, [days]);
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return /* @__PURE__ */ jsxs("div", { className: "bg-slate-900/95 border border-white/10 px-4 py-3 rounded-xl shadow-xl text-xs z-50", children: [
      /* @__PURE__ */ jsx("p", { className: "text-slate-400 font-semibold mb-2", children: label }),
      payload.map((p) => /* @__PURE__ */ jsxs("p", { style: { color: p.color }, className: "font-bold flex justify-between gap-4", children: [
        /* @__PURE__ */ jsxs("span", { children: [
          p.name,
          ":"
        ] }),
        /* @__PURE__ */ jsx("span", { children: p.name.includes("Carga") ? p.value.toFixed(2) + "s" : p.value.toLocaleString() })
      ] }, p.dataKey))
    ] });
  };
  return /* @__PURE__ */ jsxs("div", { className: "bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-sm flex flex-col h-full", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-6", children: [
      /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center border border-teal-500/30", children: /* @__PURE__ */ jsx(Gauge, { className: "w-4 h-4 text-teal-400" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "font-bold text-slate-900 dark:text-white leading-tight", children: "Correlación de Rendimiento" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500", children: "Tráfico (Vistas) vs Métricas Técnicas" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex-1 w-full min-h-[250px]", children: loading ? /* @__PURE__ */ jsx("div", { className: "w-full h-full flex items-center justify-center bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-white/5 animate-pulse", children: /* @__PURE__ */ jsx("span", { className: "text-slate-400 text-sm", children: "Cargando Rendimiento..." }) }) : data.length === 0 ? /* @__PURE__ */ jsx("div", { className: "w-full h-full flex items-center justify-center text-slate-500 text-sm", children: "No hay datos disponibles." }) : /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(ComposedChart, { data, children: [
      /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false, stroke: "rgba(255,255,255,0.06)" }),
      /* @__PURE__ */ jsx(XAxis, { dataKey: "label", tick: { fill: "#94a3b8", fontSize: 10 }, axisLine: false, tickLine: false, minTickGap: 20 }),
      /* @__PURE__ */ jsx(YAxis, { yAxisId: "left", tick: { fill: "#94a3b8", fontSize: 10 }, axisLine: false, tickLine: false, width: 40 }),
      /* @__PURE__ */ jsx(YAxis, { yAxisId: "right", orientation: "right", tick: { fill: "#94a3b8", fontSize: 10 }, axisLine: false, tickLine: false, width: 40 }),
      /* @__PURE__ */ jsx(Tooltip, { content: /* @__PURE__ */ jsx(CustomTooltip, {}) }),
      /* @__PURE__ */ jsx(Bar, { yAxisId: "left", dataKey: "views", name: "Vistas", fill: "#3b82f6", opacity: 0.3, radius: [4, 4, 0, 0] }),
      /* @__PURE__ */ jsx(Line, { yAxisId: "right", type: "monotone", dataKey: "loadTime", name: "Tiempo Carga LCP", stroke: "#14b8a6", strokeWidth: 3, dot: { r: 3, fill: "#14b8a6", strokeWidth: 0 }, activeDot: { r: 6 } })
    ] }) }) })
  ] });
}

function ContentListModule({ days, filterPath }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchList = async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`/api/ga4-content-list?days=${days}&pathFilter=${filterPath}`);
        const json = await res.json();
        if (json.data) setData(json.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (filterPath) fetchList();
  }, [days, filterPath]);
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}m ${s}s`;
  };
  const domain = "https://www.iesa.edu.ve";
  return /* @__PURE__ */ jsxs("div", { className: "bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl backdrop-blur-sm overflow-hidden flex flex-col h-full mt-6", children: [
    /* @__PURE__ */ jsx("div", { className: "p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30", children: /* @__PURE__ */ jsx(FileText, { className: "w-5 h-5 text-blue-500" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-xl font-extrabold text-slate-900 dark:text-white leading-tight", children: "Desempeño de Contenido" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500", children: "Métricas detalladas para artículos y cursos individuales." })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-left text-sm text-slate-600 dark:text-slate-300", children: [
      /* @__PURE__ */ jsx("thead", { className: "text-xs uppercase bg-slate-50 dark:bg-slate-950/50 text-slate-500 border-b border-slate-200 dark:border-white/10", children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { className: "px-6 py-4 font-bold", children: "Título / Enlace" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-4 font-bold text-center", children: "Vistas" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-4 font-bold text-center", children: "Tiempo Promedio" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-slate-100 dark:divide-white/5", children: loading ? Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ jsxs("tr", { className: "animate-pulse", children: [
        /* @__PURE__ */ jsxs("td", { className: "px-6 py-4", children: [
          /* @__PURE__ */ jsx("div", { className: "h-5 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-2" }),
          /* @__PURE__ */ jsx("div", { className: "h-3 bg-slate-100 dark:bg-slate-800/60 rounded w-1/2" })
        ] }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsx("div", { className: "h-4 bg-slate-200 dark:bg-slate-800 rounded w-16 mx-auto" }) }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsx("div", { className: "h-4 bg-slate-200 dark:bg-slate-800 rounded w-16 mx-auto" }) })
      ] }, i)) : data.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 3, className: "px-6 py-12 text-center text-slate-500", children: "No se encontró contenido publicado en este período." }) }) : data.map((item, i) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group", children: [
        /* @__PURE__ */ jsxs("td", { className: "px-6 py-4 max-w-sm", children: [
          /* @__PURE__ */ jsx("div", { className: "font-bold text-slate-900 dark:text-white mb-1 line-clamp-2", title: item.title, children: item.title || "Sin Título" }),
          /* @__PURE__ */ jsxs(
            "a",
            {
              href: `${domain}${item.path}`,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "inline-flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors",
              title: "Abrir página en IESA",
              children: [
                /* @__PURE__ */ jsx(ExternalLink, { className: "w-3.5 h-3.5" }),
                item.path
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center gap-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 font-bold bg-slate-100 dark:bg-slate-800/50 rounded-lg py-1.5 px-3 w-fit", children: [
            /* @__PURE__ */ jsx(Eye, { className: "w-4 h-4 text-slate-500" }),
            /* @__PURE__ */ jsx("span", { className: "text-slate-900 dark:text-white", children: item.views.toLocaleString() })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: `flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${item.trend > 0 ? "text-emerald-600 bg-emerald-500/10" : item.trend < 0 ? "text-rose-600 bg-rose-500/10" : "text-slate-500 bg-slate-500/10"}`, children: [
            item.trend > 0 ? /* @__PURE__ */ jsx(TrendingUp, { className: "w-3 h-3" }) : item.trend < 0 ? /* @__PURE__ */ jsx(TrendingDown, { className: "w-3 h-3" }) : /* @__PURE__ */ jsx(Minus, { className: "w-3 h-3" }),
            item.trend > 0 && "+",
            item.trend === 0 ? "Igual" : `${item.trend.toFixed(1)}%`
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-2 font-medium bg-slate-100 dark:bg-slate-800/50 rounded-lg py-1.5 px-3 w-fit mx-auto text-slate-700 dark:text-slate-300", children: [
          /* @__PURE__ */ jsx(Clock, { className: "w-4 h-4 text-amber-500" }),
          formatTime(item.avgDuration)
        ] }) })
      ] }, i)) })
    ] }) })
  ] });
}

const RANGES = [
  { label: "7 días", days: 7 },
  { label: "30 días", days: 30 },
  { label: "90 días", days: 90 },
  { label: "Este año", days: 365 }
];
function AnalyticsDashboard({ filterPath = "", mainTitle = "Tráfico y Audiencia (GA4)" }) {
  const [range, setRange] = useState(RANGES[1]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchData = async (days) => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/ga4?days=${days}${filterPath ? `&pathFilter=${filterPath}` : ""}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      const formattedData = (json.data || []).map((row) => {
        const d = new Date(row.date);
        return {
          ...row,
          label: d.toLocaleDateString("es-VE", { month: "short", day: "numeric" })
        };
      });
      setData(formattedData);
    } catch (error) {
      toast.error(error.message || "Error al obtener métricas de GA4");
      setData([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData(range.days);
  }, [range]);
  const totals = useMemo(() => {
    if (!data.length) return { views: 0, users: 0, sessions: 0, bounceRate: 0, avgSession: 0 };
    return {
      views: data.reduce((s, d) => s + d.views, 0),
      users: data.reduce((s, d) => s + d.users, 0),
      sessions: data.reduce((s, d) => s + d.sessions, 0),
      bounceRate: data.reduce((s, d) => s + d.bounceRate, 0) / data.length,
      // Promedio
      avgSession: data.reduce((s, d) => s + d.avgSession, 0) / data.length
      // Promedio en segundos
    };
  }, [data]);
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return /* @__PURE__ */ jsxs("div", { className: "bg-slate-900/95 border border-white/10 px-4 py-3 rounded-xl shadow-xl text-xs z-50", children: [
      /* @__PURE__ */ jsx("p", { className: "text-slate-400 font-semibold mb-2", children: label }),
      payload.map((p) => /* @__PURE__ */ jsxs("p", { style: { color: p.color }, className: "font-bold", children: [
        p.name,
        ": ",
        p.name.includes("Tasa") || p.name.includes("Bounce") ? p.value.toFixed(2) + "%" : p.name.includes("Tiempo") ? Math.floor(p.value) + "s" : p.value.toLocaleString()
      ] }, p.dataKey))
    ] });
  };
  const kpis = [
    { label: "Páginas Vistas", value: totals.views.toLocaleString(), icon: Eye, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
    { label: "Usuarios Activos", value: totals.users.toLocaleString(), icon: Users, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
    { label: "Sesiones Totales", value: totals.sessions.toLocaleString(), icon: BarChart2, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
    { label: "Tasa de Rebote", value: (totals.bounceRate * 100).toFixed(1) + "%", icon: MousePointerClick, color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" },
    { label: "Tiempo Medio (s)", value: Math.floor(totals.avgSession) + "s", icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
    { label: "Eventos / Usuario", value: totals.users ? ((totals.views + totals.sessions) / totals.users).toFixed(1) : "0", icon: TrendingUp, color: "text-sky-400", bg: "bg-sky-500/10 border-sky-500/20" }
  ];
  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," + Object.keys(data[0] || {}).join(",") + "\n" + data.map((row) => Object.values(row).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ga4_report_${range.days}_days.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6 animate-in fade-in duration-500", children: [
    /* @__PURE__ */ jsx(Toaster, { position: "top-right", theme: "dark" }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2 mb-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl w-fit", children: [
      /* @__PURE__ */ jsx("a", { href: "/analytics", className: `px-4 py-2 rounded-lg font-bold text-sm transition-colors ${!filterPath ? "bg-white dark:bg-slate-800 shadow text-blue-600 dark:text-blue-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`, children: "Resumen General" }),
      /* @__PURE__ */ jsx("a", { href: "/analytics/blog", className: `px-4 py-2 rounded-lg font-bold text-sm transition-colors ${filterPath === "/iesa-al-dia" ? "bg-white dark:bg-slate-800 shadow text-blue-600 dark:text-blue-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`, children: "Blog (IESA al Día)" }),
      /* @__PURE__ */ jsx("a", { href: "/analytics/courses", className: `px-4 py-2 rounded-lg font-bold text-sm transition-colors ${filterPath === "/cursos-y-programas" ? "bg-white dark:bg-slate-800 shadow text-blue-600 dark:text-blue-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`, children: "Cursos y Programas" })
    ] }),
    !filterPath && /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 rounded-3xl p-8 text-white shadow-2xl transition-all duration-500", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative z-10 flex flex-col md:flex-row justify-between gap-6 items-start md:items-center", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
            /* @__PURE__ */ jsx("div", { className: "w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center", children: /* @__PURE__ */ jsx(BarChart2, { className: "w-5 h-5 text-white" }) }),
            /* @__PURE__ */ jsx("h1", { className: "text-3xl font-extrabold tracking-tight", children: mainTitle })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-blue-100/80", children: "Estadísticas en tiempo real obtenidas mediante la API oficial de Google Analytics 4." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2 flex-wrap", children: [
          /* @__PURE__ */ jsxs("button", { onClick: handleExport, disabled: data.length === 0, className: "flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-colors border border-white/10 disabled:opacity-50", children: [
            /* @__PURE__ */ jsx(Download, { className: "w-4 h-4" }),
            " Exportar CSV"
          ] }),
          /* @__PURE__ */ jsxs("button", { onClick: () => fetchData(range.days), disabled: loading, className: "flex items-center gap-2 px-4 py-2 bg-white text-indigo-700 font-bold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg disabled:opacity-50", children: [
            /* @__PURE__ */ jsx(RefreshCw, { className: `w-4 h-4 ${loading ? "animate-spin" : ""}` }),
            " Actualizar"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" })
    ] }),
    filterPath && /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-slate-900 dark:text-white", children: mainTitle }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500", children: "Listado detallado de comportamiento por página." })
      ] }),
      /* @__PURE__ */ jsx("button", { onClick: () => fetchData(range.days), disabled: loading, className: "flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50", children: /* @__PURE__ */ jsx(RefreshCw, { className: `w-4 h-4 ${loading ? "animate-spin" : ""}` }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2 items-center", children: [
      /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-500 font-semibold uppercase tracking-wider mr-2", children: "Período:" }),
      RANGES.map((r) => /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setRange(r),
          className: `px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${range.label === r.label ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20" : "bg-white/80 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-blue-500/50"}`,
          children: r.label
        },
        r.label
      ))
    ] }),
    !filterPath && /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 lg:grid-cols-3 gap-4", children: kpis.map((kpi) => /* @__PURE__ */ jsxs("div", { className: `bg-white/80 dark:bg-slate-900/60 border ${kpi.bg} rounded-2xl p-5 backdrop-blur-sm shadow-sm relative overflow-hidden group`, children: [
      /* @__PURE__ */ jsx("div", { className: `absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity ${kpi.bg.split(" ")[0]}` }),
      /* @__PURE__ */ jsxs("div", { className: "relative z-10", children: [
        /* @__PURE__ */ jsx("div", { className: "flex justify-between items-start mb-3", children: /* @__PURE__ */ jsx("div", { className: `w-10 h-10 rounded-xl ${kpi.bg.split(" ")[0]} flex items-center justify-center`, children: /* @__PURE__ */ jsx(kpi.icon, { className: `w-5 h-5 ${kpi.color}` }) }) }),
        /* @__PURE__ */ jsx("p", { className: "text-2xl font-extrabold text-slate-900 dark:text-white tracking-tighter", children: loading ? /* @__PURE__ */ jsx("span", { className: "animate-pulse bg-slate-200 dark:bg-slate-800 text-transparent rounded", children: "000000" }) : kpi.value }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 dark:text-slate-400 mt-1", children: kpi.label })
      ] })
    ] }, kpi.label)) }),
    !filterPath && /* @__PURE__ */ jsx(Fragment, { children: loading ? /* @__PURE__ */ jsx("div", { className: "h-64 flex items-center justify-center border border-slate-200 dark:border-white/10 rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm", children: /* @__PURE__ */ jsx(RefreshCw, { className: "w-8 h-8 text-blue-500 animate-spin" }) }) : /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-sm", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-bold text-slate-900 dark:text-white mb-1", children: "Vistas vs Usuarios" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 mb-4", children: "Páginas vistas frente a la cantidad de usuarios activos" }),
        /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: 250, children: /* @__PURE__ */ jsxs(AreaChart, { data, children: [
          /* @__PURE__ */ jsxs("defs", { children: [
            /* @__PURE__ */ jsxs("linearGradient", { id: "colViews", x1: "0", y1: "0", x2: "0", y2: "1", children: [
              /* @__PURE__ */ jsx("stop", { offset: "5%", stopColor: "#3b82f6", stopOpacity: 0.2 }),
              /* @__PURE__ */ jsx("stop", { offset: "95%", stopColor: "#3b82f6", stopOpacity: 0 })
            ] }),
            /* @__PURE__ */ jsxs("linearGradient", { id: "colUsers", x1: "0", y1: "0", x2: "0", y2: "1", children: [
              /* @__PURE__ */ jsx("stop", { offset: "5%", stopColor: "#8b5cf6", stopOpacity: 0.2 }),
              /* @__PURE__ */ jsx("stop", { offset: "95%", stopColor: "#8b5cf6", stopOpacity: 0 })
            ] })
          ] }),
          /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false, stroke: "rgba(255,255,255,0.06)" }),
          /* @__PURE__ */ jsx(XAxis, { dataKey: "label", tick: { fill: "#94a3b8", fontSize: 10 }, axisLine: false, tickLine: false, minTickGap: 20 }),
          /* @__PURE__ */ jsx(YAxis, { tick: { fill: "#94a3b8", fontSize: 10 }, axisLine: false, tickLine: false, width: 50 }),
          /* @__PURE__ */ jsx(Tooltip, { content: /* @__PURE__ */ jsx(CustomTooltip, {}) }),
          /* @__PURE__ */ jsx(Area, { type: "monotone", dataKey: "views", name: "Vistas", stroke: "#3b82f6", fill: "url(#colViews)", strokeWidth: 3, dot: false, activeDot: { r: 6 } }),
          /* @__PURE__ */ jsx(Area, { type: "monotone", dataKey: "users", name: "Usuarios", stroke: "#8b5cf6", fill: "url(#colUsers)", strokeWidth: 3, dot: false, activeDot: { r: 6 } })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-sm", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-bold text-slate-900 dark:text-white mb-1", children: "Sesiones vs Tasa de Rebote" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 mb-4", children: "Cantidad de sesiones y el porcentaje de abandono" }),
        /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: 250, children: /* @__PURE__ */ jsxs(LineChart, { data, children: [
          /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false, stroke: "rgba(255,255,255,0.06)" }),
          /* @__PURE__ */ jsx(XAxis, { dataKey: "label", tick: { fill: "#94a3b8", fontSize: 10 }, axisLine: false, tickLine: false, minTickGap: 20 }),
          /* @__PURE__ */ jsx(YAxis, { yAxisId: "left", tick: { fill: "#94a3b8", fontSize: 10 }, axisLine: false, tickLine: false, width: 40 }),
          /* @__PURE__ */ jsx(YAxis, { yAxisId: "right", orientation: "right", tick: { fill: "#94a3b8", fontSize: 10 }, axisLine: false, tickLine: false, width: 40 }),
          /* @__PURE__ */ jsx(Tooltip, { content: /* @__PURE__ */ jsx(CustomTooltip, {}) }),
          /* @__PURE__ */ jsx(Line, { yAxisId: "left", type: "monotone", dataKey: "sessions", name: "Sesiones", stroke: "#10b981", strokeWidth: 3, dot: false, activeDot: { r: 6 } }),
          /* @__PURE__ */ jsx(Line, { yAxisId: "right", type: "step", dataKey: "bounceRate", name: "Tasa de Rebote (%)", stroke: "#f43f5e", strokeWidth: 2, dot: false, activeDot: { r: 4 } })
        ] }) })
      ] })
    ] }) }),
    filterPath ? /* @__PURE__ */ jsx("div", { className: "pt-6 mt-8 space-y-6", children: /* @__PURE__ */ jsx(ContentListModule, { days: range.days, filterPath }) }) : /* @__PURE__ */ jsxs("div", { className: "pt-6 border-t border-slate-200 dark:border-white/10 mt-8 space-y-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2", children: "Métricas Avanzadas" }),
      /* @__PURE__ */ jsx(MoMModule, { days: range.days, filterPath }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 xl:grid-cols-2 gap-6", children: [
        /* @__PURE__ */ jsx(PerformanceModule, { days: range.days, filterPath }),
        /* @__PURE__ */ jsx(EngagementModule, { days: range.days, filterPath })
      ] })
    ] })
  ] });
}

export { AnalyticsDashboard as A };
