import { c as createComponent } from './astro-component_BriL74Bn.mjs';
import 'piccolore';
import { r as renderTemplate, n as renderSlot, l as renderComponent, o as renderHead } from './entrypoint_BuRdzBJb.mjs';
import { r as renderScript, $ as $$ClientRouter } from './global_C9DfsaNq.mjs';
import { jsxs, Fragment, jsx } from 'react/jsx-runtime';
import { ChevronRight, ChevronLeft, LayoutDashboard, BarChart3, Calendar, Instagram, Bell, KeyRound, BookOpen, LogOut, X, LayoutGrid, User, FileSpreadsheet, Sun, Moon, Search, Check, Trash2 } from 'lucide-react';
import { s as supabase } from './supabase_C66l0GU-.mjs';
import { useState, useEffect, useRef } from 'react';

function Sidebar({ currentPath }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [customColor, setCustomColor] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  useEffect(() => {
    const storedState = localStorage.getItem("sidebar_collapsed");
    if (storedState) setIsCollapsed(storedState === "true");
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      if (user) {
        setIsAdmin(["admin@iesa.edu.ve", "gabriel.vazquez@iesa.edu.ve"].includes((user.email || "").toLowerCase()));
        supabase.from("user_profiles").select("custom_color").eq("user_id", user.id).maybeSingle().then((res) => {
          if (res.data?.custom_color) setCustomColor(res.data.custom_color);
        });
      }
    });
  }, []);
  useEffect(() => {
    const mainWrapper = document.getElementById("main-content");
    if (mainWrapper) {
      if (isCollapsed) {
        mainWrapper.classList.remove("md:pl-64");
        mainWrapper.classList.add("md:pl-20");
      } else {
        mainWrapper.classList.remove("md:pl-20");
        mainWrapper.classList.add("md:pl-64");
      }
    }
  }, [isCollapsed]);
  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebar_collapsed", String(newState));
  };
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };
  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Analítica GA4", path: "/analytics", icon: BarChart3 },
    { name: "Planificador", path: "/duty", icon: Calendar },
    { name: "Redes Sociales", path: "/social-reports", icon: Instagram },
    { name: "Notificaciones", path: "/notifications", icon: Bell },
    { name: "Bóveda", path: "/vault", icon: KeyRound },
    { name: "Manuales", path: "/manuales", icon: BookOpen }
  ];
  if (isAdmin) {
    menuItems.push({ name: "Usuarios", path: "/users", icon: User });
    menuItems.push({ name: "Reporte Gerencial", path: "/reporte-mensual", icon: FileSpreadsheet });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("aside", { className: `fixed inset-y-0 left-0 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-white/5 hidden md:flex flex-col text-slate-600 dark:text-slate-300 z-40 transition-all duration-300 ease-in-out ${isCollapsed ? "w-20" : "w-64"}`, children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: toggleSidebar,
          className: "absolute -right-3.5 top-24 w-7 h-7 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white shadow-md z-50 transition-colors group",
          children: [
            isCollapsed ? /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(ChevronLeft, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsxs("div", { className: "absolute left-full ml-4 px-3 py-1.5 bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap shadow-xl border border-white/10 flex items-center pointer-events-none", children: [
              /* @__PURE__ */ jsx("div", { className: "absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 dark:bg-slate-800 rotate-45 border-l border-b border-white/10" }),
              isCollapsed ? "Desplegar panel" : "Contraer panel"
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: `p-6 flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`, children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white shadow-lg overflow-hidden shrink-0 transition-colors",
            style: customColor ? { backgroundColor: customColor } : { backgroundImage: "linear-gradient(to bottom right, #3b82f6, #9333ea)" },
            children: "GA"
          }
        ),
        !isCollapsed && /* @__PURE__ */ jsx("span", { className: "text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 truncate", children: "GA4Dash" })
      ] }),
      /* @__PURE__ */ jsx("nav", { className: "flex-1 px-4 py-8 space-y-2 overflow-visible", children: menuItems.map((item) => {
        const path = currentPath || "";
        const isActive = path === item.path || path.startsWith(item.path + "/");
        return /* @__PURE__ */ jsxs(
          "a",
          {
            href: item.path,
            title: isCollapsed ? void 0 : void 0,
            className: `group relative flex items-center gap-3 py-3 rounded-xl transition-all font-medium ${isCollapsed ? "justify-center px-0" : "px-4"} ${isActive ? "bg-blue-600/10 text-blue-500 dark:text-blue-400 border border-blue-500/20 shadow-sm" : "hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:text-white border border-transparent"}`,
            children: [
              /* @__PURE__ */ jsx(item.icon, { className: `w-5 h-5 shrink-0 ${isActive ? "text-blue-500 dark:text-blue-400" : "text-slate-500"}` }),
              !isCollapsed && /* @__PURE__ */ jsx("span", { className: "truncate", children: item.name }),
              isCollapsed && /* @__PURE__ */ jsxs("div", { className: "absolute left-full ml-4 px-3 py-2 bg-slate-900 dark:bg-slate-800 text-white text-sm font-semibold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap shadow-xl border border-white/10 flex items-center", children: [
                /* @__PURE__ */ jsx("div", { className: "absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-900 dark:bg-slate-800 rotate-45 border-l border-b border-white/10" }),
                item.name
              ] })
            ]
          },
          item.path
        );
      }) }),
      /* @__PURE__ */ jsx("div", { className: "p-4 border-t border-slate-200 dark:border-white/5 space-y-2 flex flex-col items-center", children: /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: handleLogout,
          className: `group relative flex items-center w-full rounded-xl text-slate-500 dark:text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors font-medium py-3 ${isCollapsed ? "justify-center px-0" : "gap-3 px-4"}`,
          children: [
            /* @__PURE__ */ jsx(LogOut, { className: "w-5 h-5 shrink-0" }),
            !isCollapsed && /* @__PURE__ */ jsx("span", { className: "truncate", children: "Cerrar sesión" }),
            isCollapsed && /* @__PURE__ */ jsxs("div", { className: "absolute left-full ml-4 px-3 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap shadow-xl flex items-center", children: [
              /* @__PURE__ */ jsx("div", { className: "absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-600 rotate-45" }),
              "Cerrar sesión"
            ] })
          ]
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxs("nav", { className: "md:hidden fixed bottom-4 left-4 right-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] rounded-[2rem] p-2 flex items-center justify-between z-50 transition-all duration-300", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsx("a", { href: "/analytics", className: `p-3 rounded-full transition-colors ${currentPath === "/analytics" ? "bg-blue-500/20 text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-white/10"}`, children: /* @__PURE__ */ jsx(BarChart3, { className: "w-5 h-5" }) }),
        /* @__PURE__ */ jsx("a", { href: "/social-reports", className: `p-3 rounded-full transition-colors ${currentPath === "/social-reports" ? "bg-blue-500/20 text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-white/10"}`, children: /* @__PURE__ */ jsx(Instagram, { className: "w-5 h-5" }) })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setIsMobileMenuOpen(!isMobileMenuOpen),
          className: "relative group flex items-center justify-center p-4 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full shadow-lg shadow-blue-500/30 transform transition-transform active:scale-95",
          children: isMobileMenuOpen ? /* @__PURE__ */ jsx(X, { className: "w-6 h-6" }) : /* @__PURE__ */ jsx(LayoutGrid, { className: "w-6 h-6" })
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsx("a", { href: "/vault", className: `p-3 rounded-full transition-colors ${currentPath === "/vault" ? "bg-blue-500/20 text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-white/10"}`, children: /* @__PURE__ */ jsx(KeyRound, { className: "w-5 h-5" }) }),
        /* @__PURE__ */ jsx("button", { onClick: handleLogout, className: "p-3 text-slate-600 dark:text-slate-300 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors", children: /* @__PURE__ */ jsx(LogOut, { className: "w-5 h-5" }) })
      ] })
    ] }),
    isMobileMenuOpen && /* @__PURE__ */ jsx("div", { className: "md:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm transition-opacity", onClick: () => setIsMobileMenuOpen(false), children: /* @__PURE__ */ jsxs(
      "div",
      {
        className: "absolute bottom-24 left-4 right-4 bg-white/70 dark:bg-[#0f172a]/70 backdrop-blur-2xl border border-white/50 dark:border-white/10 p-6 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] animate-in slide-in-from-bottom-8 fade-in duration-300",
        onClick: (e) => e.stopPropagation(),
        children: [
          /* @__PURE__ */ jsx("h3", { className: "text-xs font-bold text-slate-500 uppercase tracking-widest mb-4", children: "Todas las aplicaciones" }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-4 gap-y-6 gap-x-2", children: menuItems.map((item) => {
            const isActive = currentPath === item.path || currentPath.startsWith(item.path + "/");
            return /* @__PURE__ */ jsxs("a", { href: item.path, onClick: () => setIsMobileMenuOpen(false), className: "flex flex-col items-center gap-2 group", children: [
              /* @__PURE__ */ jsx("div", { className: `w-14 h-14 flex items-center justify-center rounded-2xl transition-all ${isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" : "bg-slate-100/50 dark:bg-white/5 text-slate-600 dark:text-slate-300 group-hover:bg-blue-50 dark:group-hover:bg-white/10"}`, children: /* @__PURE__ */ jsx(item.icon, { className: "w-6 h-6" }) }),
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-center leading-tight dark:text-slate-300", children: item.name })
            ] }, item.path);
          }) })
        ]
      }
    ) })
  ] });
}

