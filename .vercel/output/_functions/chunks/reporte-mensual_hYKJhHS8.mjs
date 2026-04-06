import { c as createComponent } from './astro-component_CCwRo9GX.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_Bgf5ToQF.mjs';
import { $ as $$DashboardLayout } from './DashboardLayout_B4a3eXfo.mjs';
import { jsx, jsxs } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { a as apiFetch } from './api-fetch__Gu9eav4.mjs';
import { s as supabase } from './supabase_C66l0GU-.mjs';
import { ShieldCheck, Calendar, Copy, AlertTriangle } from 'lucide-react';
import { toast, Toaster } from 'sonner';

function MonthlyReport() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const today = /* @__PURE__ */ new Date();
  today.setMonth(today.getMonth() - 1);
  const defaultMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const [month, setMonth] = useState(defaultMonth);
  useEffect(() => {
    checkAdmin();
  }, []);
  useEffect(() => {
    if (isAdmin) fetchData();
  }, [month, isAdmin]);
  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const email = session?.user?.email || "";
    const admin = ["admin@iesa.edu.ve", "gabriel.vazquez@iesa.edu.ve"].includes(email.toLowerCase());
    setIsAdmin(admin);
    if (!admin) setLoading(false);
  };
  const fetchData = async () => {
    setLoading(true);
    setErrorMsg("");
    setData(null);
    try {
      const res = await apiFetch(`/api/monthly-report?month=${month}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json.data);
      if (json.data.gscError) {
        toast.warning("Error de Search Console: " + json.data.gscError);
      }
    } catch (e) {
      setErrorMsg(e.message);
    } finally {
      setLoading(false);
    }
  };
  const copyToClipboard = () => {
    if (!data) return;
    const textData = [
      data.vistas,
      data.rebote,
      data.userEngagement,
      data.sesiones,
      data.nuevosUsers,
      data.recurrentes,
      data.scroll,
      data.formattedTime,
      data.clics,
      data.ctr,
      data.impresiones,
      data.direct,
      data.organic,
      data.paid,
      data.social,
      data.referral
    ].join("\n");
    navigator.clipboard.writeText(textData).then(() => {
      toast.success("¡Datos copiados! Presiona Ctrl+V en tu columna de Excel.");
    }).catch((err) => {
      console.error("Error al copiar", err);
      toast.error("Hubo un error al copiar al portapapeles.");
    });
  };
  if (!loading && !isAdmin) {
    return /* @__PURE__ */ jsx("div", { className: "flex justify-center py-20", children: /* @__PURE__ */ jsxs("div", { className: "bg-red-500/10 border border-red-500/20 text-red-500 p-8 rounded-2xl max-w-md text-center", children: [
      /* @__PURE__ */ jsx(ShieldCheck, { className: "w-16 h-16 mx-auto mb-4 opacity-50" }),
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mb-2", children: "Acceso Restringido" }),
      /* @__PURE__ */ jsx("p", { children: "El Reporte Gerencial Mensual es exclusivo para administradores del sistema." })
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx(Toaster, { position: "top-right", theme: "dark" }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/80 dark:bg-slate-900/60 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-white/10 backdrop-blur-sm", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "w-10 h-10 bg-indigo-500/20 text-indigo-500 flex items-center justify-center rounded-xl border border-indigo-500/30", children: /* @__PURE__ */ jsx(Calendar, { className: "w-5 h-5" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs font-bold uppercase tracking-wider text-slate-500 block", children: "Período de Reporte" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "month",
              value: month,
              onChange: (e) => setMonth(e.target.value),
              className: "bg-transparent text-lg font-bold outline-none text-slate-900 dark:text-white"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: copyToClipboard,
          disabled: !data || loading,
          className: "flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-lg",
          children: [
            /* @__PURE__ */ jsx(Copy, { className: "w-4 h-4" }),
            "Copiar Formato Excel"
          ]
        }
      )
    ] }),
    errorMsg && /* @__PURE__ */ jsxs("div", { className: "bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex gap-3", children: [
      /* @__PURE__ */ jsx(AlertTriangle, { className: "w-5 h-5 shrink-0" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: errorMsg })
    ] }),
    loading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-24", children: /* @__PURE__ */ jsx("div", { className: "w-10 h-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" }) }) : data ? /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-md animate-in fade-in duration-500", children: [
      data.gscError && /* @__PURE__ */ jsxs("div", { className: "bg-red-500/10 text-red-500 text-sm p-4 border-b border-red-500/20 flex gap-2 items-center", children: [
        /* @__PURE__ */ jsx(AlertTriangle, { className: "w-4 h-4 shrink-0" }),
        "Aviso: Datos de Search Console (Clics, CTR, Impresiones) no disponibles. ",
        data.gscError
      ] }),
      /* @__PURE__ */ jsxs("table", { className: "w-full text-left text-sm", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-white/5", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-xs", children: "Métrica Exacta" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-xs text-right", children: "Valor Obtenido" })
        ] }) }),
        /* @__PURE__ */ jsxs("tbody", { className: "divide-y divide-slate-100 dark:divide-white/5", children: [
          /* @__PURE__ */ jsxs("tr", { className: "hover:bg-slate-50 dark:hover:bg-white/5 transition-colors", children: [
            /* @__PURE__ */ jsx("td", { className: "px-6 py-3 font-medium", children: "1. Páginas vistas" }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-3 text-right font-mono", children: data.vistas.toLocaleString() })
          ] }),
          /* @__PURE__ */ jsxs("tr", { className: "hover:bg-slate-50 dark:hover:bg-white/5 transition-colors", children: [
            /* @__PURE__ */ jsx("td", { className: "px-6 py-3 font-medium", children: "2. Tasa de rebote" }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-3 text-right font-mono", children: data.rebote })
          ] }),
          /* @__PURE__ */ jsxs("tr", { className: "hover:bg-slate-50 dark:hover:bg-white/5 transition-colors", children: [
            /* @__PURE__ */ jsx("td", { className: "px-6 py-3 font-medium", children: "3. User engagement" }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-3 text-right font-mono", children: data.userEngagement.toLocaleString() })
          ] }),
          /* @__PURE__ */ jsxs("tr", { className: "hover:bg-slate-50 dark:hover:bg-white/5 transition-colors", children: [
            /* @__PURE__ */ jsx("td", { className: "px-6 py-3 font-medium", children: "4. Sesión iniciada" }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-3 text-right font-mono", children: data.sesiones.toLocaleString() })
          ] }),
          /* @__PURE__ */ jsxs("tr", { className: "hover:bg-slate-50 dark:hover:bg-white/5 transition-colors", children: [
            /* @__PURE__ */ jsx("td", { className: "px-6 py-3 font-medium", children: "5. Usuarios nuevos" }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-3 text-right font-mono", children: data.nuevosUsers.toLocaleString() })
          ] }),
          /* @__PURE__ */ jsxs("tr", { className: "hover:bg-slate-50 dark:hover:bg-white/5 transition-colors", children: [
            /* @__PURE__ */ jsx("td", { className: "px-6 py-3 font-medium", children: "6. Usuarios recurrentes" }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-3 text-right font-mono", children: data.recurrentes.toLocaleString() })
          ] }),
          /* @__PURE__ */ jsxs("tr", { className: "hover:bg-slate-50 dark:hover:bg-white/5 transition-colors", children: [
            /* @__PURE__ */ jsx("td", { className: "px-6 py-3 font-medium", children: "7. Scroll" }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-3 text-right font-mono", children: data.scroll.toLocaleString() })
          ] }),
          /* @__PURE__ */ jsxs("tr", { className: "hover:bg-slate-50 dark:hover:bg-white/5 transition-colors", children: [
            /* @__PURE__ */ jsx("td", { className: "px-6 py-3 font-medium", children: "8. Tiempo promedio (min)" }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-3 text-right font-mono", children: data.formattedTime })
          ] }),
          /* @__PURE__ */ jsxs("tr", { className: "hover:bg-slate-50 dark:hover:bg-white/5 transition-colors bg-slate-50/50 dark:bg-white/5", children: [
            /* @__PURE__ */ jsx("td", { className: "px-6 py-3 font-medium", children: "9. Clics (GSC)" }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-3 text-right font-mono", children: data.clics.toLocaleString() })
          ] }),
          /* @__PURE__ */ jsxs("tr", { className: "hover:bg-slate-50 dark:hover:bg-white/5 transition-colors bg-slate-50/50 dark:bg-white/5", children: [
            /* @__PURE__ */ jsx("td", { className: "px-6 py-3 font-medium", children: "10. CTR (GSC)" }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-3 text-right font-mono", children: data.ctr })
          ] }),
          /* @__PURE__ */ jsxs("tr", { className: "hover:bg-slate-50 dark:hover:bg-white/5 transition-colors bg-slate-50/50 dark:bg-white/5", children: [
            /* @__PURE__ */ jsx("td", { className: "px-6 py-3 font-medium", children: "11. Impresiones (GSC)" }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-3 text-right font-mono", children: data.impresiones.toLocaleString() })
          ] }),
          /* @__PURE__ */ jsxs("tr", { className: "hover:bg-slate-50 dark:hover:bg-white/5 transition-colors", children: [
            /* @__PURE__ */ jsx("td", { className: "px-6 py-3 font-medium", children: "12. Usuarios Directos" }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-3 text-right font-mono", children: data.direct.toLocaleString() })
          ] }),
          /* @__PURE__ */ jsxs("tr", { className: "hover:bg-slate-50 dark:hover:bg-white/5 transition-colors", children: [
            /* @__PURE__ */ jsx("td", { className: "px-6 py-3 font-medium", children: "13. Búsquedas Orgánicas" }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-3 text-right font-mono", children: data.organic.toLocaleString() })
          ] }),
          /* @__PURE__ */ jsxs("tr", { className: "hover:bg-slate-50 dark:hover:bg-white/5 transition-colors", children: [
            /* @__PURE__ */ jsx("td", { className: "px-6 py-3 font-medium", children: "14. Búsquedas Pagas" }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-3 text-right font-mono", children: data.paid.toLocaleString() })
          ] }),
          /* @__PURE__ */ jsxs("tr", { className: "hover:bg-slate-50 dark:hover:bg-white/5 transition-colors", children: [
            /* @__PURE__ */ jsx("td", { className: "px-6 py-3 font-medium", children: "15. Tráfico Orgánico Redes Sociales" }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-3 text-right font-mono", children: data.social.toLocaleString() })
          ] }),
          /* @__PURE__ */ jsxs("tr", { className: "hover:bg-slate-50 dark:hover:bg-white/5 transition-colors", children: [
            /* @__PURE__ */ jsx("td", { className: "px-6 py-3 font-medium", children: "16. Referidos externos" }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-3 text-right font-mono", children: data.referral.toLocaleString() })
          ] })
        ] })
      ] })
    ] }) : null
  ] });
}

const $$ReporteMensual = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, { "title": "Reporte Gerencial | GA4" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-5xl mx-auto space-y-6"> <header class="mb-4"> <h1 class="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">Exportador Mensual Gerencial</h1> <p class="text-slate-500 dark:text-slate-400 text-sm">Integración automatizada de GA4 y Search Console para las plantillas maestras en Excel.</p> </header> ${renderComponent($$result2, "MonthlyReport", MonthlyReport, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/gabriel.vazquez/Desktop/Proyectos/proyecto-dashboard/ga4-dashboard/src/components/MonthlyReport", "client:component-export": "default" })} </div> ` })}`;
}, "C:/Users/gabriel.vazquez/Desktop/Proyectos/proyecto-dashboard/ga4-dashboard/src/pages/reporte-mensual.astro", void 0);

const $$file = "C:/Users/gabriel.vazquez/Desktop/Proyectos/proyecto-dashboard/ga4-dashboard/src/pages/reporte-mensual.astro";
const $$url = "/reporte-mensual";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$ReporteMensual,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
