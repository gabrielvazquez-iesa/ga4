import { c as createComponent } from './astro-component_BriL74Bn.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_BuRdzBJb.mjs';
import { $ as $$DashboardLayout } from './DashboardLayout_Q7N1qe2-.mjs';
import { jsx, jsxs } from 'react/jsx-runtime';
import { useState, useEffect, useRef } from 'react';
import { s as supabase } from './supabase_C66l0GU-.mjs';
import { ShieldCheck, Search, User, KeyRound } from 'lucide-react';
import { toast, Toaster } from 'sonner';

function UsersManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [newDept, setNewDept] = useState("");
  useEffect(() => {
    checkAdminAndFetch();
  }, []);
  const checkAdminAndFetch = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const email = session?.user?.email || "";
    const admin = ["admin@iesa.edu.ve", "gabriel.vazquez@iesa.edu.ve"].includes(email.toLowerCase());
    setIsAdmin(admin);
    if (admin) fetchUsers();
    else setLoading(false);
  };
  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("user_profiles").select("user_id, display_name, department, has_vault_access, avatar_url, is_banned").order("display_name");
    if (error) toast.error("Error al cargar los usuarios.");
    else setUsers(data || []);
    setLoading(false);
  };
  const toggleBanStatus = async (userId, current) => {
    const action = !current ? "desincorporar" : "reactivar";
    if (!window.confirm(`¿Estás seguro de que deseas ${action} a este usuario?`)) return;
    const { error } = await supabase.from("user_profiles").update({ is_banned: !current }).eq("user_id", userId);
    if (error) toast.error("Error: " + error.message);
    else {
      toast.success(`Usuario ${!current ? "desincorporado" : "reactivado"} con éxito.`);
      fetchUsers();
    }
  };
  const toggleVaultAccess = async (userId, current) => {
    const action = !current ? "conceder" : "revocar";
    if (!window.confirm(`¿Deseas ${action} el acceso a la bóveda para este usuario?`)) return;
    const { error } = await supabase.from("user_profiles").update({ has_vault_access: !current }).eq("user_id", userId);
    if (error) toast.error("Error: " + error.message);
    else {
      toast.success(`Acceso a bóveda ${!current ? "concedido" : "revocado"} correctamente.`);
      fetchUsers();
    }
  };
  const handleUpdateDept = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    const { error } = await supabase.from("user_profiles").update({ department: newDept }).eq("user_id", editingUser.user_id);
    if (error) toast.error("Error: " + error.message);
    else {
      toast.success("Departamento actualizado con éxito.");
      setEditingUser(null);
      fetchUsers();
    }
  };
  const filteredUsers = users.filter(
    (u) => (u.display_name || "").toLowerCase().includes(search.toLowerCase()) || (u.department || "").toLowerCase().includes(search.toLowerCase())
  );
  if (!loading && !isAdmin) {
    return /* @__PURE__ */ jsx("div", { className: "flex justify-center py-20", children: /* @__PURE__ */ jsxs("div", { className: "bg-red-500/10 border border-red-500/20 text-red-400 p-8 rounded-2xl max-w-md text-center", children: [
      /* @__PURE__ */ jsx(ShieldCheck, { className: "w-16 h-16 mx-auto mb-4 text-red-500/50" }),
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mb-2", children: "Acceso Denegado" }),
      /* @__PURE__ */ jsx("p", { children: "Esta sección está restringida para administradores." })
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx(Toaster, { theme: "dark", position: "top-right" }),
    /* @__PURE__ */ jsxs("div", { className: "flex bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl items-center px-4 py-2 w-full max-w-md shadow-sm", children: [
      /* @__PURE__ */ jsx(Search, { className: "w-4 h-4 text-slate-400 shrink-0 mr-3" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          placeholder: "Buscar por nombre o departamento...",
          value: search,
          onChange: (e) => setSearch(e.target.value),
          className: "bg-transparent outline-none text-sm text-slate-900 dark:text-white placeholder-slate-500 w-full"
        }
      )
    ] }),
    loading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center p-12", children: /* @__PURE__ */ jsx("div", { className: "w-8 h-8 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin" }) }) : filteredUsers.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-16 text-slate-500", children: [
      /* @__PURE__ */ jsx(User, { className: "w-12 h-12 mx-auto mb-3 opacity-20" }),
      /* @__PURE__ */ jsx("p", { children: search ? "No se encontraron usuarios." : "No hay perfiles registrados." })
    ] }) : /* @__PURE__ */ jsxs("div", { className: "bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-xl", children: [
      /* @__PURE__ */ jsxs("table", { className: "w-full text-left border-collapse", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-white/5 text-xs font-bold text-slate-500 uppercase tracking-wider", children: [
          /* @__PURE__ */ jsx("th", { className: "py-3 px-6 w-1/3", children: "Usuario" }),
          /* @__PURE__ */ jsx("th", { className: "py-3 px-6 w-1/4", children: "Departamento" }),
          /* @__PURE__ */ jsx("th", { className: "py-3 px-6 text-center w-24", children: "Bóveda" }),
          /* @__PURE__ */ jsx("th", { className: "py-3 px-6 text-center w-32", children: "Acciones" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-slate-200 dark:divide-white/5", children: filteredUsers.map((user) => /* @__PURE__ */ jsxs("tr", { className: `hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${user.is_banned ? "opacity-50" : ""}`, children: [
          /* @__PURE__ */ jsx("td", { className: "py-4 px-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "w-9 h-9 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 overflow-hidden", children: user.avatar_url ? /* @__PURE__ */ jsx("img", { src: user.avatar_url, alt: "", className: "w-full h-full object-cover" }) : /* @__PURE__ */ jsx(User, { className: "w-4 h-4 text-blue-400" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-semibold text-slate-900 dark:text-white text-sm", children: user.display_name || "Sin nombre" }),
              user.is_banned && /* @__PURE__ */ jsx("span", { className: "text-[10px] text-red-400 font-bold uppercase", children: "Desincorporado" })
            ] })
          ] }) }),
          /* @__PURE__ */ jsx("td", { className: "py-4 px-6", children: /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => {
                setEditingUser(user);
                setNewDept(user.department || "");
              },
              className: "px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors",
              children: user.department || "Sin Dept."
            }
          ) }),
          /* @__PURE__ */ jsx("td", { className: "py-4 px-6 text-center", children: /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => toggleVaultAccess(user.user_id, user.has_vault_access),
              title: user.has_vault_access ? "Revocar acceso" : "Dar acceso a bóveda",
              className: `inline-flex items-center justify-center p-2 rounded-lg transition-all ${user.has_vault_access ? "bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/20" : "bg-slate-100 dark:bg-white/5 text-slate-400 border border-slate-200 dark:border-white/10 hover:text-slate-600"}`,
              children: /* @__PURE__ */ jsx(KeyRound, { className: "w-4 h-4" })
            }
          ) }),
          /* @__PURE__ */ jsx("td", { className: "py-4 px-6 text-center", children: /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => toggleBanStatus(user.user_id, user.is_banned),
              className: `text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${user.is_banned ? "bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20" : "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"}`,
              children: user.is_banned ? "Reactivar" : "Desincorporar"
            }
          ) })
        ] }, user.user_id)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "px-6 py-3 bg-slate-50 dark:bg-slate-950/30 border-t border-slate-200 dark:border-white/5 text-xs text-slate-500", children: [
        filteredUsers.length,
        " usuario",
        filteredUsers.length !== 1 ? "s" : "",
        " registrado",
        filteredUsers.length !== 1 ? "s" : ""
      ] })
    ] }),
    editingUser && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleUpdateDept, className: "bg-white dark:bg-slate-950 border dark:border-white/10 w-full max-w-sm rounded-[2rem] p-8 shadow-2xl relative", children: [
      /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setEditingUser(null), className: "absolute top-6 right-6 text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-white/5 w-8 h-8 rounded-full flex items-center justify-center", children: "✕" }),
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold mb-6 text-slate-900 dark:text-white text-center", children: "Editar Departamento" }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-slate-500 mb-6 text-center", children: [
        "Asignar área para: ",
        /* @__PURE__ */ jsx("b", { children: editingUser.display_name })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mb-6", children: /* @__PURE__ */ jsx(
        CustomSelect,
        {
          value: newDept,
          onChange: (v) => setNewDept(v),
          placeholder: "Seleccionar departamento...",
          options: ["Mercadeo", "Comunicaciones", "Tecnología", "Ventas", "Innovación", "Incompany", "RRHH"].map((d) => ({ value: d, label: d }))
        }
      ) }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setEditingUser(null), className: "flex-1 py-3.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-all", children: "Cancelar" }),
        /* @__PURE__ */ jsx("button", { type: "submit", className: "flex-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-blue-500/20", children: "Guardar" })
      ] })
    ] }) })
  ] });
}
function CustomSelect({ value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = options.find((o) => o.value === value);
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  return /* @__PURE__ */ jsxs("div", { ref, className: "relative", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        onClick: () => setOpen(!open),
        className: "w-full flex items-center justify-between bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 py-3 px-4 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all cursor-pointer",
        children: [
          /* @__PURE__ */ jsx("span", { className: selected ? "" : "text-slate-400", children: selected?.label || placeholder || "Seleccionar..." }),
          /* @__PURE__ */ jsx("svg", { className: `w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M19 9l-7 7-7-7" }) })
        ]
      }
    ),
    open && /* @__PURE__ */ jsxs("div", { className: "absolute z-50 w-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto", children: [
      placeholder && /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => {
            onChange("");
            setOpen(false);
          },
          className: "w-full text-left px-4 py-2.5 text-sm text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors",
          children: placeholder
        }
      ),
      options.map((o) => /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => {
            onChange(o.value);
            setOpen(false);
          },
          className: `w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer ${o.value === value ? "bg-blue-600/10 text-blue-500 font-semibold cursor-default" : "text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5"}`,
          children: o.label
        },
        o.value
      ))
    ] })
  ] });
}

const $$Users = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, { "title": "Gestión de Usuarios | GA4" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-7xl mx-auto space-y-6"> <header> <h1 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">Directorio de Usuarios</h1> <p class="text-slate-500 dark:text-slate-400 text-sm">Gestiona el acceso y visualiza a todos los miembros registrados en la plataforma.</p> </header> ${renderComponent($$result2, "UsersManager", UsersManager, { "client:idle": true, "client:component-hydration": "idle", "client:component-path": "G:/Proyectos/GA4/src/components/UsersManager", "client:component-export": "default" })} </div> ` })}`;
}, "G:/Proyectos/GA4/src/pages/users.astro", void 0);

const $$file = "G:/Proyectos/GA4/src/pages/users.astro";
const $$url = "/users";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Users,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
