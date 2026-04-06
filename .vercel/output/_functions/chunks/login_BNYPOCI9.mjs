import { c as createComponent } from './astro-component_Bi-3AwRB.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_BbtgLamP.mjs';
import { $ as $$Layout } from './Layout_BNKHee3F.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState } from 'react';
import { s as supabase } from './supabase_C66l0GU-.mjs';
import { Mail, Lock, EyeOff, Eye, LogIn, UserPlus, KeyRound, Fingerprint } from 'lucide-react';
import { Toaster, toast } from 'sonner';

function AuthForm() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("Comunicaciones");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const handleAuth = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Por favor ingresa tu correo electrónico.");
      return;
    }
    if (!email.toLowerCase().endsWith("@iesa.edu.ve") && !["admin@iesa.edu.ve", "gabriel.vazquez@iesa.edu.ve"].includes(email.toLowerCase())) {
      toast.error("Solo se permiten correos institucionales de @iesa.edu.ve");
      return;
    }
    setLoading(true);
    try {
      if (mode === "login") {
        if (!password) {
          toast.error("Por favor ingresa tu contraseña.");
          setLoading(false);
          return;
        }
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data?.user) {
          await supabase.from("user_profiles").upsert({
            user_id: data.user.id,
            display_name: data.user.user_metadata?.name || email.split("@")[0],
            department: data.user.user_metadata?.department || "Comunicaciones"
          }, { onConflict: "user_id" });
        }
        toast.success("Inicio de sesión exitoso. Redirigiendo...");
        window.location.href = "/dashboard";
      } else if (mode === "register") {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        if (password.length < 8 || !hasUpperCase || !hasNumber) {
          toast.error("La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.");
          setLoading(false);
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { department }
          }
        });
        if (error) throw error;
        if (data.user) {
          await supabase.from("user_profiles").upsert({
            user_id: data.user.id,
            display_name: email.split("@")[0],
            department
          });
          await supabase.from("system_notifications").insert([{
            title: "Nuevo Registro",
            message: `El usuario ${email} se ha registrado bajo el área de ${department}.`,
            is_read: false
          }]);
        }
        toast.success(
          "¡Registro exitoso! Por favor, revisa la bandeja de entrada de tu correo institucional para verificar la cuenta.",
          { duration: 8e3 }
        );
        setMode("login");
        setPassword("");
      } else if (mode === "recovery") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`
        });
        if (error) throw error;
        toast.success("Se han enviado las instrucciones a tu correo.", {
          duration: 5e3
        });
        setMode("login");
      }
    } catch (error) {
      toast.error(error.message || "Ha ocurrido un error durante la autenticación.");
    } finally {
      setLoading(false);
    }
  };
  const handlePasskeyLogin = async () => {
    if (!email) {
      toast.error("Por favor ingresa tu correo institucional para usar la huella.");
      return;
    }
    if (!email.toLowerCase().endsWith("@iesa.edu.ve") && !["admin@iesa.edu.ve", "gabriel.vazquez@iesa.edu.ve"].includes(email.toLowerCase())) {
      toast.error("Solo se permiten correos @iesa.edu.ve");
      return;
    }
    setLoading(true);
    try {
      const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
      if (factorsError) throw factorsError;
      const webAuthnFactor = factors?.all.find((f) => f.factor_type === "webauthn" && f.status === "verified");
      if (!webAuthnFactor) {
        throw new Error("No se encontró una huella registrada para este dispositivo. Inicia sesión normalmente y regístrala.");
      }
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: webAuthnFactor.id
      });
      if (challengeError) throw challengeError;
      const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
        factorId: webAuthnFactor.id,
        challengeId: challenge.id
      });
      if (verifyError) throw verifyError;
      if (verifyData) {
        toast.success("¡Acceso concedido con biometría!");
        window.location.href = "/dashboard";
      }
    } catch (error) {
      toast.error(error.message || "Error en la autenticación biométrica.");
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            hd: "iesa.edu.ve"
          }
        }
      });
      if (error) throw error;
    } catch (error) {
      toast.error(error.message || "Error al conectar con Google.");
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md p-8 md:p-10 space-y-8 bg-white dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-xl dark:shadow-[0_0_40px_rgba(0,0,0,0.5)] relative overflow-hidden", children: [
    /* @__PURE__ */ jsx(Toaster, { position: "top-right", richColors: true, theme: "system" }),
    /* @__PURE__ */ jsx("div", { className: "absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" }),
    /* @__PURE__ */ jsx("div", { className: "absolute -top-24 -right-24 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl" }),
    /* @__PURE__ */ jsxs("div", { className: "text-center space-y-2 relative z-10", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-1", children: mode === "login" ? "Bienvenido de vuelta" : mode === "register" ? "Crea una cuenta" : "Recuperar acceso" }),
      /* @__PURE__ */ jsx("p", { className: "text-slate-500 dark:text-slate-400 text-sm", children: mode === "login" ? "Ingresa tus credenciales para continuar" : mode === "register" ? "Únete para gestionar tus analíticas" : "Te enviaremos un enlace de recuperación" })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleAuth, className: "space-y-5 relative z-10", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(Mail, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 dark:text-slate-400" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "email",
              placeholder: "correo@ejemplo.com",
              value: email,
              onChange: (e) => setEmail(e.target.value),
              className: "w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 py-3 pl-11 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-slate-900 dark:text-white placeholder-slate-500 transition-all font-medium"
            }
          )
        ] }),
        mode !== "recovery" && /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(Lock, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 dark:text-slate-400" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: showPassword ? "text" : "password",
              placeholder: "Tu contraseña",
              value: password,
              onChange: (e) => setPassword(e.target.value),
              className: "w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 py-3 pl-11 pr-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-slate-900 dark:text-white placeholder-slate-500 transition-all font-medium"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setShowPassword(!showPassword),
              className: "absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors",
              tabIndex: -1,
              children: showPassword ? /* @__PURE__ */ jsx(EyeOff, { className: "w-5 h-5" }) : /* @__PURE__ */ jsx(Eye, { className: "w-5 h-5" })
            }
          )
        ] }),
        mode === "register" && /* @__PURE__ */ jsxs("div", { className: "space-y-4 mb-4 mt-4", children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1", children: "Área de la Empresa" }),
          /* @__PURE__ */ jsxs("div", { className: "relative group", children: [
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: department,
                onChange: (e) => setDepartment(e.target.value),
                className: "w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-slate-900 dark:text-white transition-all font-medium appearance-none cursor-pointer",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "Comunicaciones", children: "Comunicaciones" }),
                  /* @__PURE__ */ jsx("option", { value: "Mercadeo", children: "Mercadeo" }),
                  /* @__PURE__ */ jsx("option", { value: "Ventas", children: "Ventas" }),
                  /* @__PURE__ */ jsx("option", { value: "RRHH", children: "Recursos Humanos (RRHH)" }),
                  /* @__PURE__ */ jsx("option", { value: "Operaciones", children: "Operaciones" })
                ]
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-xs", children: "▼" })
          ] })
        ] })
      ] }),
      mode === "login" && /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => setMode("recovery"),
          className: "text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors",
          children: "¿Olvidaste tu contraseña?"
        }
      ) }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          disabled: loading,
          className: "w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50 hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:hover:shadow-none",
          children: loading ? /* @__PURE__ */ jsx("span", { className: "w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            mode === "login" ? /* @__PURE__ */ jsx(LogIn, { className: "w-5 h-5" }) : mode === "register" ? /* @__PURE__ */ jsx(UserPlus, { className: "w-5 h-5" }) : /* @__PURE__ */ jsx(KeyRound, { className: "w-5 h-5" }),
            mode === "login" ? "Iniciar Sesión" : mode === "register" ? "Crear Cuenta" : "Enviar Enlace"
          ] })
        }
      )
    ] }),
    mode !== "recovery" && /* @__PURE__ */ jsxs("div", { className: "relative py-2 z-10", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center", children: /* @__PURE__ */ jsx("span", { className: "w-full border-t border-slate-200 dark:border-white/10" }) }),
      /* @__PURE__ */ jsx("div", { className: "relative flex justify-center text-xs uppercase font-semibold", children: /* @__PURE__ */ jsx("span", { className: "bg-white dark:bg-[#0a0f1c] px-3 text-slate-500 tracking-wider", children: "O continúa con" }) })
    ] }),
    mode !== "recovery" && /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4 relative z-10", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: handleGoogleLogin,
          className: "flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-900 py-3 rounded-xl font-bold transition-all hover:scale-[1.02] border border-slate-200",
          children: [
            /* @__PURE__ */ jsxs("svg", { className: "w-5 h-5", viewBox: "0 0 24 24", children: [
              /* @__PURE__ */ jsx("path", { fill: "#4285F4", d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" }),
              /* @__PURE__ */ jsx("path", { fill: "#34A853", d: "M12 24c2.87 0 5.28-.95 7.04-2.58l-3.57-2.77c-.95.64-2.17 1.02-3.47 1.02-2.67 0-4.93-1.8-5.74-4.22H2.5v2.85C4.26 21.8 7.82 24 12 24z" }),
              /* @__PURE__ */ jsx("path", { fill: "#FBBC05", d: "M6.26 15.45c-.21-.64-.32-1.31-.32-2.02s.11-1.38.32-2.02V8.56H2.5C1.8 9.95 1.4 11.45 1.4 13.06c0 1.61.4 3.11 1.1 4.5l3.76-2.11z" }),
              /* @__PURE__ */ jsx("path", { fill: "#EA4335", d: "M12 4.41c1.55 0 2.94.53 4.04 1.58l3.03-3.03C17.27 1.11 14.86 0 12 0 7.82 0 4.26 2.2 2.5 5.68l3.76 2.85c.81-2.42 3.07-4.12 5.74-4.12z" })
            ] }),
            "Google"
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: handlePasskeyLogin,
          disabled: loading,
          className: "flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold transition-all hover:scale-[1.02] border border-white/10",
          children: [
            /* @__PURE__ */ jsx(Fingerprint, { className: "w-5 h-5 text-blue-400" }),
            "Huella"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "text-center relative z-10 pt-2", children: /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => setMode(mode === "login" ? "register" : "login"),
        className: "text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors",
        children: mode === "login" ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"
      }
    ) })
  ] });
}

const $$Login = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Acceso | GA4 Dashboard" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#050B14] text-slate-900 dark:text-white relative overflow-hidden"> <!-- Ambient Background --> <div class="absolute inset-0 z-0"> <div class="absolute top-0 left-1/4 w-full h-[500px] bg-blue-900/10 rounded-full blur-[120px]"></div> <div class="absolute bottom-0 right-1/4 w-full h-[500px] bg-purple-900/10 rounded-full blur-[120px]"></div> <div class="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay"></div> </div> <!-- Go Back Link --> <a href="/" class="absolute top-8 left-8 z-20 flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors text-sm font-medium"> <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
Volver al inicio
</a> <!-- Auth Form Island --> ${renderComponent($$result2, "AuthForm", AuthForm, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/gabriel.vazquez/Desktop/Proyectos/proyecto-dashboard/ga4-dashboard/src/components/AuthForm", "client:component-export": "default" })} </main> ` })}`;
}, "C:/Users/gabriel.vazquez/Desktop/Proyectos/proyecto-dashboard/ga4-dashboard/src/pages/login.astro", void 0);

const $$file = "C:/Users/gabriel.vazquez/Desktop/Proyectos/proyecto-dashboard/ga4-dashboard/src/pages/login.astro";
const $$url = "/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
