import { c as createComponent } from './astro-component_BriL74Bn.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_BuRdzBJb.mjs';
import { $ as $$DashboardLayout } from './DashboardLayout_Q7N1qe2-.mjs';
import { jsx, jsxs } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { s as supabase } from './supabase_C66l0GU-.mjs';
import { User, Camera, Mail, Link, RefreshCw, Save, Lock, ShieldCheck, Shield, CheckCircle2, Trash2, Fingerprint } from 'lucide-react';
import { Toaster, toast } from 'sonner';

function ProfileManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profile, setProfile] = useState({
    user_id: "",
    display_name: "",
    bio: "",
    avatar_url: "",
    linkedin_url: "",
    twitter_url: ""
  });
  useEffect(() => {
    loadUser();
  }, []);
  const loadUser = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      setUserId(session.user.id);
      setUserEmail(session.user.email || "");
      setIsAdmin(["admin@iesa.edu.ve", "gabriel.vazquez@iesa.edu.ve"].includes((session.user.email || "").toLowerCase()));
      const { data, error } = await supabase.from("user_profiles").select("*").eq("user_id", session.user.id).maybeSingle();
      if (error && error.code !== "42P01") {
        console.error("Error fetching profile", error);
      } else if (data) {
        setProfile(data);
      } else {
        setProfile((p) => ({ ...p, user_id: session.user.id }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from("user_profiles").upsert({
        user_id: userId,
        display_name: profile.display_name,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
        linkedin_url: profile.linkedin_url,
        twitter_url: profile.twitter_url,
        custom_color: profile.custom_color
      }, { onConflict: "user_id" });
      if (error) {
        if (error.code === "42P01") {
          toast.error("La tabla user_profiles no existe en la base de datos.");
        } else {
          throw error;
        }
      } else {
        toast.success("Perfil actualizado correctamente.");
      }
    } catch (error) {
      toast.error("Error al guardar: " + error.message);
    } finally {
      setSaving(false);
    }
  };
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Contraseña actualizada con éxito");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error("Error al cambiar contraseña: " + error.message);
    } finally {
      setSaving(false);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "flex justify-center p-12", children: /* @__PURE__ */ jsx("div", { className: "w-8 h-8 border-4 border-slate-300 dark:border-slate-700 border-t-blue-500 rounded-full animate-spin" }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsx(Toaster, { theme: "system", richColors: true, position: "top-right" }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-2xl p-8 backdrop-blur-sm shadow-xl flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10" }),
      /* @__PURE__ */ jsx("div", { className: "relative group shrink-0", children: /* @__PURE__ */ jsxs("div", { className: "w-32 h-32 rounded-full border-4 border-slate-200 dark:border-slate-950 bg-slate-100 dark:bg-slate-800 shadow-xl overflow-hidden flex items-center justify-center relative", children: [
        profile.avatar_url ? /* @__PURE__ */ jsx("img", { src: profile.avatar_url, alt: "Avatar", className: "w-full h-full object-cover" }) : /* @__PURE__ */ jsx(User, { className: "w-16 h-16 text-slate-500" }),
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer", children: /* @__PURE__ */ jsx(Camera, { className: "w-8 h-8 text-white" }) })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 text-center md:text-left space-y-2", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl font-extrabold text-slate-900 dark:text-white", children: profile.display_name || "Usuario GA4" }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center md:justify-start gap-2 text-slate-500 dark:text-slate-400", children: [
          /* @__PURE__ */ jsx(Mail, { className: "w-4 h-4" }),
          /* @__PURE__ */ jsx("span", { children: userEmail })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "pt-2 flex flex-wrap gap-2 justify-center md:justify-start", children: [
          /* @__PURE__ */ jsx("span", { className: `px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg border ${isAdmin ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" : "bg-blue-500/20 text-blue-400 border-blue-500/30"}`, children: isAdmin ? "Administrador" : "Visualizador" }),
          /* @__PURE__ */ jsx("span", { className: "px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg border bg-green-500/10 text-green-400 border-green-500/20", children: "Activo" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-xl", children: [
        /* @__PURE__ */ jsxs("h3", { className: "text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(User, { className: "w-5 h-5 text-blue-500" }),
          "Información Pública"
        ] }),
        /* @__PURE__ */ jsxs("form", { onSubmit: handleProfileSave, className: "space-y-5", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5", children: "Nombre a mostrar" }),
            /* @__PURE__ */ jsx("input", { type: "text", value: profile.display_name, onChange: (e) => setProfile({ ...profile, display_name: e.target.value }), className: "w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 py-2.5 px-4 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white", placeholder: "Ej. Juan Pérez" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5", children: "URL de Foto de Perfil" }),
            /* @__PURE__ */ jsx("input", { type: "url", value: profile.avatar_url, onChange: (e) => setProfile({ ...profile, avatar_url: e.target.value }), className: "w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 py-2.5 px-4 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white", placeholder: "https://..." })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5", children: "LinkedIn" }),
              /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsx(Link, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" }),
                /* @__PURE__ */ jsx("input", { type: "text", value: profile.linkedin_url, onChange: (e) => setProfile({ ...profile, linkedin_url: e.target.value }), className: "w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 py-2.5 pl-10 pr-4 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white", placeholder: "usuario-linkedin" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5", children: "X (Twitter)" }),
              /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold", children: "@" }),
                /* @__PURE__ */ jsx("input", { type: "text", value: profile.twitter_url, onChange: (e) => setProfile({ ...profile, twitter_url: e.target.value }), className: "w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 py-2.5 pl-10 pr-4 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white", placeholder: "usuario_x" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5", children: "Biografía corta" }),
            /* @__PURE__ */ jsx("textarea", { rows: 3, value: profile.bio || "", onChange: (e) => setProfile({ ...profile, bio: e.target.value }), className: "w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 py-2.5 px-4 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white resize-none", placeholder: "Escribe algo sobre ti..." })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2", children: "Color de Guardia Personalizado" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 mb-3", children: "Este color te identificará en el Planificador de Guardias." }),
            /* @__PURE__ */ jsx("div", { className: "bg-slate-100/50 dark:bg-slate-800/40 rounded-2xl p-4 overflow-hidden border border-slate-200 dark:border-white/5", children: /* @__PURE__ */ jsx("div", { className: "flex gap-4 overflow-x-auto pb-1 snap-x items-center [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']", children: ["#94a3b8", "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#22c55e", "#14b8a6", "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6", "#d946ef", "#f43f5e"].map((color) => /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setProfile({ ...profile, custom_color: color }),
                className: `shrink-0 transition-all duration-300 ease-out snap-center focus:outline-none
                        ${profile.custom_color === color ? "w-14 h-14 rounded-[16px] shadow-lg scale-105 border-2 border-slate-900/10 dark:border-white/20" : "w-10 h-10 rounded-[12px] opacity-80 hover:opacity-100 hover:scale-110"}`,
                style: { backgroundColor: color },
                title: `Color ${color}`
              },
              color
            )) }) })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "pt-2", children: /* @__PURE__ */ jsxs("button", { type: "submit", disabled: saving, className: "flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2.5 px-6 rounded-lg font-bold transition-all disabled:opacity-50", children: [
            saving ? /* @__PURE__ */ jsx(RefreshCw, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsx(Save, { className: "w-4 h-4" }),
            "Guardar Perfil"
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-xl", children: [
          /* @__PURE__ */ jsxs("h3", { className: "text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Lock, { className: "w-5 h-5 text-blue-500" }),
            "Seguridad"
          ] }),
          /* @__PURE__ */ jsxs("form", { onSubmit: handlePasswordChange, className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5", children: "Nueva Contraseña" }),
              /* @__PURE__ */ jsx("input", { type: "password", value: newPassword, onChange: (e) => setNewPassword(e.target.value), className: "w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 py-2.5 px-4 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white", placeholder: "Min. 6 caracteres" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5", children: "Confirmar Contraseña" }),
              /* @__PURE__ */ jsx("input", { type: "password", value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), className: "w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 py-2.5 px-4 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white", placeholder: "Repite la contraseña" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "pt-2", children: /* @__PURE__ */ jsx("button", { type: "submit", disabled: saving || !newPassword, className: "bg-slate-800 hover:bg-slate-700 text-white py-2.5 px-6 rounded-lg font-bold transition-all", children: "Actualizar Contraseña" }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-8 pt-6 border-t border-slate-200 dark:border-white/10", children: [
            /* @__PURE__ */ jsxs("h4", { className: "text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(ShieldCheck, { className: "w-4 h-4 text-green-500" }),
              " Inicio Rápido (Biometría)"
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 mb-4", children: "Configura FaceID, TouchID o PIN de tu dispositivo para iniciar sin contraseña en futuras sesiones." }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: async () => {
                  setSaving(true);
                  try {
                    const enrollRes = await supabase.auth.mfa.enroll({ factorType: "webauthn" });
                    if (enrollRes.error) throw enrollRes.error;
                    if (enrollRes.data?.id) {
                      const challengeRes = await supabase.auth.mfa.challengeAndVerify({
                        factorId: enrollRes.data.id,
                        code: ""
                      });
                      if (challengeRes.error) throw challengeRes.error;
                      toast.success("¡Dispositivo biométrico vinculado con éxito!");
                    }
                  } catch (err) {
                    toast.error(err.message || "Error al conectar biometría. Verifica que el dispositivo lo soporte.");
                  } finally {
                    setSaving(false);
                  }
                },
                disabled: saving,
                className: "flex items-center gap-2 px-4 py-2 bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 font-bold rounded-lg hover:bg-blue-600/20 dark:hover:bg-blue-500/30 transition-colors text-sm disabled:opacity-50",
                children: "Activar Passkey / Huella"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-xl", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-slate-900 dark:text-white mb-4", children: "Preferencias" }),
          /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950/50 flex justify-between items-center", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-slate-900 dark:text-white", children: "Notificaciones por email" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500 dark:text-slate-400", children: "Recibe reportes semanales" })
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [
              /* @__PURE__ */ jsx("input", { type: "checkbox", className: "sr-only peer", defaultChecked: true }),
              /* @__PURE__ */ jsx("div", { className: "w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" })
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
}

function SecuritySettings() {
  const [factors, setFactors] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    loadFactors();
  }, []);
  const loadFactors = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      if (data) {
        setFactors(data.all.filter((f) => f.factor_type === "webauthn"));
      }
    } catch (err) {
      console.warn("MFA login check failed:", err);
    }
  };
  const enrollPasskey = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "webauthn"
      });
      if (error) throw error;
      if (data?.id) {
        toast.success("¡Dispositivo vinculado con éxito para acceso biométrico!");
        loadFactors();
      }
    } catch (err) {
      toast.error(err.message || "Error al registrar biometría. Asegúrate de estar en HTTPS.");
    } finally {
      setLoading(false);
    }
  };
  const unenrollFactor = async (id) => {
    if (!confirm("¿Seguro que quieres eliminar este acceso biométrico? Tendrás que usar tu contraseña la próxima vez.")) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId: id });
      if (error) throw error;
      toast.success("Acceso biométrico eliminado.");
      loadFactors();
    } catch (err) {
      toast.error(err.message || "No se pudo eliminar el acceso.");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-6 space-y-6 shadow-xl", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "p-2 bg-blue-500/20 rounded-lg", children: /* @__PURE__ */ jsx(Shield, { className: "w-5 h-5 text-blue-500" }) }),
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-slate-900 dark:text-white", children: "Seguridad Biométrica" })
    ] }),
    /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500 dark:text-slate-400", children: "Configura tu huella dactilar o FaceID para entrar al dashboard de forma segura y rápida sin escribir tu contraseña cada vez." }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      factors.length > 0 ? factors.map((f) => /* @__PURE__ */ jsxs("div", { className: "group flex items-center justify-between p-4 bg-white/50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 transition-all hover:border-blue-500/50", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "p-2 bg-green-500/10 rounded-full", children: /* @__PURE__ */ jsx(CheckCircle2, { className: "w-5 h-5 text-green-500" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-bold text-slate-900 dark:text-white", children: "Dispositivo Registrado" }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-slate-500 dark:text-slate-500 uppercase tracking-tighter", children: [
              "Status: ",
              f.status,
              " • ",
              new Date(f.created_at).toLocaleDateString()
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => unenrollFactor(f.id),
            className: "p-2 text-slate-300 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all",
            title: "Eliminar dispositivo",
            children: /* @__PURE__ */ jsx(Trash2, { className: "w-5 h-5" })
          }
        )
      ] }, f.id)) : /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-2xl", children: [
        /* @__PURE__ */ jsx(Fingerprint, { className: "w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500 dark:text-slate-400 text-center", children: "No hay dispositivos vinculados actualmente." })
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: enrollPasskey,
          disabled: loading,
          className: "group relative w-full overflow-hidden flex items-center justify-center gap-3 py-3.5 px-4 bg-slate-900 dark:bg-white hover:scale-[1.01] text-white dark:text-slate-900 rounded-xl font-bold transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-slate-900/20 dark:shadow-white/10",
          children: [
            /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity" }),
            /* @__PURE__ */ jsx(Fingerprint, { className: "w-5 h-5 relative z-10" }),
            /* @__PURE__ */ jsx("span", { className: "relative z-10", children: loading ? "Procesando..." : "Vincular huella en este equipo" })
          ]
        }
      )
    ] })
  ] });
}

const $$Profile = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, { "title": "Mi Perfil | GA4 Dashboard" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-6xl mx-auto space-y-6"> <header> <h1 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">Mi Perfil</h1> <p class="text-slate-500 dark:text-slate-400 text-sm">Gestiona tu información pública y preferencias de seguridad</p> </header> <div class="grid grid-cols-1 lg:grid-cols-2 gap-6"> ${renderComponent($$result2, "ProfileManager", ProfileManager, { "client:idle": true, "client:component-hydration": "idle", "client:component-path": "G:/Proyectos/GA4/src/components/ProfileManager", "client:component-export": "default" })} ${renderComponent($$result2, "SecuritySettings", SecuritySettings, { "client:load": true, "client:component-hydration": "load", "client:component-path": "G:/Proyectos/GA4/src/components/SecuritySettings", "client:component-export": "default" })} </div> </div> ` })}`;
}, "G:/Proyectos/GA4/src/pages/profile.astro", void 0);

const $$file = "G:/Proyectos/GA4/src/pages/profile.astro";
const $$url = "/profile";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Profile,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
