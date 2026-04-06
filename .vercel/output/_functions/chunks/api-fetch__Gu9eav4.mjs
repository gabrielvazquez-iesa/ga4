import { s as supabase } from './supabase_C66l0GU-.mjs';

async function apiFetch(url, options = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...token ? { "Authorization": `Bearer ${token}` } : {}
    }
  });
}

export { apiFetch as a };
