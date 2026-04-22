-- ==========================================
-- 📱 SOCIAL MEDIA PLANNER SCHEMA
-- ==========================================

-- 1. Crear la tabla de publicaciones
CREATE TABLE IF NOT EXISTS public.social_media_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  status TEXT CHECK (status IN ('Por Hacer', 'En Progreso', 'En Revisión', 'Programado', 'Completado')) DEFAULT 'Por Hacer',
  platform TEXT CHECK (platform IN ('Instagram', 'Facebook', 'X', 'LinkedIn', 'TikTok', 'YouTube', 'Threads')) DEFAULT 'Instagram',
  scheduled_at TIMESTAMPTZ,
  media_url TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES public.user_profiles(user_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Activar Row Level Security
ALTER TABLE public.social_media_posts ENABLE ROW LEVEL SECURITY;

-- 3. Definir políticas de acceso
-- Todos los usuarios autenticados pueden ver las publicaciones de planificación
CREATE POLICY "Auth users can view social posts" 
    ON public.social_media_posts FOR SELECT 
    USING (auth.uid() IS NOT NULL);

-- Los usuarios de Mercadeo, Comunicaciones y Admins pueden crear y editar
CREATE POLICY "Authorized users can manage social posts" 
    ON public.social_media_posts FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE public.user_profiles.user_id = auth.uid() 
            AND (
                public.user_profiles.department IN ('Mercadeo', 'Comunicaciones') 
                OR public.user_profiles.email IN ('gabriel.vazquez@iesa.edu.ve', 'admin@iesa.edu.ve')
            )
        )
    );

-- 4. Trigger para actualizar el campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_social_media_posts_updated_at
BEFORE UPDATE ON public.social_media_posts
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();
