import { c as createComponent } from './astro-component_Bi-3AwRB.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_BbtgLamP.mjs';
import { $ as $$DashboardLayout } from './DashboardLayout_jfAd883J.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area } from 'recharts';
import { Eye, ArrowUpRight, Users, Clock, MousePointerClick, ArrowDownRight, Fingerprint, Sparkles, X } from 'lucide-react';
import { s as supabase } from './supabase_C66l0GU-.mjs';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';

const mockData = {
  day: [
    { name: "00:00", views: 120, users: 80 },
    { name: "04:00", views: 80, users: 40 },
    { name: "08:00", views: 450, users: 300 },
    { name: "12:00", views: 800, users: 600 },
    { name: "16:00", views: 950, users: 700 },
    { name: "20:00", views: 600, users: 450 },
    { name: "23:59", views: 200, users: 150 }
  ],
  week: [
    { name: "Lun", views: 4e3, users: 2400 },
    { name: "Mar", views: 3e3, users: 1398 },
    { name: "Mié", views: 2e3, users: 9800 },
    { name: "Jue", views: 2780, users: 3908 },
    { name: "Vie", views: 1890, users: 4800 },
    { name: "Sáb", views: 2390, users: 3800 },
    { name: "Dom", views: 3490, users: 4300 }
  ],
  month: [
    { name: "Semana 1", views: 14e3, users: 8400 },
    { name: "Semana 2", views: 23e3, users: 11980 },
    { name: "Semana 3", views: 12e3, users: 9800 },
    { name: "Semana 4", views: 27800, users: 13908 }
  ]
};
const kpiData = {
  day: { views: 3200, users: 2320, engagement: "1m 45s", bounce: "42%" },
  week: { views: 19550, users: 30006, engagement: "1m 20s", bounce: "48%" },
  month: { views: 76800, users: 44088, engagement: "1m 55s", bounce: "45%" }
};
function DashboardVisual() {
  const [timeRange, setTimeRange] = useState("month");
  const data = mockData[timeRange];
  const kpis = kpiData[timeRange];
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 p-4 rounded-xl shadow-2xl", children: [
        /* @__PURE__ */ jsx("p", { className: "font-bold text-slate-900 dark:text-white mb-2", children: label }),
        payload.map((entry, index) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
          /* @__PURE__ */ jsx("div", { className: "w-3 h-3 rounded-full", style: { backgroundColor: entry.color } }),
          /* @__PURE__ */ jsx("span", { className: "text-slate-600 dark:text-slate-300 text-sm", children: entry.name === "views" ? "Páginas Vistas" : "Usuarios" }),
          /* @__PURE__ */ jsx("span", { className: "text-slate-900 dark:text-white font-bold ml-auto", children: entry.value.toLocaleString() })
        ] }, index))
      ] });
    }
    return null;
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/80 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-white/5 backdrop-blur-sm", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-slate-900 dark:text-white mb-1", children: "Resumen de Tráfico" }),
        /* @__PURE__ */ jsx("p", { className: "text-slate-500 dark:text-slate-400 text-sm", children: "Comportamiento global de la audiencia del portal web IESA." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex bg-white dark:bg-slate-950/80 p-1 rounded-xl border border-slate-200 dark:border-white/10", children: ["day", "week", "month"].map((range) => /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setTimeRange(range),
          className: `px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${timeRange === range ? "bg-blue-600 shadow-lg shadow-blue-500/20 text-white" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"}`,
          children: range === "day" ? "Hoy" : range === "week" ? "Esta Semana" : "Este Mes"
        },
        range
      )) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 p-6 rounded-2xl backdrop-blur-sm shadow-xl relative overflow-hidden group", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl transition-opacity opacity-0 group-hover:opacity-100" }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start mb-4", children: [
          /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400", children: /* @__PURE__ */ jsx(Eye, { className: "w-6 h-6" }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 text-green-400 bg-green-500/10 px-2 py-1 rounded text-xs font-bold", children: [
            /* @__PURE__ */ jsx(ArrowUpRight, { className: "w-3 h-3" }),
            " 12.5%"
          ] })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-slate-500 dark:text-slate-400 text-sm font-medium mb-1", children: "Páginas Vistas" }),
        /* @__PURE__ */ jsx("h3", { className: "text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight", children: kpis.views.toLocaleString() })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 p-6 rounded-2xl backdrop-blur-sm shadow-xl relative overflow-hidden group", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl transition-opacity opacity-0 group-hover:opacity-100" }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start mb-4", children: [
          /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400", children: /* @__PURE__ */ jsx(Users, { className: "w-6 h-6" }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 text-green-400 bg-green-500/10 px-2 py-1 rounded text-xs font-bold", children: [
            /* @__PURE__ */ jsx(ArrowUpRight, { className: "w-3 h-3" }),
            " 8.2%"
          ] })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-slate-500 dark:text-slate-400 text-sm font-medium mb-1", children: "Usuarios Totales" }),
        /* @__PURE__ */ jsx("h3", { className: "text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight", children: kpis.users.toLocaleString() })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 p-6 rounded-2xl backdrop-blur-sm shadow-xl relative overflow-hidden group", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl transition-opacity opacity-0 group-hover:opacity-100" }),
        /* @__PURE__ */ jsx("div", { className: "flex justify-between items-start mb-4", children: /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400", children: /* @__PURE__ */ jsx(Clock, { className: "w-6 h-6" }) }) }),
        /* @__PURE__ */ jsx("p", { className: "text-slate-500 dark:text-slate-400 text-sm font-medium mb-1", children: "Tiempo Promedio" }),
        /* @__PURE__ */ jsx("h3", { className: "text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight", children: kpis.engagement })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 p-6 rounded-2xl backdrop-blur-sm shadow-xl relative overflow-hidden group", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl transition-opacity opacity-0 group-hover:opacity-100" }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start mb-4", children: [
          /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400", children: /* @__PURE__ */ jsx(MousePointerClick, { className: "w-6 h-6" }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 text-red-400 bg-red-500/10 px-2 py-1 rounded text-xs font-bold", children: [
            /* @__PURE__ */ jsx(ArrowDownRight, { className: "w-3 h-3" }),
            " 2.1%"
          ] })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-slate-500 dark:text-slate-400 text-sm font-medium mb-1", children: "Tasa de Rebote" }),
        /* @__PURE__ */ jsx("h3", { className: "text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight", children: kpis.bounce })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 p-6 md:p-8 rounded-2xl backdrop-blur-sm shadow-xl h-[450px]", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6 flex justify-between items-center", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold text-slate-900 dark:text-white", children: "Tráfico vs Usuarios" }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-4 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" }),
            " Páginas Vistas"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" }),
            " Usuarios"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "85%", children: /* @__PURE__ */ jsxs(AreaChart, { data, margin: { top: 10, right: 10, left: 0, bottom: 0 }, children: [
        /* @__PURE__ */ jsxs("defs", { children: [
          /* @__PURE__ */ jsxs("linearGradient", { id: "colorViews", x1: "0", y1: "0", x2: "0", y2: "1", children: [
            /* @__PURE__ */ jsx("stop", { offset: "5%", stopColor: "#3b82f6", stopOpacity: 0.3 }),
            /* @__PURE__ */ jsx("stop", { offset: "95%", stopColor: "#3b82f6", stopOpacity: 0 })
          ] }),
          /* @__PURE__ */ jsxs("linearGradient", { id: "colorUsers", x1: "0", y1: "0", x2: "0", y2: "1", children: [
            /* @__PURE__ */ jsx("stop", { offset: "5%", stopColor: "#6366f1", stopOpacity: 0.3 }),
            /* @__PURE__ */ jsx("stop", { offset: "95%", stopColor: "#6366f1", stopOpacity: 0 })
          ] })
        ] }),
        /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false, stroke: "currentColor", className: "text-slate-200 dark:text-slate-800" }),
        /* @__PURE__ */ jsx(XAxis, { dataKey: "name", stroke: "#64748b", tick: { fill: "#64748b", fontSize: 12 }, dy: 10, axisLine: false, tickLine: false }),
        /* @__PURE__ */ jsx(YAxis, { stroke: "#64748b", tick: { fill: "#64748b", fontSize: 12 }, dx: -10, axisLine: false, tickLine: false }),
        /* @__PURE__ */ jsx(Tooltip, { content: /* @__PURE__ */ jsx(CustomTooltip, {}) }),
        /* @__PURE__ */ jsx(Area, { type: "monotone", dataKey: "views", stroke: "#3b82f6", strokeWidth: 3, fillOpacity: 1, fill: "url(#colorViews)", activeDot: { r: 8, strokeWidth: 0 } }),
        /* @__PURE__ */ jsx(Area, { type: "monotone", dataKey: "users", stroke: "#6366f1", strokeWidth: 3, fillOpacity: 1, fill: "url(#colorUsers)", activeDot: { r: 8, strokeWidth: 0 } })
      ] }) })
    ] })
  ] });
}

function PasskeyBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    checkPasskeyStatus();
  }, []);
  const checkPasskeyStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const isWebAuthnSupported = window.PublicKeyCredential && typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === "function";
      if (!isWebAuthnSupported) return;
      const dismissedAt = localStorage.getItem("passkey_banner_dismissed");
      const isDismissed = dismissedAt && Date.now() - parseInt(dismissedAt) < 1e3 * 60 * 60 * 24;
      if (isDismissed) return;
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      const hasWebAuthn = data?.all.some((f) => f.factor_type === "webauthn");
      if (!hasWebAuthn) {
        setTimeout(() => setIsVisible(true), 2e3);
      }
    } catch (err) {
      console.warn("Passkey status check failed:", err);
    }
  };
  const handleRegister = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "webauthn"
      });
      if (error) throw error;
      if (data?.id) {
        toast.success("¡Dispositivo vinculado con éxito!");
        setIsVisible(false);
      }
    } catch (err) {
      toast.error(err.message || "Error al registrar biometría. Asegúrate de estar en HTTPS.");
    } finally {
      setLoading(false);
    }
  };
  const handleDismiss = () => {
    localStorage.setItem("passkey_banner_dismissed", Date.now().toString());
    setIsVisible(false);
  };
  return /* @__PURE__ */ jsx(AnimatePresence, { children: isVisible && /* @__PURE__ */ jsx(
    motion.div,
    {
      initial: { y: -100, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: -100, opacity: 0 },
      className: "fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-2xl px-4",
      children: /* @__PURE__ */ jsx("div", { className: "relative overflow-hidden p-[1px] rounded-2xl bg-gradient-to-r from-blue-500/30 via-indigo-500/30 to-purple-500/30 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)]", children: /* @__PURE__ */ jsxs("div", { className: "bg-slate-900/60 backdrop-blur-xl rounded-[calc(1rem-1px)] p-4 md:p-5 flex flex-col md:flex-row items-center gap-4 justify-between border border-white/5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 text-center md:text-left", children: [
          /* @__PURE__ */ jsx("div", { className: "flex-shrink-0 w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]", children: /* @__PURE__ */ jsx(Fingerprint, { className: "w-7 h-7" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("h3", { className: "text-white font-bold flex items-center gap-2 justify-center md:justify-start", children: [
              "Acceso Rápido ",
              /* @__PURE__ */ jsx(Sparkles, { className: "w-4 h-4 text-blue-400" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-slate-300 text-xs md:text-sm", children: "Entra a tu dashboard usando tu huella o FaceID en este equipo." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 w-full md:w-auto", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: handleRegister,
              disabled: loading,
              className: "flex-1 md:flex-none px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50",
              children: loading ? "Activando..." : "Activar"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: handleDismiss,
              className: "p-2.5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-colors",
              "aria-label": "Cerrar",
              children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" })
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "absolute -bottom-10 -left-10 w-32 h-32 bg-blue-600/20 rounded-full blur-[80px]" }),
        /* @__PURE__ */ jsx("div", { className: "absolute -top-10 -right-10 w-32 h-32 bg-purple-600/20 rounded-full blur-[80px]" })
      ] }) })
    }
  ) });
}

const $$Dashboard = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, { "title": "Dashboard Principal | GA4" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "PasskeyBanner", PasskeyBanner, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/gabriel.vazquez/Desktop/Proyectos/proyecto-dashboard/ga4-dashboard/src/components/PasskeyBanner", "client:component-export": "default" })} ${maybeRenderHead()}<div class="max-w-7xl mx-auto space-y-8"> <header class="mb-4"> <h1 class="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">Visión General</h1> <p class="text-slate-500 dark:text-slate-400 text-sm">Resumen gerencial del rendimiento de tu sitio web.</p> </header>  ${renderComponent($$result2, "DashboardVisual", DashboardVisual, { "client:idle": true, "client:component-hydration": "idle", "client:component-path": "C:/Users/gabriel.vazquez/Desktop/Proyectos/proyecto-dashboard/ga4-dashboard/src/components/DashboardVisual", "client:component-export": "default" })} </div> ` })}`;
}, "C:/Users/gabriel.vazquez/Desktop/Proyectos/proyecto-dashboard/ga4-dashboard/src/pages/dashboard.astro", void 0);

const $$file = "C:/Users/gabriel.vazquez/Desktop/Proyectos/proyecto-dashboard/ga4-dashboard/src/pages/dashboard.astro";
const $$url = "/dashboard";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Dashboard,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
