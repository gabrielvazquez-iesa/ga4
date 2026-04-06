import { c as createComponent } from './astro-component_Bi-3AwRB.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_BbtgLamP.mjs';
import { $ as $$DashboardLayout } from './DashboardLayout_jfAd883J.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { s as supabase } from './supabase_C66l0GU-.mjs';
import { Bell, Search, Calendar, Filter, Send, Users, Info, XCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { Toaster, toast } from 'sonner';

function NotificationsManager() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("history");
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;
  const [newTitle, setNewTitle] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [newType, setNewType] = useState("info");
  const [targetUser, setTargetUser] = useState("all");
  const [sending, setSending] = useState(false);
  useEffect(() => {
    fetchData();
  }, [searchQuery, dateFilter]);
  const fetchData = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const email = session.user.email || "";
    const adminStatus = ["admin@iesa.edu.ve", "gabriel.vazquez@iesa.edu.ve"].includes(email.toLowerCase());
    setIsAdmin(adminStatus);
    let query = supabase.from("system_notifications").select("*").order("created_at", { ascending: false });
    if (dateFilter) {
      const startOfDay = new Date(dateFilter);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(dateFilter);
      endOfDay.setHours(23, 59, 59, 999);
      query = query.gte("created_at", startOfDay.toISOString()).lte("created_at", endOfDay.toISOString());
    }
    const { data: notifs } = await query;
    let filtered = notifs || [];
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((n) => n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q));
    }
    setNotifications(filtered);
    if (adminStatus) {
      const { data: profiles } = await supabase.from("user_profiles").select("user_id, display_name, email");
      if (profiles) setUsers(profiles);
    }
    setLoading(false);
  };
  const handleSendNotification = async (e) => {
    e.preventDefault();
    setSending(true);
    const payload = {
      title: newTitle,
      message: newMessage,
      type: newType,
      user_id: targetUser === "all" ? null : targetUser
    };
    const { error } = await supabase.from("system_notifications").insert([payload]);
    if (error) {
      toast.error("Error al enviar la notificación.");
    } else {
      toast.success("Notificación enviada exitosamente.");
      setNewTitle("");
      setNewMessage("");
      setTargetUser("all");
      fetchData();
    }
    setSending(false);
  };
  const getIconForType = (type) => {
    switch (type) {
      case "success":
        return /* @__PURE__ */ jsx(CheckCircle, { className: "w-5 h-5 text-green-500" });
      case "warning":
        return /* @__PURE__ */ jsx(AlertTriangle, { className: "w-5 h-5 text-yellow-500" });
      case "error":
        return /* @__PURE__ */ jsx(XCircle, { className: "w-5 h-5 text-red-500" });
      default:
        return /* @__PURE__ */ jsx(Info, { className: "w-5 h-5 text-blue-500" });
    }
  };
  const totalPages = Math.ceil(notifications.length / ITEMS_PER_PAGE);
  const currentItems = notifications.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx(Toaster, { position: "top-right", richColors: true }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("h1", { className: "text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(Bell, { className: "w-8 h-8 text-blue-500" }),
          "Centro de Notificaciones"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-slate-500 mt-2", children: "Revisa alertas del sistema, cambios de guardias y comunicados." })
      ] }),
      isAdmin && /* @__PURE__ */ jsxs("div", { className: "flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setActiveTab("history"),
            className: `px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "history" ? "bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`,
            children: "Historial"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setActiveTab("send"),
            className: `px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "send" ? "bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`,
            children: "Enviar Mensaje"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-none", children: activeTab === "history" ? /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative flex-1", children: [
          /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              placeholder: "Buscar por palabra clave...",
              value: searchQuery,
              onChange: (e) => setSearchQuery(e.target.value),
              className: "w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative md:w-64", children: [
          /* @__PURE__ */ jsx(Calendar, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "date",
              value: dateFilter,
              onChange: (e) => setDateFilter(e.target.value),
              className: "w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all [color-scheme:light] dark:[color-scheme:dark]"
            }
          )
        ] })
      ] }),
      loading ? /* @__PURE__ */ jsx("div", { className: "text-center py-12 text-slate-500", children: "Cargando notificaciones..." }) : currentItems.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-12 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 border-dashed rounded-2xl", children: [
        /* @__PURE__ */ jsx(Filter, { className: "w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" }),
        /* @__PURE__ */ jsx("h3", { className: "text-slate-900 dark:text-white font-bold mb-1", children: "No hay resultados" }),
        /* @__PURE__ */ jsx("p", { className: "text-slate-500 text-sm", children: "Prueba ajustando los filtros de búsqueda o fecha." })
      ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-4", children: currentItems.map((notif) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4 p-5 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-white/5 hover:border-blue-500/30 transition-colors group", children: [
        /* @__PURE__ */ jsx("div", { className: "mt-1 shrink-0 p-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm", children: getIconForType(notif.type) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start", children: [
            /* @__PURE__ */ jsx("h4", { className: "font-bold text-slate-900 dark:text-white", children: notif.title }),
            /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-slate-400 bg-white dark:bg-slate-900 px-2 py-1 rounded-md border border-slate-200 dark:border-white/5", children: new Date(notif.created_at).toLocaleDateString() })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-slate-600 dark:text-slate-400 text-sm mt-1", children: notif.message })
        ] })
      ] }, notif.id)) }),
      totalPages > 1 && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/10", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            disabled: currentPage === 1,
            onClick: () => setCurrentPage((prev) => prev - 1),
            className: "px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors",
            children: "Anterior"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "text-sm font-bold text-slate-500", children: [
          "Página ",
          /* @__PURE__ */ jsx("span", { className: "text-slate-900 dark:text-white", children: currentPage }),
          " de ",
          totalPages
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            disabled: currentPage === totalPages,
            onClick: () => setCurrentPage((prev) => prev + 1),
            className: "px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors",
            children: "Siguiente"
          }
        )
      ] })
    ] }) : (
      /* Admin Send Tab */
      /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-center mb-8", children: [
          /* @__PURE__ */ jsx(Send, { className: "w-12 h-12 text-blue-500 mx-auto mb-4" }),
          /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-slate-900 dark:text-white", children: "Redactar Mensaje" }),
          /* @__PURE__ */ jsx("p", { className: "text-slate-500", children: "Envía alertas personalizadas o al sistema entero." })
        ] }),
        /* @__PURE__ */ jsxs("form", { onSubmit: handleSendNotification, className: "space-y-5", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-bold text-slate-900 dark:text-white mb-2", children: "Destinatario" }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(Users, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  value: targetUser,
                  onChange: (e) => setTargetUser(e.target.value),
                  className: "w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "all", children: "🌐 Todos los usuarios (Aviso Global)" }),
                    users.map((u) => /* @__PURE__ */ jsxs("option", { value: u.user_id, children: [
                      "👤 ",
                      u.display_name || u.email
                    ] }, u.user_id))
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-bold text-slate-900 dark:text-white mb-2", children: "Tipo de Aviso" }),
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: ["info", "success", "warning", "error"].map((t) => /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: () => setNewType(t),
                className: `flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${newType === t ? "border-blue-500 bg-blue-500/5" : "border-slate-200 dark:border-slate-800 hover:border-blue-500/30"}`,
                children: [
                  getIconForType(t),
                  /* @__PURE__ */ jsx("span", { className: "text-xs font-bold mt-2 capitalize text-slate-600 dark:text-slate-300", children: t })
                ]
              },
              t
            )) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-bold text-slate-900 dark:text-white mb-2", children: "Título" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                required: true,
                value: newTitle,
                onChange: (e) => setNewTitle(e.target.value),
                placeholder: "Ej: Cambio de guardia exitoso",
                className: "w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-bold text-slate-900 dark:text-white mb-2", children: "Mensaje" }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                required: true,
                rows: 4,
                value: newMessage,
                onChange: (e) => setNewMessage(e.target.value),
                placeholder: "Detalles de la notificación...",
                className: "w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "pt-4", children: /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              disabled: sending,
              className: "w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex justify-center items-center gap-2 transition-colors disabled:opacity-50",
              children: sending ? "Enviando..." : /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(Send, { className: "w-5 h-5" }),
                " Enviar Notificación"
              ] })
            }
          ) })
        ] })
      ] })
    ) })
  ] });
}

const $$Notifications = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, { "title": "Centro de Notificaciones | GA4" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"> ${renderComponent($$result2, "NotificationsManager", NotificationsManager, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/gabriel.vazquez/Desktop/Proyectos/proyecto-dashboard/ga4-dashboard/src/components/NotificationsManager", "client:component-export": "default" })} </div> ` })}`;
}, "C:/Users/gabriel.vazquez/Desktop/Proyectos/proyecto-dashboard/ga4-dashboard/src/pages/notifications.astro", void 0);

const $$file = "C:/Users/gabriel.vazquez/Desktop/Proyectos/proyecto-dashboard/ga4-dashboard/src/pages/notifications.astro";
const $$url = "/notifications";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Notifications,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
