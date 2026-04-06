import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://mkzrljmfgesxnrtnxzib.supabase.co";
const supabaseAnonKey = "sb_publishable_ei-WnhRWoUCmnoFE3NG7GA_Pzvf4_b0";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export { supabase as s };
