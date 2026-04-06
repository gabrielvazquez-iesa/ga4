import { c as createComponent } from './astro-component_CCwRo9GX.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_Bgf5ToQF.mjs';
import { $ as $$DashboardLayout } from './DashboardLayout_B4a3eXfo.mjs';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { s as supabase } from './supabase_C66l0GU-.mjs';
import { ShieldCheck, ShieldAlert, Shield, Search, LayoutGrid, List, Plus, AlertCircle, KeyRound, EyeOff, Eye, RefreshCw, Edit2, Trash2, User, ExternalLink } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription, e as DialogFooter, B as Button } from './button_BIqSC7kq.mjs';

function VaultManager() {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [search, setSearch] = useState("");
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [viewMode, setViewMode] = useState("grid");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    service_name: "",
    username: "",
    password_hash: "",
    url: "",
    notes: ""
  });
  useEffect(() => {
    checkUserAndFetch();
  }, []);
  const checkUserAndFetch = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        setLoading(false);
        return;
      }
      const email = user.email || "";
      const adminEmails = ["admin@iesa.edu.ve", "gabriel.vazquez@iesa.edu.ve"];
      const isSystemAdmin = adminEmails.includes(email.toLowerCase());
      setIsAdmin(isSystemAdmin);
      const { data: profile } = await supabase.from("user_profiles").select("*").eq("user_id", user.id).single();
      setUserProfile(profile);
      const canAccess = isSystemAdmin || ["Mercadeo", "Comunicaciones"].includes(profile?.department) || profile?.has_vault_access === true;
      setHasAccess(canAccess);
      if (canAccess) {
        await fetchCredentials();
      }
    } catch (error) {
      console.error("Error in checkUserAndFetch:", error);
    } finally {
      setLoading(false);
    }
  };
  const fetchCredentials = async () => {
    try {
      const { data, error } = await supabase.from("vault_credentials").select("*").order("created_at", { ascending: false });
      if (error) {
        if (error.code === "42P01") {
          toast.error("La tabla vault_credentials no existe. Ejecuta el nuevo script SQL.");
        } else {
          throw error;
        }
      } else {
        setCredentials(data || []);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar las credenciales.");
    }
  };
  const filteredCredentials = credentials.filter((c) => {
    const matchesSearch = c.service_name.toLowerCase().includes(search.toLowerCase()) || c.username.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (showDeleted ? c.is_deleted : !c.is_deleted);
  });
  const togglePasswordVisibility = (id) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  const submitForm = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error("Solo los administradores pueden gestionar la bóveda.");
      return;
    }
    try {
      if (editingId) {
        const { error } = await supabase.from("vault_credentials").update(formData).eq("id", editingId);
        if (error) throw error;
        toast.success("Credencial actualizada.");
      } else {
        const { error } = await supabase.from("vault_credentials").insert([{ ...formData, is_deleted: false }]);
        if (error) throw error;
        toast.success("Nueva credencial guardada con éxito.");
      }
      setIsModalOpen(false);
      resetForm();
      fetchCredentials();
    } catch (error) {
      toast.error("Error: " + error.message);
    }
  };
  const resetForm = () => {
    setFormData({ service_name: "", username: "", password_hash: "", url: "", notes: "" });
    setEditingId(null);
  };
  const handleEdit = (cred) => {
    setFormData({
      service_name: cred.service_name,
      username: cred.username,
      password_hash: cred.password_hash,
      url: cred.url || "",
      notes: cred.notes || ""
    });
    setEditingId(cred.id);
    setIsModalOpen(true);
  };
  const handleSoftDelete = async (id) => {
    if (!isAdmin) return;
    try {
      const { error } = await supabase.from("vault_credentials").update({ is_deleted: true }).eq("id", id);
      if (error) throw error;
      toast.info("Credencial enviada a la papelera.");
      fetchCredentials();
    } catch (error) {
      toast.error("Error: " + (error.message || "No se pudo eliminar."));
    }
  };
  const handleRestore = async (id) => {
    if (!isAdmin) return;
    try {
      const { error } = await supabase.from("vault_credentials").update({ is_deleted: false }).eq("id", id);
      if (error) throw error;
      toast.success("Credencial restaurada.");
      fetchCredentials();
    } catch (error) {
      toast.error("Error: " + (error.message || "No se pudo restaurar."));
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "flex justify-center p-20 items-center min-h-[400px]", children: /* @__PURE__ */ jsx("div", { className: "w-10 h-10 border-4 border-slate-300 dark:border-slate-800 border-t-blue-500 rounded-full animate-spin" }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx(Toaster, { theme: "dark", position: "top-right" }),
    /* @__PURE__ */ jsxs("div", { className: `p-4 rounded-xl border flex flex-col md:flex-row items-center gap-4 transition-all ${hasAccess ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"}`, children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 shrink-0", children: [
        hasAccess ? /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400", children: /* @__PURE__ */ jsx(ShieldCheck, { className: "w-6 h-6" }) }) : /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400", children: /* @__PURE__ */ jsx(ShieldAlert, { className: "w-6 h-6" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "font-bold text-sm dark:text-white uppercase tracking-wider", children: hasAccess ? "Acceso Autorizado" : "Acceso Restringido" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 dark:text-slate-400", children: hasAccess ? `Identificado como parte de ${userProfile?.department || "Administración"}` : "No tienes permisos para ver esta bóveda. Contacta al administrador." })
        ] })
      ] }),
      hasAccess && /* @__PURE__ */ jsx("div", { className: "flex-1 text-right", children: /* @__PURE__ */ jsx("span", { className: "text-[10px] text-green-500/80 font-bold uppercase tracking-widest bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20", children: "Seguridad por Rol Activa" }) })
    ] }),
    !hasAccess ? /* @__PURE__ */ jsxs("div", { className: "text-center py-20 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5", children: [
      /* @__PURE__ */ jsx(Shield, { className: "w-16 h-16 text-slate-500 mx-auto mb-4 opacity-20" }),
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold dark:text-white", children: "Bóveda Bloqueada" }),
      /* @__PURE__ */ jsx("p", { className: "text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto", children: "Solo los departamentos de Mercadeo, Comunicaciones y Administradores tienen acceso a estas credenciales." })
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row justify-between gap-4 items-center bg-white/80 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-white/5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 rounded-lg items-center px-4 py-2.5 w-full md:w-96 focus-within:border-blue-500/50 transition-colors", children: [
          /* @__PURE__ */ jsx(Search, { className: "w-4 h-4 text-slate-500 shrink-0" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              placeholder: "Buscar por servicio o usuario...",
              value: search,
              onChange: (e) => setSearch(e.target.value),
              className: "bg-transparent border-none outline-none text-sm text-slate-900 dark:text-white placeholder-slate-500 ml-2 w-full"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3 w-full md:w-auto", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-1 rounded-lg", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setViewMode("grid"),
                className: `p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-slate-700 text-white" : "text-slate-500 hover:text-slate-900 dark:text-white"}`,
                title: "Vista en Celdas",
                children: /* @__PURE__ */ jsx(LayoutGrid, { className: "w-4 h-4" })
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setViewMode("list"),
                className: `p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-slate-700 text-white" : "text-slate-500 hover:text-slate-900 dark:text-white"}`,
                title: "Vista en Lista",
                children: /* @__PURE__ */ jsx(List, { className: "w-4 h-4" })
              }
            )
          ] }),
          isAdmin && /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setShowDeleted(!showDeleted),
              className: `px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border ${showDeleted ? "bg-indigo-600 border-indigo-500 text-white" : "bg-slate-800 border-slate-200 dark:border-white/10 text-slate-300 hover:bg-slate-700"}`,
              children: showDeleted ? "Ver Activas" : "Ver Papelera"
            }
          ),
          isAdmin && !showDeleted && /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => {
                resetForm();
                setIsModalOpen(true);
              },
              className: "flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)]",
              children: [
                /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
                "Nueva Credencial"
              ]
            }
          )
        ] })
      ] }),
      !isAdmin && /* @__PURE__ */ jsxs("div", { className: "bg-blue-500/10 border border-blue-500/20 text-blue-400 p-4 rounded-xl flex gap-3 text-sm", children: [
        /* @__PURE__ */ jsx(AlertCircle, { className: "w-5 h-5 shrink-0" }),
        /* @__PURE__ */ jsx("p", { children: "Estás en modo visualizador. Solo administradores pueden gestionar las credenciales." })
      ] }),
      filteredCredentials.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-20 px-4 bg-white dark:bg-slate-900/30 rounded-2xl border border-slate-200 dark:border-white/5 border-dashed", children: [
        /* @__PURE__ */ jsx(KeyRound, { className: "w-12 h-12 text-slate-600 mx-auto mb-4" }),
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium text-slate-900 dark:text-white mb-1", children: "Bóveda vacía" }),
        /* @__PURE__ */ jsx("p", { className: "text-slate-500 dark:text-slate-400 text-sm", children: "No hay nada que mostrar aquí." })
      ] }) : /* @__PURE__ */ jsx(Fragment, { children: viewMode === "list" ? /* @__PURE__ */ jsx("div", { className: "bg-white/95 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-left border-collapse", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider", children: [
          /* @__PURE__ */ jsx("th", { className: "p-4 border-b border-slate-200 dark:border-white/5 font-semibold", children: "Servicio" }),
          /* @__PURE__ */ jsx("th", { className: "p-4 border-b border-slate-200 dark:border-white/5 font-semibold", children: "Usuario" }),
          /* @__PURE__ */ jsx("th", { className: "p-4 border-b border-slate-200 dark:border-white/5 font-semibold", children: "Contraseña" }),
          /* @__PURE__ */ jsx("th", { className: "p-4 border-b border-slate-200 dark:border-white/5 font-semibold text-right", children: "Acciones" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-slate-200 dark:divide-white/5 text-sm", children: filteredCredentials.map((cred) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group", children: [
          /* @__PURE__ */ jsx("td", { className: "p-4 border-r border-slate-200 dark:border-white/5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0", children: /* @__PURE__ */ jsx(KeyRound, { className: "w-4 h-4" }) }),
            /* @__PURE__ */ jsx("p", { className: "font-bold text-slate-900 dark:text-white", children: cred.service_name })
          ] }) }),
          /* @__PURE__ */ jsx("td", { className: "p-4 border-r border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300", children: cred.username }),
          /* @__PURE__ */ jsx("td", { className: "p-4 border-r border-slate-200 dark:border-white/5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: `font-mono transition-all ${visiblePasswords[cred.id] ? "text-blue-400" : "text-slate-500"}`, children: visiblePasswords[cred.id] ? cred.password_hash : "••••••••" }),
            /* @__PURE__ */ jsx("button", { onClick: () => togglePasswordVisibility(cred.id), className: "text-slate-500 hover:text-slate-900 dark:text-white transition-colors", children: visiblePasswords[cred.id] ? /* @__PURE__ */ jsx(EyeOff, { className: "w-3.5 h-3.5" }) : /* @__PURE__ */ jsx(Eye, { className: "w-3.5 h-3.5" }) })
          ] }) }),
          /* @__PURE__ */ jsx("td", { className: "p-4 text-right", children: isAdmin && /* @__PURE__ */ jsx("div", { className: "flex justify-end gap-2", children: showDeleted ? /* @__PURE__ */ jsx("button", { onClick: () => handleRestore(cred.id), className: "text-green-400 p-1 hover:bg-green-500/10 rounded", children: /* @__PURE__ */ jsx(RefreshCw, { className: "w-4 h-4" }) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("button", { onClick: () => handleEdit(cred), className: "text-blue-400 p-1 hover:bg-blue-500/10 rounded", children: /* @__PURE__ */ jsx(Edit2, { className: "w-4 h-4" }) }),
            /* @__PURE__ */ jsx("button", { onClick: () => handleSoftDelete(cred.id), className: "text-red-400 p-1 hover:bg-red-500/10 rounded", children: /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4" }) })
          ] }) }) })
        ] }, cred.id)) })
      ] }) }) }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6", children: filteredCredentials.map((cred) => /* @__PURE__ */ jsxs("div", { className: "bg-white/95 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 p-6 rounded-2xl backdrop-blur-sm shadow-xl hover:border-white/20 transition-colors group relative flex flex-col", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start mb-4", children: [
          /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400", children: /* @__PURE__ */ jsx(KeyRound, { className: "w-5 h-5" }) }),
          /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold text-slate-900 dark:text-white flex-1 ml-4", children: cred.service_name })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-3 mb-6 flex-1", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-[10px] text-slate-500 font-bold uppercase tracking-widest", children: "Usuario" }),
            /* @__PURE__ */ jsx("p", { className: "text-slate-900 dark:text-white text-sm truncate", children: cred.username })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-[10px] text-slate-500 font-bold uppercase tracking-widest", children: "Contraseña" }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 bg-slate-100 dark:bg-white/5 p-2 rounded-lg mt-1", children: [
              /* @__PURE__ */ jsx("span", { className: "font-mono text-xs flex-1 truncate", children: visiblePasswords[cred.id] ? cred.password_hash : "••••••••••••" }),
              /* @__PURE__ */ jsx("button", { onClick: () => togglePasswordVisibility(cred.id), className: "text-slate-500", children: visiblePasswords[cred.id] ? /* @__PURE__ */ jsx(EyeOff, { className: "w-3.5 h-3.5" }) : /* @__PURE__ */ jsx(Eye, { className: "w-3.5 h-3.5" }) })
            ] })
          ] })
        ] }),
        isAdmin && /* @__PURE__ */ jsxs("div", { className: "border-t border-slate-200 dark:border-white/5 pt-4 flex justify-end gap-2", children: [
          /* @__PURE__ */ jsx("button", { onClick: () => handleEdit(cred), className: "p-2 text-slate-400 hover:text-blue-400 transition-colors", children: /* @__PURE__ */ jsx(Edit2, { className: "w-4 h-4" }) }),
          /* @__PURE__ */ jsx("button", { onClick: () => handleSoftDelete(cred.id), className: "p-2 text-slate-400 hover:text-red-400 transition-colors", children: /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4" }) })
        ] })
      ] }, cred.id)) }) })
    ] }),
    /* @__PURE__ */ jsx(Dialog, { open: isModalOpen, onOpenChange: setIsModalOpen, children: /* @__PURE__ */ jsxs(DialogContent, { className: "sm:max-w-xl bg-slate-50 dark:bg-[#0d1425] border-slate-200 dark:border-white/10 rounded-2xl", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxs(DialogTitle, { className: "text-xl font-bold dark:text-white flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(KeyRound, { className: "w-5 h-5 text-blue-500" }),
          editingId ? "Editar Credencial" : "Nueva Credencial"
        ] }),
        /* @__PURE__ */ jsx(DialogDescription, { children: "Todos los campos marcados con * son requeridos." })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: submitForm, className: "space-y-4 pt-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest", children: "Servicio *" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx("div", { className: "absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500", children: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
              /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "10" }),
              /* @__PURE__ */ jsx("path", { d: "M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" })
            ] }) }),
            /* @__PURE__ */ jsx(
              "input",
              {
                required: true,
                type: "text",
                placeholder: "Instagram, Twitter, HubSpot...",
                value: formData.service_name,
                onChange: (e) => setFormData({ ...formData, service_name: e.target.value }),
                className: "w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 py-2.5 pl-10 pr-4 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none text-slate-900 dark:text-white text-sm placeholder:text-slate-400"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest", children: "Usuario / Correo *" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(User, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                required: true,
                type: "text",
                placeholder: "usuario@iesa.edu.ve",
                value: formData.username,
                onChange: (e) => setFormData({ ...formData, username: e.target.value }),
                className: "w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 py-2.5 pl-10 pr-4 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none text-slate-900 dark:text-white text-sm placeholder:text-slate-400"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          PasswordField,
          {
            value: formData.password_hash,
            onChange: (val) => setFormData({ ...formData, password_hash: val })
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest", children: "URL del Servicio" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(ExternalLink, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "url",
                placeholder: "https://...",
                value: formData.url,
                onChange: (e) => setFormData({ ...formData, url: e.target.value }),
                className: "w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 py-2.5 pl-10 pr-4 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none text-slate-900 dark:text-white text-sm placeholder:text-slate-400"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest", children: "Notas" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              rows: 2,
              placeholder: "Observaciones adicionales...",
              value: formData.notes,
              onChange: (e) => setFormData({ ...formData, notes: e.target.value }),
              className: "w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 py-2.5 px-4 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none text-slate-900 dark:text-white text-sm placeholder:text-slate-400 resize-none"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs(DialogFooter, { className: "pt-2", children: [
          /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", onClick: () => setIsModalOpen(false), className: "w-full sm:w-auto", children: "Cancelar" }),
          /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white", children: editingId ? "Guardar Cambios" : "Guardar Credencial" })
        ] })
      ] })
    ] }) })
  ] });
}
function PasswordField({ value, onChange }) {
  const [show, setShow] = useState(false);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest", children: "Contraseña *" }),
    /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsx(KeyRound, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          required: true,
          type: show ? "text" : "password",
          placeholder: "••••••••••••",
          value,
          onChange: (e) => onChange(e.target.value),
          className: "w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 py-3 pl-10 pr-11 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none text-slate-900 dark:text-white text-sm placeholder:text-slate-400 transition-all font-mono tracking-wider"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => setShow(!show),
          className: "absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors",
          tabIndex: -1,
          children: show ? /* @__PURE__ */ jsx(EyeOff, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(Eye, { className: "w-4 h-4" })
        }
      )
    ] })
  ] });
}

const $$Vault = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, { "title": "Bóveda de Contraseñas | GA4" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-7xl mx-auto space-y-6"> <header> <h1 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">Bóveda de Credenciales</h1> <p class="text-slate-500 dark:text-slate-400 text-sm">Gestiona de forma segura los accesos a los distintos servicios relacionados al proyecto.</p> </header> ${renderComponent($$result2, "VaultManager", VaultManager, { "client:idle": true, "client:component-hydration": "idle", "client:component-path": "C:/Users/gabriel.vazquez/Desktop/Proyectos/proyecto-dashboard/ga4-dashboard/src/components/VaultManager", "client:component-export": "default" })} </div> ` })}`;
}, "C:/Users/gabriel.vazquez/Desktop/Proyectos/proyecto-dashboard/ga4-dashboard/src/pages/vault.astro", void 0);

const $$file = "C:/Users/gabriel.vazquez/Desktop/Proyectos/proyecto-dashboard/ga4-dashboard/src/pages/vault.astro";
const $$url = "/vault";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Vault,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
