-- ==============================================================================
-- 🛡️ SECURITY PATCH 2026 - GA4 DASHBOARD
-- Este script corrige las vulnerabilidades de RLS detectadas.
-- ==============================================================================

-- 1. ACTIVAR RLS EN TABLAS VULNERABLES
ALTER TABLE IF EXISTS public.ga4_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. ELIMINAR CUALQUIER POLÍTICA ANTIGUA PERMISIVA (POR PRECAUCIÓN)
DROP POLICY IF EXISTS "Public can view settings" ON public.ga4_settings;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

-- 3. DEFINIR POLÍTICAS SEGURAS PARA GA4_SETTINGS
-- Permitir que cualquier usuario autenticado vea la configuración
CREATE POLICY "Auth users can view settings" 
  ON public.ga4_settings FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Solo administradores pueden modificar la configuración
CREATE POLICY "Admins can manage settings" 
  ON public.ga4_settings FOR ALL 
  USING (
    auth.jwt() ->> 'email' IN ('admin@iesa.edu.ve', 'gabriel.vazquez@iesa.edu.ve')
  );

-- 4. DEFINIR POLÍTICAS SEGURAS PARA PROFILES
-- Permitir ver perfiles a usuarios autenticados
CREATE POLICY "Auth users can view profiles" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Solo el dueño del perfil o admin puede editarlo
CREATE POLICY "Users can manage their own profile" 
  ON public.profiles FOR ALL 
  USING (
    auth.uid() = id OR 
    auth.jwt() ->> 'email' IN ('admin@iesa.edu.ve', 'gabriel.vazquez@iesa.edu.ve')
  );

-- ==============================================================================
-- ✅ PARCHE APLICADO CORRECTAMENTE
-- ==============================================================================
