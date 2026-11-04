import { createClient } from "@supabase/supabase-js";

const defaultUrl = "https://mkzrljmfgesxnrtnxzib.supabase.co";
const defaultKey = "sb_publishable_ei-WnhRWoUCmnoFE3NG7GA_Pzvf4_b0";

const supabaseUrl = 
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.PUBLIC_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env && process.env.PUBLIC_SUPABASE_URL) ||
  defaultUrl;

const supabaseAnonKey = 
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.PUBLIC_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env && process.env.PUBLIC_SUPABASE_ANON_KEY) ||
  defaultKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