function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
    const handlePageLoad = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    document.addEventListener("astro:page-load", handlePageLoad);
    return () => document.removeEventListener("astro:page-load", handlePageLoad);
  }, []);
  const toggle = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };
  return /* @__PURE__ */ jsx(
    "button",
    {
      onClick: toggle,
      className: "p-2.5 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all focus:outline-none border border-transparent hover:border-slate-200 dark:hover:border-white/10",
      title: isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro",
      children: isDark ? /* @__PURE__ */ jsx(Sun, { className: "w-5 h-5" }) : /* @__PURE__ */ jsx(Moon, { className: "w-5 h-5" })
    }
  );
}

function Topbar() {
  const [userEmail, setUserEmail] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [onDuty, setOnDuty] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchableRoutes = [
    { name: "Dashboard Principal", path: "/dashboard", keywords: ["inicio", "home", "principal", "general"] },
    { name: "Analítica GA4 (Web)", path: "/analytics", keywords: ["reportes", "analitica", "google", "visitas", "trafico", "estadisticas"] },
    { name: "Redes Sociales", path: "/social-reports", keywords: ["instagram", "metricas", "social", "seguidores", "engagement"] },
    { name: "Bóveda de Accesos", path: "/vault", keywords: ["claves", "passwords", "accesos", "boveda", "secretos"] },
    { name: "Planificador de Guardias", path: "/duty", keywords: ["guardias", "calendario", "planificador", "turnos", "fechas"] },
    { name: "Gestión de Usuarios", path: "/users", keywords: ["usuarios", "admin", "cuentas", "permisos", "roster"] },
    { name: "Mi Perfil", path: "/profile", keywords: ["perfil", "avatar", "configuracion", "ajustes", "contraseña"] },
    { name: "Centro de Notificaciones", path: "/notifications", keywords: ["notificaciones", "alertas", "mensajes", "avisos"] }
  ];
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const user = data.session?.user;
      if (!user) return;
      setUserEmail(user.email || "Usuario");
      const { data: profile } = await supabase.from("user_profiles").select("avatar_url").eq("user_id", user.id).maybeSingle();
      if (profile?.avatar_url) setAvatarUrl(profile.avatar_url);
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const { data: activeShift } = await supabase.from("duty_shifts").select("id").eq("user_id", user.id).lte("start_date", now).gte("end_date", now).maybeSingle();
      setOnDuty(!!activeShift);
      const { data: notifs } = await supabase.from("system_notifications").select("*").order("created_at", { ascending: false }).limit(10);
      if (notifs) setNotifications(notifs);
    });
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const searchResults = searchQuery.trim() === "" ? [] : searchableRoutes.filter(
    (route) => route.name.toLowerCase().includes(searchQuery.toLowerCase()) || route.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const markAllAsRead = async () => {
    setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length > 0) {
      await supabase.from("system_notifications").update({ is_read: true }).in("id", unreadIds);
    }
  };
  const removeNotification = async (id, e) => {
    e.stopPropagation();
    setNotifications(notifications.filter((n) => n.id !== id));
    await supabase.from("system_notifications").delete().eq("id", id);
  };
  return /* @__PURE__ */ jsxs("header", { className: "sticky top-0 z-30 flex items-center justify-between px-4 py-3 md:px-8 md:py-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5", children: [
    /* @__PURE__ */ jsxs("div", { className: "relative w-full max-w-sm", ref: searchRef, children: [
      /* @__PURE__ */ jsxs("div", { className: "flex bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-full items-center px-4 py-2 w-full focus-within:ring-1 focus-within:ring-blue-500/50 focus-within:border-blue-500/50 transition-all", children: [
        /* @__PURE__ */ jsx(Search, { className: "w-4 h-4 text-slate-500 shrink-0" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            placeholder: "Buscar en el sistema...",
            value: searchQuery,
            onChange: (e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            },
            onFocus: () => setShowSearchResults(true),
            className: "bg-transparent border-none outline-none text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 ml-2 w-full"
          }
        ),
        searchQuery && /* @__PURE__ */ jsx("button", { onClick: () => {
          setSearchQuery("");
          setShowSearchResults(false);
        }, className: "text-slate-400 hover:text-slate-600", children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" }) })
      ] }),
      showSearchResults && searchQuery.trim() !== "" && /* @__PURE__ */ jsx("div", { className: "fixed inset-x-4 top-[72px] md:absolute md:inset-auto md:top-full md:left-0 md:right-0 md:mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 z-50", children: searchResults.length > 0 ? /* @__PURE__ */ jsx("div", { className: "max-h-64 overflow-y-auto py-2", children: searchResults.map((result, idx) => /* @__PURE__ */ jsxs(
        "a",
        {
          href: result.path,
          className: "flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors",
          children: [
            /* @__PURE__ */ jsx(Search, { className: "w-4 h-4 text-slate-400 shrink-0" }),
            /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-slate-900 dark:text-white", children: result.name }) })
          ]
        },
        idx
      )) }) : /* @__PURE__ */ jsxs("div", { className: "p-4 text-center text-sm text-slate-500 dark:text-slate-400", children: [
        'No se encontraron resultados para "',
        searchQuery,
        '"'
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 md:gap-6", children: [
      onDuty && /* @__PURE__ */ jsxs("a", { href: "/duty", className: "hidden lg:flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full group hover:bg-green-500/20 transition-all", children: [
        /* @__PURE__ */ jsxs("span", { className: "relative flex h-2 w-2", children: [
          /* @__PURE__ */ jsx("span", { className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" }),
          /* @__PURE__ */ jsx("span", { className: "relative inline-flex rounded-full h-2 w-2 bg-green-500" })
        ] }),
        /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-green-500 uppercase tracking-widest", children: "En Guardia" })
      ] }),
      /* @__PURE__ */ jsx("a", { href: "/duty", className: "text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800", title: "Planificador de Guardias", children: /* @__PURE__ */ jsx(Calendar, { className: "w-5 h-5" }) }),
      /* @__PURE__ */ jsx(ThemeToggle, {}),
      /* @__PURE__ */ jsxs("div", { className: "relative", ref: dropdownRef, children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setShowNotifications(!showNotifications),
            className: "relative text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none",
            children: [
              /* @__PURE__ */ jsx(Bell, { className: "w-5 h-5" }),
              unreadCount > 0 && /* @__PURE__ */ jsx("span", { className: "absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]" })
            ]
          }
        ),
        showNotifications && /* @__PURE__ */ jsxs("div", { className: "fixed inset-x-4 top-[72px] md:absolute md:inset-auto md:right-0 md:mt-2 md:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200 z-[100]", children: [
          /* @__PURE__ */ jsxs("div", { className: "p-4 border-b border-slate-200 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50", children: [
            /* @__PURE__ */ jsx("h3", { className: "font-bold text-slate-900 dark:text-white", children: "Notificaciones" }),
            unreadCount > 0 && /* @__PURE__ */ jsxs("button", { onClick: markAllAsRead, className: "text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(Check, { className: "w-3 h-3" }),
              " Marcar leídas"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "max-h-96 overflow-y-auto", children: notifications.length === 0 ? /* @__PURE__ */ jsx("div", { className: "p-8 text-center text-slate-500 text-sm", children: "No tienes notificaciones." }) : /* @__PURE__ */ jsx("div", { className: "divide-y divide-white/5", children: notifications.map((n) => /* @__PURE__ */ jsxs("div", { className: `p-4 transition-colors relative group ${n.is_read ? "bg-slate-50 dark:bg-slate-900" : "bg-blue-500/5 dark:bg-blue-500/10"}`, children: [
            !n.is_read && /* @__PURE__ */ jsx("div", { className: "absolute left-0 top-0 bottom-0 w-1 bg-blue-500" }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start gap-3", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: `text-sm font-semibold mb-1 ${n.is_read ? "text-slate-600 dark:text-slate-300" : "text-slate-900 dark:text-white"}`, children: n.title }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400 line-clamp-2", children: n.message }),
                /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-500 mt-2 uppercase", children: new Date(n.created_at).toLocaleDateString() })
              ] }),
              /* @__PURE__ */ jsx("button", { onClick: (e) => removeNotification(n.id, e), className: "text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1", children: /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4" }) })
            ] })
          ] }, n.id)) }) }),
          /* @__PURE__ */ jsx("div", { className: "p-2 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900", children: /* @__PURE__ */ jsx("a", { href: "/notifications", className: "block w-full text-center text-xs font-bold text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 py-2", children: "VER TODAS LAS NOTIFICACIONES" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("a", { href: "/profile", className: "flex items-center gap-3 hover:opacity-80 transition-opacity", children: [
        /* @__PURE__ */ jsxs("div", { className: "hidden md:block text-right", children: [
          /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-slate-900 dark:text-white line-clamp-1", children: userEmail || "Cargando..." }),
          /* @__PURE__ */ jsx("div", { className: "text-xs text-slate-500", children: "Mi Perfil" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 overflow-hidden shrink-0", children: avatarUrl ? /* @__PURE__ */ jsx("img", { src: avatarUrl, alt: "Avatar", className: "w-full h-full object-cover" }) : /* @__PURE__ */ jsx(User, { className: "w-5 h-5" }) })
      ] })
    ] })
  ] });
}

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$DashboardLayout = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$DashboardLayout;
  const { title } = Astro2.props;
  const currentPath = Astro2.url.pathname;
  return renderTemplate(_a || (_a = __template(['<html lang="es"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"><title>', '</title><link rel="manifest" href="/manifest.json"><meta name="theme-color" content="#3b82f6"><link rel="apple-touch-icon" href="/favicon.svg">', "<script>\n      if ('serviceWorker' in navigator) {\n        window.addEventListener('load', () => {\n          navigator.serviceWorker.register('/sw.js').catch(err => console.error('SW Error', err));\n        });\n      }\n    <\/script><script>\n      const getTheme = () => {\n        if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {\n          return localStorage.getItem('theme');\n        }\n        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';\n      };\n\n      const applyTheme = () => {\n        const theme = getTheme();\n        if (theme === 'dark') {\n          document.documentElement.classList.add('dark');\n        } else {\n          document.documentElement.classList.remove('dark');\n        }\n      };\n\n      applyTheme();\n      document.addEventListener('astro:after-swap', applyTheme);\n    <\/script>", '</head> <body class="bg-slate-50 text-slate-900 dark:bg-[#050B14] dark:text-slate-300 antialiased min-h-screen"> <!-- Sidebar for Desktop --> ', ' <!-- Main Content Wrapper --> <div id="main-content" class="md:pl-64 flex flex-col min-h-screen transition-all duration-300 ease-in-out"> ', ' <main class="flex-1 p-4 pb-32 md:p-8 md:pb-8"> ', " </main> </div> <!-- Script to protect routes (Redirect if not logged in) --> ", " </body> </html>"])), title, renderComponent($$result, "ClientRouter", $$ClientRouter, {}), renderHead(), renderComponent($$result, "Sidebar", Sidebar, { "client:load": true, "currentPath": currentPath, "client:component-hydration": "load", "client:component-path": "G:/Proyectos/GA4/src/components/Sidebar", "client:component-export": "default" }), renderComponent($$result, "Topbar", Topbar, { "client:load": true, "client:component-hydration": "load", "client:component-path": "G:/Proyectos/GA4/src/components/Topbar", "client:component-export": "default" }), renderSlot($$result, $$slots["default"]), renderScript($$result, "G:/Proyectos/GA4/src/layouts/DashboardLayout.astro?astro&type=script&index=0&lang.ts"));
}, "G:/Proyectos/GA4/src/layouts/DashboardLayout.astro", void 0);

export { $$DashboardLayout as $ };
