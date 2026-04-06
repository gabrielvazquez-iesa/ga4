-- ========================================================
-- 1. SINCRONIZADOR AUTOMATICO DE USUARIOS A user_profiles
-- ========================================================
-- Este script jala a todos los usuarios que alguna vez se registraron
-- y los mete en la tabla user_profiles para que salgan en el Gestor.

INSERT INTO public.user_profiles (user_id, display_name, department)
SELECT 
    id, 
    raw_user_meta_data->>'full_name', 
    raw_user_meta_data->>'department'
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- Trigger automático para usuarios futuros:
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, display_name, department)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name', 
    NEW.raw_user_meta_data->>'department'
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================================
-- 2. TABLA DE MANUALES DE PROCESOS
-- ========================================================

CREATE TABLE IF NOT EXISTS public.process_manuals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    file_url TEXT NOT NULL,
    uploaded_by UUID REFERENCES public.user_profiles(user_id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Asegurar permisos
ALTER TABLE public.process_manuals ENABLE ROW LEVEL SECURITY;

-- Limpiar políticas existentes antes de recrearlas
DROP POLICY IF EXISTS "Cualquiera puede ver manuales" ON public.process_manuals;
DROP POLICY IF EXISTS "Auth puede insertar manuales" ON public.process_manuals;
DROP POLICY IF EXISTS "Solo admins pueden actualizar manuales" ON public.process_manuals;
DROP POLICY IF EXISTS "Solo admins pueden borrar manuales" ON public.process_manuals;

CREATE POLICY "Cualquiera puede ver manuales" 
ON public.process_manuals FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Auth puede insertar manuales" 
ON public.process_manuals FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Solo admins pueden actualizar manuales" 
ON public.process_manuals FOR UPDATE 
USING (auth.jwt() ->> 'email' IN ('admin@iesa.edu.ve', 'gabriel.vazquez@iesa.edu.ve'));

CREATE POLICY "Solo admins pueden borrar manuales" 
ON public.process_manuals FOR DELETE 
USING (auth.jwt() ->> 'email' IN ('admin@iesa.edu.ve', 'gabriel.vazquez@iesa.edu.ve'));

-- ========================================================
-- 3. POLÍTICAS PARA GESTIÓN DE PERFILES
-- ========================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Limpiar políticas existentes
DROP POLICY IF EXISTS "Cualquiera puede ver perfiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins pueden actualizar perfiles" ON public.user_profiles;

CREATE POLICY "Cualquiera puede ver perfiles" 
ON public.user_profiles FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins pueden actualizar perfiles" 
ON public.user_profiles FOR UPDATE 
USING (
  auth.jwt() ->> 'email' IN ('admin@iesa.edu.ve', 'gabriel.vazquez@iesa.edu.ve')
)
WITH CHECK (
  auth.jwt() ->> 'email' IN ('admin@iesa.edu.ve', 'gabriel.vazquez@iesa.edu.ve')
);



