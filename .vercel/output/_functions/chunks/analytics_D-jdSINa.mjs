import { c as createComponent } from './astro-component_BriL74Bn.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_BuRdzBJb.mjs';
import { $ as $$DashboardLayout } from './DashboardLayout_Q7N1qe2-.mjs';
import { A as AnalyticsDashboard } from './AnalyticsDashboard_B2vQO97v.mjs';

const $$Analytics = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, { "title": "Reportes y Analíticas | GA4" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-7xl mx-auto space-y-6"> <header class="mb-4"> <h1 class="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">Reportes Ejecutivos</h1> <p class="text-slate-500 dark:text-slate-400 text-sm">Visualización detallada y exportación con formato exacto para gerencia.</p> </header> ${renderComponent($$result2, "AnalyticsDashboard", AnalyticsDashboard, { "client:idle": true, "client:component-hydration": "idle", "client:component-path": "G:/Proyectos/GA4/src/components/AnalyticsDashboard", "client:component-export": "default" })} </div> ` })}`;
}, "G:/Proyectos/GA4/src/pages/analytics.astro", void 0);

const $$file = "G:/Proyectos/GA4/src/pages/analytics.astro";
const $$url = "/analytics";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Analytics,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
