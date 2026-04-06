import { c as createComponent } from './astro-component_CCwRo9GX.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_Bgf5ToQF.mjs';
import { $ as $$DashboardLayout } from './DashboardLayout_B4a3eXfo.mjs';
import { jsx, jsxs } from 'react/jsx-runtime';
import { useState, useEffect, useMemo, useRef } from 'react';
import { s as supabase } from './supabase_C66l0GU-.mjs';
import { Calendar, Plus, ChevronLeft, ChevronRight, User, Clock, Edit2, Trash2 } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription, e as DialogFooter, B as Button } from './button_BIqSC7kq.mjs';

const VE_HOLIDAYS = {
  "2026-01-01": "Año Nuevo",
  "2026-02-16": "Carnaval",
  "2026-02-17": "Carnaval",
  "2026-04-02": "Jueves Santo",
  "2026-04-03": "Viernes Santo",
  "2026-04-19": "Declaración de Independencia",
  "2026-05-01": "Día del Trabajador",
  "2026-06-24": "Batalla de Carabobo",
  "2026-07-05": "Día de la Independencia",
  "2026-07-24": "Natalicio de Simón Bolívar",
  "2026-10-12": "Resistencia Indígena",
  "2026-12-24": "Nochebuena",
  "2026-12-25": "Navidad",
  "2026-12-31": "Fin de Año",
  // 2025
  "2025-01-01": "Año Nuevo",
  "2025-03-03": "Carnaval",
  "2025-03-04": "Carnaval",
  "2025-04-17": "Jueves Santo",
  "2025-04-18": "Viernes Santo",
  "2025-04-19": "Declaración de Independencia",
  "2025-05-01": "Día del Trabajador",
  "2025-06-24": "Batalla de Carabobo",
  "2025-07-05": "Independencia",
  "2025-07-24": "Bolívar",
  "2025-10-12": "Resistencia Indígena",
  "2025-12-24": "Nochebuena",
  "2025-12-25": "Navidad",
  "2025-12-31": "Fin de Año"
};
const USER_COLORS = [
  { bg: "bg-blue-500", dot: "#3b82f6", text: "text-blue-500", light: "bg-blue-500/10" },
  { bg: "bg-violet-500", dot: "#8b5cf6", text: "text-violet-500", light: "bg-violet-500/10" },
  { bg: "bg-rose-500", dot: "#f43f5e", text: "text-rose-500", light: "bg-rose-500/10" },
  { bg: "bg-amber-500", dot: "#f59e0b", text: "text-amber-500", light: "bg-amber-500/10" },
  { bg: "bg-emerald-500", dot: "#10b981", text: "text-emerald-500", light: "bg-emerald-500/10" },
  { bg: "bg-sky-500", dot: "#0ea5e9", text: "text-sky-500", light: "bg-sky-500/10" },
  { bg: "bg-orange-500", dot: "#f97316", text: "text-orange-500", light: "bg-orange-500/10" },
  { bg: "bg-pink-500", dot: "#ec4899", text: "text-pink-500", light: "bg-pink-500/10" },
  { bg: "bg-teal-500", dot: "#14b8a6", text: "text-teal-500", light: "bg-teal-500/10" },
  { bg: "bg-indigo-500", dot: "#6366f1", text: "text-indigo-500", light: "bg-indigo-500/10" }
];
function toKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function SocialDutyPlanner() {
  const [shifts, setShifts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(/* @__PURE__ */ new Date());
  const [formData, setFormData] = useState({
    user_id: "",
    start_date: "",
    end_date: "",
    shift_type: "day",
    notes: "",
    tag: "Redes Sociales"
  });
  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    setCurrentUser(session?.user);
    const [{ data: shiftsData }, { data: usersData }] = await Promise.all([
      supabase.from("duty_shifts").select("*, user_profiles(display_name, department)").order("start_date", { ascending: true }),
      supabase.from("user_profiles").select("user_id, display_name, department, custom_color").order("display_name")
    ]);
    setShifts(shiftsData || []);
    setUsers(usersData || []);
    setLoading(false);
  };
  const userColorMap = useMemo(() => {
    const map = {};
    users.forEach((u, i) => {
      if (u.custom_color) {
        map[u.user_id] = { customColorHex: u.custom_color };
      } else {
        map[u.user_id] = USER_COLORS[i % USER_COLORS.length];
      }
    });
    return map;
  }, [users]);
  const shiftsByDay = useMemo(() => {
    const map = {};
    shifts.forEach((shift) => {
      const start = new Date(shift.start_date);
      const end = new Date(shift.end_date);
      const current = new Date(start);
      while (current <= end) {
        const key = toKey(current);
        if (!map[key]) map[key] = [];
        map[key].push(shift);
        current.setDate(current.getDate() + 1);
      }
    });
    return map;
  }, [shifts]);
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (!formData.user_id) {
        toast.error("Selecciona un responsable.");
        return;
      }
      const { tag, notes, ...rest } = formData;
      const combinedNotes = `[${tag}] ${notes}`;
      const payload = { ...rest, notes: combinedNotes };
      if (editingShift) {
        const { error } = await supabase.from("duty_shifts").update(payload).eq("id", editingShift.id);
        if (error) throw error;
        await supabase.from("duty_audit_logs").insert({ shift_id: editingShift.id, user_id: currentUser?.id, action: "update", new_value: payload });
        toast.success("Guardia actualizada.");
      } else {
        const { data, error } = await supabase.from("duty_shifts").insert([payload]).select().single();
        if (error) throw error;
        await supabase.from("duty_audit_logs").insert({ shift_id: data.id, user_id: currentUser?.id, action: "create", new_value: payload });
        toast.success("Guardia programada.");
      }
      setShowModal(false);
      setEditingShift(null);
      fetchData();
    } catch (err) {
      toast.error("Error: " + err.message);
    }
  };
  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar esta guardia?")) return;
    await supabase.from("duty_shifts").delete().eq("id", id);
    await supabase.from("duty_audit_logs").insert({ user_id: currentUser?.id, action: "delete" });
    toast.info("Guardia eliminada.");
    fetchData();
  };
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = toKey(/* @__PURE__ */ new Date());
  const MONTHS_ES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const DAYS_ES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const goToMonth = (direction) => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
    setSelectedDay(null);
  };
  const nowStr = (/* @__PURE__ */ new Date()).toISOString();
  const activeShift = shifts.find((s) => s.start_date <= nowStr && s.end_date >= nowStr);
  const selectedShifts = selectedDay ? shiftsByDay[selectedDay] || [] : [];
  if (loading) return /* @__PURE__ */ jsx("div", { className: "p-8 text-center text-slate-500", children: "Cargando planificador..." });
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6 animate-in fade-in duration-500", children: [
    /* @__PURE__ */ jsx(Toaster, { theme: "dark", position: "top-right" }),
    /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-700 to-indigo-900 rounded-3xl p-8 text-white shadow-2xl shadow-indigo-500/20", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative z-10 flex flex-col md:flex-row justify-between items-center gap-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxs("h1", { className: "text-3xl font-extrabold tracking-tight flex items-center gap-3", children: [
            /* @__PURE__ */ jsx(Calendar, { className: "w-8 h-8 text-indigo-200" }),
            " Planificador de Guardias"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-indigo-100/80", children: "Visualiza y gestiona los turnos de Mercadeo y Comunicaciones." })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => {
              setEditingShift(null);
              setFormData({ user_id: "", start_date: "", end_date: "", shift_type: "day", notes: "", tag: "Redes Sociales" });
              setShowModal(true);
            },
            className: "flex items-center gap-2 px-6 py-3 bg-white text-indigo-700 font-bold rounded-2xl hover:bg-indigo-50 transition-all shadow-xl",
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "w-5 h-5" }),
              " Programar Guardia"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" }),
      /* @__PURE__ */ jsx("div", { className: "absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-400/20 rounded-full blur-3xl" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-xl backdrop-blur-xl", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10", children: [
          /* @__PURE__ */ jsx("button", { onClick: () => goToMonth(-1), className: "p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors", children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-5 h-5 text-slate-500" }) }),
          /* @__PURE__ */ jsxs("h2", { className: "font-bold text-lg text-slate-900 dark:text-white", children: [
            MONTHS_ES[month],
            " ",
            year
          ] }),
          /* @__PURE__ */ jsx("button", { onClick: () => goToMonth(1), className: "p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors", children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-5 h-5 text-slate-500" }) })
        ] }),
        /* @__PURE__ */ jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }, className: "border-b border-slate-200 dark:border-white/10", children: DAYS_ES.map((d) => /* @__PURE__ */ jsx("div", { className: "py-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider", children: d }, d)) }),
        /* @__PURE__ */ jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }, children: [
          Array.from({ length: firstDay }).map((_, i) => /* @__PURE__ */ jsx("div", { className: "border-b border-r border-slate-100 dark:border-white/5 min-h-[5rem] p-1" }, `empty-${i}`)),
          Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayShifts = shiftsByDay[key] || [];
            const holiday = VE_HOLIDAYS[key];
            const isToday = key === today;
            const isSelected = key === selectedDay;
            return /* @__PURE__ */ jsxs(
              "div",
              {
                onClick: () => setSelectedDay(key === selectedDay ? null : key),
                className: `border-b border-r border-slate-100 dark:border-white/5 min-h-[5rem] p-1.5 cursor-pointer transition-colors ${isSelected ? "bg-blue-500/10 dark:bg-blue-500/20 border-blue-500/30" : "hover:bg-slate-50 dark:hover:bg-white/5"}`,
                children: [
                  /* @__PURE__ */ jsx("div", { className: `w-7 h-7 flex items-center justify-center rounded-full mb-1 text-sm font-semibold ${isToday ? "bg-blue-600 text-white" : "text-slate-700 dark:text-slate-300"}`, children: day }),
                  holiday && /* @__PURE__ */ jsxs("div", { className: "text-[8px] text-amber-500 font-bold leading-tight mb-1 truncate", title: holiday, children: [
                    "🎉 ",
                    holiday
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-0.5", children: [
                    dayShifts.slice(0, 3).map((s) => {
                      const color = userColorMap[s.user_id];
                      return /* @__PURE__ */ jsx(
                        "div",
                        {
                          title: s.user_profiles?.display_name,
                          style: { backgroundColor: color?.customColorHex || color?.dot || "#3b82f6" },
                          className: "w-2 h-2 rounded-full"
                        },
                        s.id
                      );
                    }),
                    dayShifts.length > 3 && /* @__PURE__ */ jsxs("span", { className: "text-[9px] text-slate-400", children: [
                      "+",
                      dayShifts.length - 3
                    ] })
                  ] })
                ]
              },
              day
            );
          })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-3xl p-5 backdrop-blur-xl shadow-xl", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-xs font-bold text-slate-400 uppercase tracking-widest mb-4", children: "Estado Actual" }),
          activeShift ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-full flex items-center justify-center", style: { backgroundColor: (userColorMap[activeShift.user_id]?.customColorHex || userColorMap[activeShift.user_id]?.dot || "#3b82f6") + "20", border: `2px solid ${userColorMap[activeShift.user_id]?.customColorHex || userColorMap[activeShift.user_id]?.dot || "#3b82f6"}40` }, children: /* @__PURE__ */ jsx(User, { className: "w-6 h-6", style: { color: userColorMap[activeShift.user_id]?.customColorHex || userColorMap[activeShift.user_id]?.dot || "#3b82f6" } }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-green-500 font-bold uppercase", children: [
                "De Guardia ",
                activeShift.notes?.startsWith("[Eventos]") ? " (Eventos)" : " (Redes)"
              ] }),
              /* @__PURE__ */ jsx("p", { className: "font-bold dark:text-white", children: activeShift.user_profiles?.display_name }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500", children: activeShift.user_profiles?.department })
            ] })
          ] }) : /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-full bg-slate-500/10 flex items-center justify-center", children: /* @__PURE__ */ jsx(Clock, { className: "w-6 h-6 text-slate-400" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400 font-bold uppercase", children: "Sin Guardia" }),
              /* @__PURE__ */ jsx("p", { className: "font-bold dark:text-white", children: "Nadie asignado ahora" })
            ] })
          ] })
        ] }),
        selectedDay && /* @__PURE__ */ jsxs("div", { className: "bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-3xl p-5 backdrop-blur-xl shadow-xl", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-xs font-bold text-slate-400 uppercase tracking-widest mb-4", children: (/* @__PURE__ */ new Date(selectedDay + "T12:00:00")).toLocaleDateString("es-VE", { weekday: "long", day: "numeric", month: "long" }) }),
          VE_HOLIDAYS[selectedDay] && /* @__PURE__ */ jsxs("div", { className: "text-xs bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-lg px-3 py-2 mb-3 font-medium", children: [
            "🎉 ",
            VE_HOLIDAYS[selectedDay]
          ] }),
          selectedShifts.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400 italic", children: "Sin guardias asignadas este día." }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: selectedShifts.map((shift) => {
            const color = userColorMap[shift.user_id];
            return /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 group", children: [
              /* @__PURE__ */ jsx("div", { className: "w-3 h-3 rounded-full mt-1.5 shrink-0", style: { backgroundColor: color?.dot || "#3b82f6" } }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxs("p", { className: "font-semibold text-sm dark:text-white flex items-center gap-2 truncate", children: [
                  shift.user_profiles?.display_name,
                  shift.notes?.startsWith("[Eventos]") && /* @__PURE__ */ jsx("span", { className: "px-1.5 py-0.5 text-[9px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded uppercase font-bold shrink-0", children: "Eventos" }),
                  shift.notes?.startsWith("[Redes Sociales]") && /* @__PURE__ */ jsx("span", { className: "px-1.5 py-0.5 text-[9px] bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded uppercase font-bold shrink-0", children: "Redes" })
                ] }),
                /* @__PURE__ */ jsxs("p", { className: "text-xs text-indigo-400 font-semibold", children: [
                  new Date(shift.start_date).toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" }),
                  " — ",
                  new Date(shift.end_date).toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" })
                ] }),
                /* @__PURE__ */ jsxs("p", { className: "text-xs text-slate-400", children: [
                  shift.user_profiles?.department,
                  " · ",
                  shift.shift_type === "day" ? "Diario" : shift.shift_type === "week" ? "Semanal" : "Fin de Semana"
                ] }),
                (() => {
                  let cleanNotes = shift.notes || "";
                  if (cleanNotes.startsWith("[Eventos] ")) cleanNotes = cleanNotes.replace("[Eventos] ", "");
                  else if (cleanNotes.startsWith("[Redes Sociales] ")) cleanNotes = cleanNotes.replace("[Redes Sociales] ", "");
                  return cleanNotes ? /* @__PURE__ */ jsxs("p", { className: "text-xs text-slate-500 mt-1 italic", children: [
                    '"',
                    cleanNotes,
                    '"'
                  ] }) : null;
                })()
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity", children: [
                /* @__PURE__ */ jsx("button", { onClick: () => {
                  let parsedTag = "Redes Sociales";
                  let parsedNotes = shift.notes || "";
                  if (parsedNotes.startsWith("[Eventos] ")) {
                    parsedTag = "Eventos";
                    parsedNotes = parsedNotes.replace("[Eventos] ", "");
                  } else if (parsedNotes.startsWith("[Redes Sociales] ")) {
                    parsedTag = "Redes Sociales";
                    parsedNotes = parsedNotes.replace("[Redes Sociales] ", "");
                  }
                  setEditingShift(shift);
                  setFormData({ user_id: shift.user_id, start_date: shift.start_date, end_date: shift.end_date, shift_type: shift.shift_type, notes: parsedNotes, tag: parsedTag });
                  setShowModal(true);
                }, className: "p-1 text-slate-400 hover:text-blue-500 rounded-lg hover:bg-blue-500/10 transition-all", children: /* @__PURE__ */ jsx(Edit2, { className: "w-3.5 h-3.5" }) }),
                /* @__PURE__ */ jsx("button", { onClick: () => handleDelete(shift.id), className: "p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-all", children: /* @__PURE__ */ jsx(Trash2, { className: "w-3.5 h-3.5" }) })
              ] })
            ] }, shift.id);
          }) })
        ] }),
        users.length > 0 && /* @__PURE__ */ jsxs("div", { className: "bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-3xl p-5 backdrop-blur-xl shadow-xl", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-xs font-bold text-slate-400 uppercase tracking-widest mb-3", children: "Referencias" }),
          /* @__PURE__ */ jsx("div", { className: "space-y-2", children: users.map((u) => {
            const color = userColorMap[u.user_id];
            return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
              /* @__PURE__ */ jsx("div", { className: "w-3 h-3 rounded-full shrink-0", style: { backgroundColor: color?.customColorHex || color?.dot || "#3b82f6" } }),
              /* @__PURE__ */ jsx("span", { className: "text-sm dark:text-white truncate", children: u.display_name }),
              /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-400 ml-auto shrink-0", children: u.department })
            ] }, u.user_id);
          }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Dialog, { open: showModal, onOpenChange: setShowModal, children: /* @__PURE__ */ jsxs(DialogContent, { className: "sm:max-w-xl bg-slate-50 dark:bg-[#0f172a] border-slate-200 dark:border-white/10 rounded-2xl", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsx(DialogTitle, { className: "text-xl font-bold dark:text-white", children: editingShift ? "Editar Turno" : "Nueva Guardia" }),
        /* @__PURE__ */ jsx(DialogDescription, { children: "Asigna un responsable y horario para el turno." })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSave, className: "space-y-5 pt-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-slate-500 uppercase tracking-widest", children: "Responsable *" }),
            /* @__PURE__ */ jsx(
              CustomSelect,
              {
                value: formData.user_id,
                onChange: (v) => setFormData({ ...formData, user_id: v }),
                placeholder: "Seleccionar...",
                options: users.map((u) => ({ value: u.user_id, label: `${u.display_name} (${u.department})` }))
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-slate-500 uppercase tracking-widest", children: "Tipo de Turno" }),
            /* @__PURE__ */ jsx(
              CustomSelect,
              {
                value: formData.shift_type,
                onChange: (v) => setFormData({ ...formData, shift_type: v }),
                options: [
                  { value: "day", label: "Diario" },
                  { value: "week", label: "Semanal" },
                  { value: "weekend", label: "Fin de Semana" }
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-slate-500 uppercase tracking-widest", children: "Inicio *" }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(Calendar, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  required: true,
                  type: "datetime-local",
                  value: formData.start_date.substring(0, 16),
                  onChange: (e) => setFormData({ ...formData, start_date: e.target.value }),
                  className: "w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 py-2.5 pl-9 pr-3 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm dark:text-white [color-scheme:dark]"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-slate-500 uppercase tracking-widest", children: "Fin *" }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(Clock, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  required: true,
                  type: "datetime-local",
                  value: formData.end_date.substring(0, 16),
                  onChange: (e) => setFormData({ ...formData, end_date: e.target.value }),
                  className: "w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 py-2.5 pl-9 pr-3 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm dark:text-white [color-scheme:dark]"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-slate-500 uppercase tracking-widest", children: "Etiqueta" }),
            /* @__PURE__ */ jsx(
              CustomSelect,
              {
                value: formData.tag,
                onChange: (v) => setFormData({ ...formData, tag: v }),
                options: [
                  { value: "Redes Sociales", label: "Redes Sociales" },
                  { value: "Eventos", label: "Cubrir Eventos" }
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-slate-500 uppercase tracking-widest", children: "Notas Adicionales" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              rows: 2,
              value: formData.notes,
              onChange: (e) => setFormData({ ...formData, notes: e.target.value }),
              placeholder: "Ej. Cobertura de evento especial...",
              className: "w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 py-2.5 px-4 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm dark:text-white resize-none placeholder:text-slate-400"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs(DialogFooter, { className: "pt-2", children: [
          /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", onClick: () => setShowModal(false), className: "w-full sm:w-auto", children: "Cancelar" }),
          /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white", children: editingShift ? "Guardar Cambios" : "Agendar Guardia" })
        ] })
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
        className: "w-full flex items-center justify-between bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 py-3 px-3.5 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all",
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
          className: `w-full text-left px-4 py-2.5 text-sm transition-colors ${o.value === value ? "bg-indigo-600/10 text-indigo-400 font-semibold" : "text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5"}`,
          children: o.label
        },
        o.value
      ))
    ] })
  ] });
}

const $$Duty = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, { "title": "Planificador de Guardias | Dashboard" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-7xl mx-auto space-y-8"> ${renderComponent($$result2, "SocialDutyPlanner", SocialDutyPlanner, { "client:idle": true, "client:component-hydration": "idle", "client:component-path": "C:/Users/gabriel.vazquez/Desktop/Proyectos/proyecto-dashboard/ga4-dashboard/src/components/SocialDutyPlanner.tsx", "client:component-export": "default" })} </div> ` })}`;
}, "C:/Users/gabriel.vazquez/Desktop/Proyectos/proyecto-dashboard/ga4-dashboard/src/pages/duty.astro", void 0);

const $$file = "C:/Users/gabriel.vazquez/Desktop/Proyectos/proyecto-dashboard/ga4-dashboard/src/pages/duty.astro";
const $$url = "/duty";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Duty,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
