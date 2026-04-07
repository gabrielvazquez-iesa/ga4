import { c as createComponent } from './astro-component_BriL74Bn.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_BuRdzBJb.mjs';
import { r as renderScript } from './global_C9DfsaNq.mjs';
import { $ as $$Layout } from './Layout_BUdS8V3m.mjs';

const $$ResetPassword = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Recuperar Contraseña | GA4 Dashboard" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="min-h-screen flex items-center justify-center bg-[#050B14] text-slate-900 dark:text-white relative overflow-hidden"> <!-- Ambient Background --> <div class="absolute inset-0 z-0"> <div class="absolute top-0 left-1/4 w-full h-[500px] bg-blue-900/10 rounded-full blur-[120px]"></div> <div class="absolute bottom-0 right-1/4 w-full h-[500px] bg-purple-900/10 rounded-full blur-[120px]"></div> <div class="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay"></div> </div> <div class="w-full max-w-md p-8 md:p-10 space-y-8 bg-white dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-[0_0_40px_rgba(0,0,0,0.5)] relative z-10"> <div class="text-center space-y-2"> <h1 class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-1">Nueva Contraseña</h1> <p class="text-slate-500 dark:text-slate-400 text-sm">Ingresa tu nueva contraseña para acceder</p> </div> <form id="reset-password-form" class="space-y-5"> <div class="relative group"> <input type="password" id="new-password" placeholder="Nueva contraseña (min. 8 caracteres)" required class="w-full bg-slate-50 dark:bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 py-3 pl-4 pr-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-slate-900 dark:text-white placeholder-slate-500 transition-all font-medium"> <button type="button" id="toggle-password" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"> <svg id="eye-icon" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg> <svg id="eye-off-icon" class="w-5 h-5 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 1.274-4.057 5.064-7 9.542-7 1.274 0 2.44.218 3.51.612m3.047 3.047A9.961 9.961 0 0121.542 12c-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3l18 18"></path></svg> </button> </div> <button type="submit" id="submit-btn" class="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white py-3 rounded-xl font-bold transition-all hover:shadow-[0_0_20px_rgba(37,99,235,0.3)]">
Guardar Contraseña
</button> <p id="message-container" class="text-sm text-center font-medium mt-4"></p> </form> </div> </main> ` })} ${renderScript($$result, "G:/Proyectos/GA4/src/pages/reset-password.astro?astro&type=script&index=0&lang.ts")}`;
}, "G:/Proyectos/GA4/src/pages/reset-password.astro", void 0);

const $$file = "G:/Proyectos/GA4/src/pages/reset-password.astro";
const $$url = "/reset-password";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$ResetPassword,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
