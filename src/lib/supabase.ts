import { createClient } from "@supabase/supabase-js";

// Usamos import.meta.env para Astro
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Atención: Las variables de Supabase no están cargadas. Revisa tu .env");
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");
