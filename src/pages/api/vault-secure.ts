import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { verifyApiAuth } from '../../lib/api-auth-server';
import crypto from 'crypto';

// Encryption Config
const ALGO = 'aes-256-cbc';

function getSecret() {
  return process.env.VAULT_SECRET_KEY || import.meta.env.VAULT_SECRET_KEY || '';
}

function getServerSupabase(request: Request, useServiceRole = false) {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.split(' ')[1];

  // Prioridad: Variable de entorno del sistema (Vercel/Node) > Variable de Astro > Fallback vacío
  const serviceEnv = process.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const publicEnv = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';
  
  // Si pedimos service role pero no hay llave, usamos anon como último recurso (RLS aplicará)
  const activeKey = (useServiceRole && serviceEnv) ? serviceEnv : publicEnv;

  return createClient(
    import.meta.env.PUBLIC_SUPABASE_URL || '',
    activeKey,
    {
      global: {
        // IMPORTANTE: Si usamos service_role, NO enviamos el token en los headers globales.
        // Esto asegura que PostgREST use el rol 'service_role' y bypass de RLS.
        headers: (token && !useServiceRole) ? { Authorization: `Bearer ${token}` } : {}
      }
    }
  );
}

async function checkVaultPermission(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.split(' ')[1];
  if (!token) return false;

  // Creamos un cliente anon para verificar la identidad del usuario primero
  const authClient = createClient(
    import.meta.env.PUBLIC_SUPABASE_URL || '',
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY || ''
  );
  
  const { data: { user }, error: userError } = await authClient.auth.getUser(token);
  if (userError || !user) return false;

  const email = user.email?.toLowerCase() || '';
  
  // 1. Admins hardcodeados siempre entran
  if (['admin@iesa.edu.ve', 'gabriel.vazquez@iesa.edu.ve'].includes(email)) return true;

  // 2. Otros usuarios: Consultar perfil usando Service Role para saltar RLS de perfiles
  const adminClient = getServerSupabase(request, true);
  const { data: profile, error: profileError } = await adminClient
    .from('user_profiles')
    .select('department, has_vault_access')
    .eq('user_id', user.id)
    .single();

  if (profileError || !profile) {
    console.error(`Vault Auth: No se encontró perfil para ${email}`, profileError);
    return false;
  }

  const hasAccess = profile.has_vault_access === true || 
                   ['Mercadeo', 'Comunicaciones'].includes(profile.department);
                   
  if (!hasAccess) {
    console.warn(`Vault Auth: Usuario ${email} denegado. Dept: ${profile.department}, Access: ${profile.has_vault_access}`);
  }

  return hasAccess;
}

function encrypt(text: string) {
  if (!text) return '';
  const secret = getSecret();
  if (!secret) return text; 
  
  try {
    const iv = crypto.randomBytes(16);
    const key = Buffer.from(secret, 'hex');
    const cipher = crypto.createCipheriv(ALGO, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (e) {
    console.error("Encryption error:", e);
    return text;
  }
}

function decrypt(text: string) {
  if (!text) return '';
  if (!text.includes(':')) return text; 
  
  const secret = getSecret();
  if (!secret) return text;

  try {
    const [ivHex, encryptedText] = text.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const key = Buffer.from(secret, 'hex');
    const decipher = crypto.createDecipheriv(ALGO, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error("Decryption error:", err);
    return text; 
  }
}

export const GET: APIRoute = async ({ request }) => {
  const isAuthorized = await verifyApiAuth(request);
  const hasPermission = await checkVaultPermission(request);

  if (!isAuthorized || !hasPermission) {
    return new Response(JSON.stringify({ error: 'No autorizado o sin permisos de bóveda' }), { status: 401 });
  }

  try {
    const serverSupabase = getServerSupabase(request, true); // Bypass RLS

    const { data, error } = await serverSupabase
      .from('vault_credentials')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Vault GET Error:", error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    const decryptedData = (data || []).map(row => ({
      ...row,
      password_hash: decrypt(row.password_hash)
    }));

    return new Response(JSON.stringify({ data: decryptedData }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error("Vault API Crash:", err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request }) => {
  if (!(await verifyApiAuth(request)) || !(await checkVaultPermission(request))) {
    return new Response(JSON.stringify({ error: 'No autorizado para crear credenciales' }), { status: 401 });
  }

  const body = await request.json();
  const { service_name, username, password_hash, url, notes } = body;
  const serverSupabase = getServerSupabase(request, true);

  const { data, error } = await serverSupabase
    .from('vault_credentials')
    .insert([{ 
      service_name, 
      username, 
      password_hash: encrypt(password_hash), 
      url, 
      notes, 
      is_deleted: false 
    }])
    .select();

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  return new Response(JSON.stringify({ data }), { status: 201 });
};

export const PATCH: APIRoute = async ({ request }) => {
  if (!(await verifyApiAuth(request)) || !(await checkVaultPermission(request))) {
    return new Response(JSON.stringify({ error: 'No autorizado para editar' }), { status: 401 });
  }

  const urlParams = new URL(request.url).searchParams;
  const id = urlParams.get('id');
  if (!id) return new Response(JSON.stringify({ error: 'ID requerido' }), { status: 400 });

  const body = await request.json();
  const updateData: any = { ...body };
  const serverSupabase = getServerSupabase(request, true);

  if (updateData.password_hash) {
    updateData.password_hash = encrypt(updateData.password_hash);
  }

  const { data, error } = await serverSupabase
    .from('vault_credentials')
    .update(updateData)
    .eq('id', id)
    .select();

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  return new Response(JSON.stringify({ data }), { status: 200 });
};

export const DELETE: APIRoute = async ({ request }) => {
  if (!(await verifyApiAuth(request)) || !(await checkVaultPermission(request))) {
    return new Response(JSON.stringify({ error: 'No autorizado para eliminar' }), { status: 401 });
  }

  const urlParams = new URL(request.url).searchParams;
  const id = urlParams.get('id');
  if (!id) return new Response(JSON.stringify({ error: 'ID requerido' }), { status: 400 });

  const serverSupabase = getServerSupabase(request, true);
  const { error } = await serverSupabase
    .from('vault_credentials')
    .update({ is_deleted: true })
    .eq('id', id);

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
