import { createClient } from '@supabase/supabase-js';

async function verifyApiAuth(request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error("API Auth: Missing or invalid Authorization header");
    return false;
  }
  const token = authHeader.split(" ")[1];
  if (!token || token === "undefined" || token === "null" || token === "") {
    console.error("API Auth: Token is empty or invalid string");
    return false;
  }
  try {
    const serverSupabase = createClient(
      "https://mkzrljmfgesxnrtnxzib.supabase.co",
      "sb_publishable_ei-WnhRWoUCmnoFE3NG7GA_Pzvf4_b0"
    );
    const { data: { user }, error } = await serverSupabase.auth.getUser(token);
    if (error || !user) {
      console.error("API Auth User Error:", error?.message);
      const isDev = process.env.NODE_ENV === "development";
      if (isDev && token && token !== "undefined") {
        console.warn("API Auth: [DEV BYPASS] Permitido acceso local con token:", token.substring(0, 10) + "...");
        return true;
      }
      return false;
    }
    return true;
  } catch (err) {
    console.error("API Verification Crash:", err);
    return false;
  }
}

export { verifyApiAuth as v };
