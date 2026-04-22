-- ==============================================================================
-- 🚀 SOCIAL MEDIA PLANNER V2 - MIGRATION
-- Estas modificaciones expanden las capacidades del planificador.
-- ==============================================================================

-- 1. ACTUALIZAR RESTRICCIÓN DE PLATAFORMAS
-- Eliminamos la restricción antigua y añadimos la nueva que incluye 'Página Web'
ALTER TABLE public.social_media_posts 
DROP CONSTRAINT IF EXISTS social_media_posts_platform_check;

ALTER TABLE public.social_media_posts 
ADD CONSTRAINT social_media_posts_platform_check 
CHECK (platform IN ('Instagram', 'Facebook', 'X', 'LinkedIn', 'TikTok', 'YouTube', 'Threads', 'Página Web'));

-- 2. AÑADIR COLUMNA DE CATEGORÍA / ÁREA
-- La categoría no es obligatoria (opcional) según lo solicitado.
ALTER TABLE public.social_media_posts 
ADD COLUMN IF NOT EXISTS category TEXT 
CHECK (category IN ('Diseño gráfico', 'Desarrollo web', 'Comunicador social', 'Otro', 'General')) 
DEFAULT 'General';

-- 3. AÑADIR COLUMNA PARA SINCRONIZACIÓN EXTERNA (Futuro Google Sheets)
ALTER TABLE public.social_media_posts 
ADD COLUMN IF NOT EXISTS external_id TEXT;

-- ==============================================================================
-- ✅ MIGRACIÓN PREPARADA
-- ==============================================================================
