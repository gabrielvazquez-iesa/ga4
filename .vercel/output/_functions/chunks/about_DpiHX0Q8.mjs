import { c as createComponent } from './astro-component_BriL74Bn.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_BuRdzBJb.mjs';
import { $ as $$Layout } from './Layout_BUdS8V3m.mjs';

const $$About = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Conocer más | Utilidades y Seguridad GA4Dash" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="relative min-h-screen bg-white dark:bg-[#050B14] text-slate-900 dark:text-white overflow-x-hidden selection:bg-blue-500/30"> <!-- Background decorations --> <div class="fixed inset-0 z-0 pointer-events-none"> <div class="absolute top-0 right-0 w-[50vw] h-[50vh] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[150px]"></div> <div class="absolute bottom-0 left-0 w-[50vw] h-[50vh] bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-[150px]"></div> <div class="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div> </div> <!-- Simple Nav --> <nav class="relative z-20 w-full flex justify-between items-center py-6 px-6 lg:px-16 border-b border-slate-200 dark:border-white/5"> <a href="/" class="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 flex items-center gap-2"> <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-500"><path d="m15 18-6-6 6-6"></path></svg>
Volver
</a> <a href="/login" class="px-5 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-full hover:bg-blue-500 transition-all shadow-md shadow-blue-500/20">
Ingresar al sistema
</a> </nav> <!-- Content --> <div class="relative z-10 max-w-4xl mx-auto px-6 py-20 lg:py-32"> <div class="mb-16 text-center"> <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-6">
Documentación
</div> <h1 class="text-5xl font-extrabold tracking-tight mb-6">Capacidades del Sistema</h1> <p class="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
Diseñado para centralizar la toma de decisiones, garantizando altísimos controles de seguridad corporativa.
</p> </div> <div class="space-y-16">  <section class="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-8 lg:p-12 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none"> <div class="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-500/30 text-white"> <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"></path><path d="m19 9-5 5-4-4-3 3"></path></svg> </div> <h2 class="text-3xl font-bold mb-4">Extracción Híbrida de Analíticas</h2> <p class="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-6">
El núcleo del sistema consume la API oficial de Google Analytics 4 utilizando credenciales backend para evitar exponer tokens al cliente. Los datos se procesan en tiempo real para generar métricas comprensibles sin la densa interfaz nativa de Google.
</p> <ul class="space-y-3 text-slate-700 dark:text-slate-300 font-medium"> <li class="flex gap-3 items-center"><span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Tráfico en tiempo real y dimensiones secundarias.</li> <li class="flex gap-3 items-center"><span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Análisis de eventos críticos del ciclo de ventas.</li> <li class="flex gap-3 items-center"><span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Medición por plataformas sociales (Facebook, Instagram, LinkedIn).</li> </ul> </section>  <section class="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-8 lg:p-12 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none"> <div class="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-purple-500/30 text-white"> <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> </div> <h2 class="text-3xl font-bold mb-4">Seguridad y Bóveda Criptográfica</h2> <p class="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-6">
La infraestructura está protegida por políticas estrictas de control de acceso a bases de datos (RLS) gestionadas mediante Supabase. Esto niega cualquier intento de inyección SQL o peticiones directas API no autorizadas por la red Vercel.
</p> <ul class="space-y-3 text-slate-700 dark:text-slate-300 font-medium"> <li class="flex gap-3 items-center"><span class="w-1.5 h-1.5 rounded-full bg-purple-500"></span> Encriptación JWT para autenticación.</li> <li class="flex gap-3 items-center"><span class="w-1.5 h-1.5 rounded-full bg-purple-500"></span> Módulo especial de "Bóveda" con perfiles de visibilidad cerrados (HasVaultAccess).</li> <li class="flex gap-3 items-center"><span class="w-1.5 h-1.5 rounded-full bg-purple-500"></span> PWA nativa con CSP (Content Security Policies) preparadas para anti-XSS y Passkeys.</li> </ul> </section>  <section class="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-8 lg:p-12 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none"> <div class="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-emerald-500/30 text-white"> <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"></path><path d="m17 5-5-3-5 3"></path><path d="m17 19-5 3-5-3"></path><path d="M2 12h20"></path><path d="m5 7 3 5-3 5"></path><path d="m19 7-3 5 3 5"></path></svg> </div> <h2 class="text-3xl font-bold mb-4">Centros de Operatividad Compartida</h2> <p class="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
Hemos transformado analíticas frías en flujos de trabajo de equipo:
<br><br>
- <strong>Planeador de Guardias:</strong> UI dinámica con personalización de perfil de colores donde los analistas programan responsabilidades semanales arrastrando eventos.<br>
- <strong>Notificaciones Push y Broadcasting:</strong> Un panel interno global o focalizado para coordinar estrategias al instante usando notificaciones persistentes en base de datos.
</p> </section> </div> </div> </main> ` })}`;
}, "G:/Proyectos/GA4/src/pages/about.astro", void 0);

const $$file = "G:/Proyectos/GA4/src/pages/about.astro";
const $$url = "/about";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$About,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
