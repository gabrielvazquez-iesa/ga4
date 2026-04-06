import { c as createComponent } from './astro-component_Bi-3AwRB.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_BbtgLamP.mjs';
import { $ as $$DashboardLayout } from './DashboardLayout_jfAd883J.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { s as supabase } from './supabase_C66l0GU-.mjs';
import { BookOpen, Plus, Search, Tag, Edit3, Trash2, ExternalLink } from 'lucide-react';
import { Toaster, toast } from 'sonner';

function ManualsDirectory() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [manuals, setManuals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [file, setFile] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("");
  useEffect(() => {
    checkContext();
    fetchManuals();
  }, []);
  const checkContext = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const email = session?.user?.email || "";
    setIsAdmin(["admin@iesa.edu.ve", "gabriel.vazquez@iesa.edu.ve"].includes(email.toLowerCase()));
  };
  const fetchManuals = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("process_manuals").select("*").order("created_at", { ascending: false });
    if (!error && data) {
      setManuals(data);
      const uniqueCats = Array.from(new Set(data.map((m) => m.category))).filter(Boolean);
      setCategories(uniqueCats);
    }
    setLoading(false);
  };
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !newTitle || !newCategory) return toast.error("Rellena todos los campos");
    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${newCategory}/${fileName}`;
      const { error: uploadError } = await supabase.storage.from("manuals").upload(filePath, file);
      if (uploadError) throw new Error('Error subiendo archivo. ¿Creaste el Storage Bucket "manuals"?: ' + uploadError.message);
      const { data: urlData } = supabase.storage.from("manuals").getPublicUrl(filePath);
      const { data: { session } } = await supabase.auth.getSession();
      const { error: dbError } = await supabase.from("process_manuals").insert({
        title: newTitle,
        category: newCategory,
        file_url: urlData.publicUrl,
        uploaded_by: session?.user?.id
      });
      if (dbError) throw new Error("Error guardando registro. ¿Corriste el Script SQL?: " + dbError.message);
      toast.success("Manual subido y listado exitosamente");
      setShowModal(false);
      setNewTitle("");
      setNewCategory("");
      setFile(null);
      fetchManuals();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };
  const handleDelete = async (id, file_url) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este manual del registro? Esta acción no se puede deshacer.")) return;
    try {
      await supabase.from("process_manuals").delete().eq("id", id);
      fetchManuals();
      toast.success("Manual eliminado correctamente.");
    } catch (err) {
      toast.error("Error al borrar: " + err.message);
    }
  };
  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editId || !editTitle || !editCategory) return;
    setUploading(true);
    try {
      const { error } = await supabase.from("process_manuals").update({
        title: editTitle,
        category: editCategory,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", editId);
      if (error) throw new Error("Error al actualizar: " + error.message);
      toast.success("Manual modificado.");
      setEditId(null);
      fetchManuals();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };
  const openEdit = (m) => {
    setEditTitle(m.title);
    setEditCategory(m.category);
    setEditId(m.id);
  };
  const filtered = manuals.filter(
    (m) => (selectedCat === "" || m.category === selectedCat) && (search === "" || m.title.toLowerCase().includes(search.toLowerCase()))
  );
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx(Toaster, { position: "top-right", theme: "dark" }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/80 dark:bg-slate-900/60 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-white/5 backdrop-blur-sm", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("h1", { className: "text-3xl font-extrabold flex items-center gap-3 text-slate-900 dark:text-white", children: [
          /* @__PURE__ */ jsx("div", { className: "w-12 h-12 bg-indigo-500/10 text-indigo-500 flex items-center justify-center rounded-2xl border border-indigo-500/20", children: /* @__PURE__ */ jsx(BookOpen, { className: "w-6 h-6" }) }),
          "Directorio de Manuales"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-slate-500 dark:text-slate-400 mt-2 font-medium", children: "Buscador y repositorio oficial de procesos." })
      ] }),
      /* @__PURE__ */ jsxs("button", { onClick: () => setShowModal(true), className: "flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-lg shadow-indigo-500/20", children: [
        /* @__PURE__ */ jsx(Plus, { className: "w-5 h-5" }),
        " Subir Manual"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-4 bg-white/50 dark:bg-slate-900/40 p-2 rounded-2xl border border-slate-200 dark:border-white/5 backdrop-blur-sm", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex-1 relative", children: [
        /* @__PURE__ */ jsx(Search, { className: "absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            placeholder: "Palabras clave en el título...",
            className: "w-full pl-12 pr-4 py-3 bg-transparent border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none font-bold text-slate-900 dark:text-white",
            value: search,
            onChange: (e) => setSearch(e.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "w-px bg-slate-200 dark:bg-slate-800 hidden sm:block mx-2 shrink-0 my-2" }),
      /* @__PURE__ */ jsxs(
        "select",
        {
          value: selectedCat,
          onChange: (e) => setSelectedCat(e.target.value),
          className: "px-4 py-3 bg-transparent border-none outline-none font-bold text-slate-700 dark:text-slate-300 min-w-[200px] cursor-pointer",
          children: [
            /* @__PURE__ */ jsx("option", { value: "", className: "text-slate-900", children: "Todas las Categorías" }),
            categories.map((c) => /* @__PURE__ */ jsx("option", { value: c, className: "text-slate-900", children: c }, c))
          ]
        }
      )
    ] }),
    loading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-32", children: /* @__PURE__ */ jsx("div", { className: "w-12 h-12 animate-spin rounded-full border-4 border-indigo-500/30 border-t-indigo-500" }) }) : filtered.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-32 bg-white/50 dark:bg-slate-900/30 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 backdrop-blur-sm", children: [
      /* @__PURE__ */ jsx(BookOpen, { className: "w-16 h-16 mx-auto text-slate-300 dark:text-slate-700 mb-4" }),
      /* @__PURE__ */ jsx("p", { className: "text-slate-500 dark:text-slate-400 font-bold text-lg", children: "Aún no hay manuales en este listado." }),
      isAdmin && /* @__PURE__ */ jsx("p", { className: "text-sm mt-2 text-indigo-500", children: "Haz clic en Subir Manual para agregar el primero." })
    ] }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500", children: filtered.map((m) => /* @__PURE__ */ jsxs("a", { href: m.file_url, target: "_blank", className: "group flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 hover:-translate-y-1 hover:shadow-2xl hover:border-indigo-500/30 transition-all duration-300 relative overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors" }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start mb-6 relative z-10", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-indigo-500/10", children: [
          /* @__PURE__ */ jsx(Tag, { className: "w-3.5 h-3.5" }),
          " ",
          m.category
        ] }),
        isAdmin && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity", children: [
          /* @__PURE__ */ jsx("button", { onClick: (e) => {
            e.preventDefault();
            openEdit(m);
          }, className: "p-2 text-indigo-500 hover:bg-indigo-500/10 rounded-xl transition-colors", title: "Editar", children: /* @__PURE__ */ jsx(Edit3, { className: "w-4 h-4" }) }),
          /* @__PURE__ */ jsx("button", { onClick: (e) => {
            e.preventDefault();
            handleDelete(m.id, m.file_url);
          }, className: "p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors", title: "Borrar", children: /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsx("h3", { className: "text-xl font-extrabold mb-4 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-3 text-slate-900 dark:text-white inline-block mt-auto relative z-10 leading-snug", children: m.title }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 gap-1.5 mt-auto relative z-10 pt-4 border-t border-slate-100 dark:border-white/5 w-full", children: [
        /* @__PURE__ */ jsx(ExternalLink, { className: "w-4 h-4" }),
        "Abrir documento PDF"
      ] })
    ] }, m.id)) }),
    showModal && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleUpload, className: "bg-white dark:bg-slate-950 border dark:border-white/10 w-full max-w-lg rounded-[2rem] p-8 shadow-2xl relative", children: [
      /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setShowModal(false), className: "absolute top-6 right-6 text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-white/5 w-8 h-8 rounded-full flex items-center justify-center font-bold", children: "✕" }),
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-extrabold mb-8 text-slate-900 dark:text-white", children: "Subir Nuevo Manual" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs font-black uppercase tracking-widest text-slate-400 block mb-2", children: "Título oficial" }),
          /* @__PURE__ */ jsx("input", { required: true, type: "text", value: newTitle, onChange: (e) => setNewTitle(e.target.value), className: "w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 font-medium", placeholder: "Ej. Protocolo de Redes" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs font-black uppercase tracking-widest text-slate-400 block mb-2", children: "Categoría o Área" }),
          /* @__PURE__ */ jsx("input", { required: true, type: "text", value: newCategory, onChange: (e) => setNewCategory(e.target.value), className: "w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 font-medium", list: "cats", placeholder: "Ej. Operaciones, Social Media..." }),
          /* @__PURE__ */ jsx("datalist", { id: "cats", children: categories.map((c) => /* @__PURE__ */ jsx("option", { value: c }, c)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs font-black uppercase tracking-widest text-slate-400 block mb-2", children: "Documento (.PDF)" }),
          /* @__PURE__ */ jsx("input", { required: true, type: "file", accept: ".pdf", onChange: (e) => setFile(e.target.files?.[0] || null), className: "w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:text-white file:font-bold file:cursor-pointer text-slate-500 dark:text-slate-300 font-medium cursor-pointer" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("button", { type: "submit", disabled: uploading, className: "w-full mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg disabled:opacity-50 flex justify-center items-center gap-2", children: uploading ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("div", { className: "w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" }),
        " Subiendo..."
      ] }) : "Confirmar y Publicar" })
    ] }) }),
    editId && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleEdit, className: "bg-white dark:bg-slate-950 border dark:border-white/10 w-full max-w-lg rounded-[2rem] p-8 shadow-2xl relative", children: [
      /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setEditId(null), className: "absolute top-6 right-6 text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-white/5 w-8 h-8 rounded-full flex items-center justify-center font-bold", children: "✕" }),
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-extrabold mb-8 text-slate-900 dark:text-white", children: "Modificar Manual" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs font-black uppercase tracking-widest text-slate-400 block mb-2", children: "Nuevo título oficial" }),
          /* @__PURE__ */ jsx("input", { required: true, type: "text", value: editTitle, onChange: (e) => setEditTitle(e.target.value), className: "w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 font-medium" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs font-black uppercase tracking-widest text-slate-400 block mb-2", children: "Categoría o Área" }),
          /* @__PURE__ */ jsx("input", { required: true, type: "text", value: editCategory, onChange: (e) => setEditCategory(e.target.value), className: "w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 font-medium", list: "cats" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("button", { type: "submit", disabled: uploading, className: "w-full mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg disabled:opacity-50 flex justify-center items-center gap-2", children: uploading ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("div", { className: "w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" }),
        " Guardando..."
      ] }) : "Guardar Cambios" })
    ] }) })
  ] });
}

const $$Manuales = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, { "title": "Central de Manuales - Dashboard IESA" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-6xl mx-auto space-y-6 pb-20"> <header class="mb-4"> <h1 class="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">Manuales de Procesos</h1> <p class="text-slate-500 dark:text-slate-400 text-sm">Biblioteca centralizada de manuales operativos e instructivos de IESA.</p> </header> ${renderComponent($$result2, "ManualsDirectory", ManualsDirectory, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/gabriel.vazquez/Desktop/Proyectos/proyecto-dashboard/ga4-dashboard/src/components/ManualsDirectory", "client:component-export": "default" })} </div> ` })}`;
}, "C:/Users/gabriel.vazquez/Desktop/Proyectos/proyecto-dashboard/ga4-dashboard/src/pages/manuales.astro", void 0);

const $$file = "C:/Users/gabriel.vazquez/Desktop/Proyectos/proyecto-dashboard/ga4-dashboard/src/pages/manuales.astro";
const $$url = "/manuales";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Manuales,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
