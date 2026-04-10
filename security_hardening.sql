-- ==============================================================================
-- 🛡️ SECURITY HARDENING SCRIPT v1.0
-- Este script corrige las vulnerabilidades detectadas de acceso público,
-- forzando Row-Level Security (RLS) estricto en todas las tablas del sistema.
-- ==============================================================================

-- 1. ACTIVAR RLS EN TODAS LAS TABLAS DE FORMA EXPLÍCITA
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duty_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duty_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.process_manuals ENABLE ROW LEVEL SECURITY;


-- 2. ELIMINAR POLÍTICAS PÚBLICAS PELIGROSAS "USING (true)"
-- Buscamos cualquier política que permita el acceso indiscriminado y la borramos.
DROP POLICY IF EXISTS "Public profiles are visible to authenticated users" ON public.user_profiles;
DROP POLICY IF EXISTS "Everyone can view shifts" ON public.duty_shifts;
DROP POLICY IF EXISTS "Everyone can view audit logs" ON public.duty_audit_logs;
DROP POLICY IF EXISTS "Cualquiera puede ver manuales" ON public.process_manuals;


-- 3. RECREAR POLÍTICAS SEGURAS (SOLO USUARIOS AUTENTICADOS)

-- ==========================================
-- USER PROFILES (Lectura solo por auth, edición solo personal/admin)
-- ==========================================
CREATE POLICY "Auth users can view all profiles" 
  ON public.user_profiles FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- ==========================================
-- VAULT CREDENTIALS (Crítico: Solo Mercadeo/Comunicaciones/Admin)
-- ==========================================
-- (Mantenemos la política existente ya que evaluaba correctamente roles/departamento, 
-- pero nos aseguramos que no haya una genérica que la anule)
DROP POLICY IF EXISTS "Anyone can view vault" ON public.vault_credentials; -- Por precaución

-- ==========================================
-- DUTY SHIFTS (Guardias)
-- ==========================================
CREATE POLICY "Auth users can view shifts" 
  ON public.duty_shifts FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- ==========================================
-- DUTY AUDIT LOGS (Auditoría)
-- ==========================================
CREATE POLICY "Auth users can view audit logs" 
  ON public.duty_audit_logs FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- ==========================================
-- PROCESS MANUALS (Manuales)
-- ==========================================
CREATE POLICY "Auth users can view manuals" 
  ON public.process_manuals FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- ==========================================
-- CIERRE: AVISO CONSOLA
-- ==========================================
-- Si se ejecuta correctamente, todas las advertencias "Table publicly accessible"
-- en el panel de Supabase deberían resolverse en el próximo escaneo.
