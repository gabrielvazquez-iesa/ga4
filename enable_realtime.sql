-- Asegurar que la tabla tiene replica identity FULL para enviar todos los datos en Realtime
ALTER TABLE public.system_notifications REPLICA IDENTITY FULL;

-- Añadir la tabla a la publicación de tiempo real de Supabase
-- Nota: Si la publicación 'supabase_realtime' ya existe, esto la añadirá.
-- Si recibes un error de "already exists", es normal.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'system_notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.system_notifications;
  END IF;
END $$;
