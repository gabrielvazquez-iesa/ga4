-- migration_color.sql
-- Ejecuta este script en el editor SQL de Supabase para habilitar la característica de colores de perfil personalizados.

ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS custom_color TEXT;

COMMENT ON COLUMN public.user_profiles.custom_color IS 'Color hexadecimal personalizado elegido por el usuario para ser identificado visualmente en el planificador de redes sociales.';

-- Añadir políticas RLS (Row Level Security) para permitir que los usuarios configuren y editen su perfil
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 1. Permitir lectura de perfiles a todos los usuarios autenticados
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.user_profiles;
CREATE POLICY "Profiles are viewable by everyone" 
ON public.user_profiles FOR SELECT 
USING (true);

-- 2. Permitir inserción solo a dueños de su propio perfil
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
CREATE POLICY "Users can insert their own profile" 
ON public.user_profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 3. Permitir actualización solo a dueños de su propio perfil
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" 
ON public.user_profiles FOR UPDATE 
USING (auth.uid() = user_id);
