import { c as createComponent } from './astro-component_BriL74Bn.mjs';
import 'piccolore';
import { r as renderTemplate, n as renderSlot, o as renderHead, l as renderComponent } from './entrypoint_BuRdzBJb.mjs';
import { $ as $$ClientRouter } from './global_C9DfsaNq.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Layout;
  const { title } = Astro2.props;
  return renderTemplate(_a || (_a = __template(['<html lang="es"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"><title>', "</title>", "<script>\n      const getTheme = () => {\n        if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {\n          return localStorage.getItem('theme');\n        }\n        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';\n      };\n\n      const applyTheme = () => {\n        const theme = getTheme();\n        if (theme === 'dark') {\n          document.documentElement.classList.add('dark');\n        } else {\n          document.documentElement.classList.remove('dark');\n        }\n      };\n\n      applyTheme();\n      document.addEventListener('astro:after-swap', applyTheme);\n    <\/script>", "</head> <body> ", " </body></html>"])), title, renderComponent($$result, "ClientRouter", $$ClientRouter, {}), renderHead(), renderSlot($$result, $$slots["default"]));
}, "G:/Proyectos/GA4/src/layouts/Layout.astro", void 0);

export { $$Layout as $ };
