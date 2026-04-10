import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { verifyApiAuth } from '../../lib/api-auth-server';

function getServerSupabase(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.split(' ')[1];

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_yWNHuyC9OVzr_c8rzBrvXA_OJpzmgIN';
  
  return createClient(
    import.meta.env.PUBLIC_SUPABASE_URL || '',
    serviceKey,
    {
      global: {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      }
    }
  );
}

async function isAdmin(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.split(' ')[1];
  if (!token) return false;

  const client = getServerSupabase(request);
  const { data: { user }, error } = await client.auth.getUser(token);
  
  if (error || !user) return false;

  const email = user.email?.toLowerCase() || '';
  return ['admin@iesa.edu.ve', 'gabriel.vazquez@iesa.edu.ve'].includes(email);
}

export const DELETE: APIRoute = async ({ request }) => {
  // 1. Verificar Autenticación y Rol
  if (!(await verifyApiAuth(request)) || !(await isAdmin(request))) {
    return new Response(JSON.stringify({ error: 'No autorizado. Se cargan permisos de administrador.' }), { status: 401 });
  }

  const urlParams = new URL(request.url).searchParams;
  const userId = urlParams.get('userId');

  if (!userId) {
    return new Response(JSON.stringify({ error: 'ID de usuario requerido' }), { status: 400 });
  }

  const adminClient = getServerSupabase(request);

  try {
    // 2. Eliminar de auth.users (Esto borra automáticamente perfiles si hay ON DELETE CASCADE, 
    // pero lo haremos explícito si es necesario)
    const { error: authError } = await adminClient.auth.admin.deleteUser(userId);
    
    if (authError) throw authError;

    // 3. Eliminar de user_profiles (Por seguridad extra)
    await adminClient.from('user_profiles').delete().eq('user_id', userId);

    return new Response(JSON.stringify({ success: true, message: 'Usuario eliminado definitivamente' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Final Delete Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
