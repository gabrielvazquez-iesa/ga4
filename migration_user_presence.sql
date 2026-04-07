-- 1. Agregar columna last_seen para rastrear actividad
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ DEFAULT NOW();

-- 2. Asegurar que los usuarios puedan actualizar su propio last_seen
-- (Normalmente ya pueden si tienen permiso de UPDATE en su propio perfil, pero esto lo hace explícito)
CREATE POLICY "Users can update their own presence" 
  ON public.user_profiles FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Comentario para utilidad
COMMENT ON COLUMN public.user_profiles.last_seen IS 'Almacena el último momento en que el usuario estuvo activo en la interfaz.';
