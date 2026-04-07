import { c as createComponent } from './astro-component_BriL74Bn.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_BuRdzBJb.mjs';
import { $ as $$Layout } from './Layout_BUdS8V3m.mjs';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "GA4 Dashboard | Control total de tus analíticas" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="relative min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden flex flex-col justify-center"> <!-- Background decorations --> <div class="absolute inset-0 z-0"> <div class="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]"></div> <div class="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]"></div> <div class="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div> </div> <!-- Navigation (Simple) --> <nav class="absolute top-0 w-full z-20 flex justify-between items-center py-4 px-4 md:py-6 md:px-8 lg:px-16"> <div class="text-xl md:text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400">
GA4<span class="text-blue-600 dark:text-blue-500">Dash</span> </div> <div class="flex items-center gap-3 md:gap-6"> <a href="/login" class="text-xs md:text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">Ingresar</a> <a href="/login" class="px-4 py-2 md:px-5 md:py-2.5 text-xs md:text-sm font-semibold bg-slate-900 dark:bg-white text-white dark:text-black rounded-full hover:bg-slate-800 dark:hover:bg-slate-200 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
Comenzar ahora
</a> </div> </nav> <!-- Hero Section --> <div class="relative z-10 max-w-7xl mx-auto px-8 lg:px-16 flex flex-col items-center text-center mt-20"> <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-600 dark:text-slate-300 mb-8 backdrop-blur-md"> <span class="flex h-2 w-2 rounded-full bg-blue-500"></span> <span>Plataforma de Analíticas MVP</span> </div> <h1 class="text-5xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
Tus datos de Google Analytics <br class="hidden lg:block"> <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">en un solo lugar</span> </h1> <p class="text-lg lg:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mb-12">
Accede a reportes detallados, visualiza métricas de equipo y gestiona el rendimiento de tu propiedad de GA4 de forma rápida, segura y centralizada.
</p> <div class="flex flex-col sm:flex-row gap-4 justify-center"> <a href="/login" class="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-lg transition-all hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:-translate-y-1">
Ir al Panel de Control
</a> <a href="/about" class="px-8 py-4 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-full font-bold text-lg backdrop-blur-md transition-all">
Conocer más
</a> </div> </div> <!-- Preview / Mockup (Floating UI effect) --> <div class="relative z-10 w-full max-w-5xl mx-auto mt-20 px-4 mb-20"> <div class="relative rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/50 backdrop-blur-2xl shadow-2xl shadow-blue-500/10 dark:shadow-none overflow-hidden flex flex-col items-center p-6 md:p-10"> <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>  <div class="w-full flex justify-between items-center mb-8 border-b border-slate-200 dark:border-white/10 pb-6"> <div class="flex items-center gap-4"> <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">GA</div> <div> <div class="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-md mb-2"></div> <div class="h-3 w-48 bg-slate-100 dark:bg-slate-800/50 rounded-md"></div> </div> </div> <div class="h-10 w-32 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/20 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
Reporte 7D
</div> </div> <div class="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-8"> <div class="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 p-6 rounded-2xl flex flex-col justify-between"> <span class="text-sm font-semibold text-slate-500 dark:text-slate-400">Páginas Vistas</span> <span class="text-3xl font-black text-slate-900 dark:text-white mt-4">124k</span> <div class="w-16 h-1 mt-4 bg-green-500 rounded-full"></div> </div> <div class="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden"> <div class="absolute inset-0 bg-blue-500/5 dark:bg-blue-500/10 mix-blend-multiply dark:mix-blend-lighten blur-xl"></div> <span class="text-sm font-semibold text-slate-500 dark:text-slate-400 relative z-10">Usuarios Activos</span> <span class="text-3xl font-black text-slate-900 dark:text-white mt-4 relative z-10">45,012</span> <div class="w-16 h-1 mt-4 bg-blue-500 rounded-full relative z-10"></div> </div> <div class="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 p-6 rounded-2xl flex flex-col justify-between"> <span class="text-sm font-semibold text-slate-500 dark:text-slate-400">Tasa de Rebote</span> <span class="text-3xl font-black text-slate-900 dark:text-white mt-4">32.4%</span> <div class="w-16 h-1 mt-4 bg-red-500 rounded-full"></div> </div> </div>  <div class="w-full flex-1 min-h-[150px] rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20 flex flex-col items-center justify-center py-10 transition-colors"> <p class="text-slate-600 dark:text-slate-400 font-medium mb-6 text-center max-w-sm">Conecta tu propiedad de Google Analytics 4 y despliega tus reportes de inmediato.</p> <a href="/login" class="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-black font-bold rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_30px_rgba(255,255,255,0.1)] hover:-translate-y-1 transition-all">
Ingresar al Sistema Seguro
</a> </div> </div> </div> </main> ` })}`;
}, "G:/Proyectos/GA4/src/pages/index.astro", void 0);

const $$file = "G:/Proyectos/GA4/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
