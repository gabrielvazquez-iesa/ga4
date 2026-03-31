-- ==========================================
-- 0. INICIALIZACIÓN DE ESQUEMA (Solo si da error de "column does not exist")
-- ==========================================
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS has_vault_access BOOLEAN DEFAULT FALSE;

-- 0.2. TABLAS DE GUARDIA (Si fallan por schema cache)
CREATE TABLE IF NOT EXISTS public.duty_shifts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    shift_type TEXT CHECK (shift_type IN ('day', 'week', 'weekend')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.duty_audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shift_id UUID REFERENCES public.duty_shifts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(user_id),
    action TEXT,
    old_value JSONB,
    new_value JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Asegurar permisos RLS (Ejecutar de nuevo si es necesario)
ALTER TABLE public.duty_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duty_audit_logs ENABLE ROW LEVEL SECURITY;

GRANT ALL ON public.duty_shifts TO postgres, authenticated, service_role;
GRANT ALL ON public.duty_audit_logs TO postgres, authenticated, service_role;

-- ==========================================
-- IESA GA4 DASHBOARD — UTILIDADES SQL
-- ==========================================

-- ─────────────────────────────────────────
-- 0. CORRECCIÓN DE VISIBILIDAD DE USUARIOS
-- ─────────────────────────────────────────
-- Si en el Directorio de Usuarios solo apareces tú mismo, ejecuta esto:
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.user_profiles;
CREATE POLICY "Authenticated users can view all profiles"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);
-- (Después ve a Supabase → API Settings → Reload Schema Cache)

-- ─────────────────────────────────────────
-- 0.1. COLUMNAS OPCIONALES
-- ─────────────────────────────────────────

-- 1. CONFIRMAR UN USUARIO MANUALMENTE (Bypass de email)
-- Ejecuta este comando en el SQL Editor de Supabase reemplazando el correo.
UPDATE auth.users 
SET email_confirmed_at = NOW(), 
    last_sign_in_at = NOW() 
WHERE email = 'usuario@iesa.edu.ve';


-- 2. ASIGNAR PERMISOS DE BÓVEDA Y DEPARTAMENTO
-- Esto asegura que el usuario pueda entrar a la bóveda de contraseñas.
INSERT INTO public.user_profiles (user_id, display_name, department, has_vault_access)
SELECT id, 'Nombre del Usuario', 'Mercadeo', true 
FROM auth.users 
WHERE email = 'usuario@iesa.edu.ve'
ON CONFLICT (user_id) DO UPDATE 
SET department = 'Mercadeo', has_vault_access = true;


-- 3. VER TODOS LOS USUARIOS Y SUS ESTADOS
SELECT 
  u.email, 
  u.email_confirmed_at, 
  p.display_name, 
  p.department, 
  p.has_vault_access
FROM auth.users u
LEFT JOIN public.user_profiles p ON u.id = p.user_id;


-- 4. CONVERTIR EN ADMINISTRADOR (Para acceso a Gestión de Usuarios)
-- Los administradores están definidos por hardcode en el código (Sidebar.tsx),
-- pero puedes usar este correo para tener privilegios: admin@iesa.edu.ve

-- ==========================================
-- 5. CAMBIAR CONTRASEÑA (via Hash bcrypt)
-- ==========================================
-- Las contraseñas en Supabase NO se pueden cambiar con un UPDATE simple (texto plano).
-- Usa este método oficial:
UPDATE auth.users
SET encrypted_password = crypt('TESTdashboard123*', gen_salt('bf'))
WHERE email = 'test@iesa.edu.ve';
