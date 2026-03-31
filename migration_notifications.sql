-- Agrega la columna de usuario específico para permitir notificaciones personalizadas
ALTER TABLE public.system_notifications 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'info';

-- Actualizar las políticas de seguridad
DROP POLICY IF EXISTS "Admins can manage notifications" ON public.system_notifications;

-- Política para lectura: Los usuarios ven las globales (user_id IS NULL) o las propias
CREATE POLICY "Users can view own or global notifications" 
ON public.system_notifications FOR SELECT 
USING (user_id = auth.uid() OR user_id IS NULL);

-- Política para escritura (Admin): Los admins pueden insertar y borrar
CREATE POLICY "Admins can manage notifications" 
ON public.system_notifications FOR ALL 
USING (auth.jwt() ->> 'email' IN ('admin@iesa.edu.ve', 'gabriel.vazquez@iesa.edu.ve'));
