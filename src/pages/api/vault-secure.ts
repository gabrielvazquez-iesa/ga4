import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { verifyApiAuth } from '../../lib/api-auth-server';
import crypto from 'crypto';

// Encryption Config
const ALGO = 'aes-256-cbc';

function getSecret() {
  return process.env.VAULT_SECRET_KEY || import.meta.env.VAULT_SECRET_KEY || '';
}

function getServerSupabase(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.split(' ')[1];

  return createClient(
    import.meta.env.PUBLIC_SUPABASE_URL || '',
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '',
    {
      global: {
        headers: { Authorization: `Bearer ${token}` }
      }
    }
  );
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
  if (!(await verifyApiAuth(request))) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  const serverSupabase = getServerSupabase(request);

  const { data, error } = await serverSupabase
    .from('vault_credentials')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  const decryptedData = (data || []).map(row => ({
    ...row,
    password_hash: decrypt(row.password_hash)
  }));

  return new Response(JSON.stringify({ data: decryptedData }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

export const POST: APIRoute = async ({ request }) => {
  if (!(await verifyApiAuth(request))) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  const body = await request.json();
  const { service_name, username, password_hash, url, notes } = body;
  const serverSupabase = getServerSupabase(request);

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
  if (!(await verifyApiAuth(request))) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  const urlParams = new URL(request.url).searchParams;
  const id = urlParams.get('id');
  if (!id) return new Response(JSON.stringify({ error: 'ID requerido' }), { status: 400 });

  const body = await request.json();
  const updateData: any = { ...body };
  const serverSupabase = getServerSupabase(request);

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
  if (!(await verifyApiAuth(request))) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  const urlParams = new URL(request.url).searchParams;
  const id = urlParams.get('id');
  if (!id) return new Response(JSON.stringify({ error: 'ID requerido' }), { status: 400 });

  const serverSupabase = getServerSupabase(request);
  const { error } = await serverSupabase
    .from('vault_credentials')
    .update({ is_deleted: true })
    .eq('id', id);

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
