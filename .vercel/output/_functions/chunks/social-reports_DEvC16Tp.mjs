import { c as createComponent } from './astro-component_BriL74Bn.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_BuRdzBJb.mjs';
import { $ as $$DashboardLayout } from './DashboardLayout_Q7N1qe2-.mjs';

const $$SocialReports = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, { "title": "Reportes de Redes Sociales | GA4" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-7xl mx-auto space-y-6"> <header class="mb-2"> <h1 class="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1">Redes Sociales</h1> <p class="text-slate-500 dark:text-slate-400 text-sm">Reportes de métricas y engagement para todas las plataformas.</p> </header> ${renderComponent($$result2, "SocialReports", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "G:/Proyectos/GA4/src/components/SocialReports", "client:component-export": "default" })} </div> ` })}`;
}, "G:/Proyectos/GA4/src/pages/social-reports.astro", void 0);

const $$file = "G:/Proyectos/GA4/src/pages/social-reports.astro";
const $$url = "/social-reports";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$SocialReports,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
