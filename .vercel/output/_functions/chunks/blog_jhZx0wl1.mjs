import { c as createComponent } from './astro-component_Bi-3AwRB.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_BbtgLamP.mjs';
import { $ as $$DashboardLayout } from './DashboardLayout_jfAd883J.mjs';
import { A as AnalyticsDashboard } from './AnalyticsDashboard_DnTq0Xj1.mjs';

const $$Blog = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, { "title": "Reportes del Blog | GA4" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-7xl mx-auto space-y-6"> <header class="mb-4"> <h1 class="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">Reportes Ejecutivos / Blog</h1> <p class="text-slate-500 dark:text-slate-400 text-sm">Comportamiento filtrado para los artículos de IESA al Día.</p> </header> ${renderComponent($$result2, "AnalyticsDashboard", AnalyticsDashboard, { "client:idle": true, "filterPath": "/iesa-al-dia", "mainTitle": "Analítica: Blog IESA", "client:component-hydration": "idle", "client:component-path": "C:/Users/gabriel.vazquez/Desktop/Proyectos/proyecto-dashboard/ga4-dashboard/src/components/AnalyticsDashboard", "client:component-export": "default" })} </div> ` })}`;
}, "C:/Users/gabriel.vazquez/Desktop/Proyectos/proyecto-dashboard/ga4-dashboard/src/pages/analytics/blog.astro", void 0);

const $$file = "C:/Users/gabriel.vazquez/Desktop/Proyectos/proyecto-dashboard/ga4-dashboard/src/pages/analytics/blog.astro";
const $$url = "/analytics/blog";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Blog,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
