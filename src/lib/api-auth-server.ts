import { createClient } from '@supabase/supabase-js';

export async function verifyApiAuth(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('API Auth: Missing or invalid Authorization header');
    return false;
  }
  
  const token = authHeader.split(' ')[1];
  
  if (!token || token === 'undefined' || token === 'null' || token === '') {
    console.error('API Auth: Token is empty or invalid string');
    return false;
  }
  
  try {
    // IMPORTANTE: En el servidor (Astro API Routes), a veces es necesario 
    // crear un cliente fresco para evitar problemas de estado compartido.
    const serverSupabase = createClient(
      import.meta.env.PUBLIC_SUPABASE_URL || '',
      import.meta.env.PUBLIC_SUPABASE_ANON_KEY || ''
    );

    const { data: { user }, error } = await serverSupabase.auth.getUser(token);
    
    if (error || !user) {
      console.error('API Auth User Error:', error?.message);
      
      // Fallback DEV: Si estamos en desarrollo (Astro.dev o process.env), 
      // permitimos el paso si hay un token para no bloquear las pruebas locales.
      const isDev = import.meta.env.DEV || process.env.NODE_ENV === 'development';
      if (isDev && token && token !== 'undefined') {
        console.warn('API Auth: [DEV BYPASS] Permitido acceso local con token:', token.substring(0, 10) + '...');
        return true;
      }
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('API Verification Crash:', err);
    return false;
  }
}
