import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function PresenceManager() {
  useEffect(() => {
    let intervalId: any;

    const updatePresence = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        // Actualizar last_seen
        await supabase
          .from('user_profiles')
          .update({ last_seen: new Date().toISOString() })
          .eq('user_id', session.user.id);
          
      } catch (error) {
        console.error('Presence error:', error);
      }
    };

    // Ejecutar inmediatamente al montar
    updatePresence();

    // Actualizar cada 4 minutos (un poco antes del umbral de 5 min)
    intervalId = setInterval(updatePresence, 1000 * 60 * 4);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return null; // Componente invisible
}
