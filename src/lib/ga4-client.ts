import { BetaAnalyticsDataClient } from '@google-analytics/data';

/**
 * Limpia y formatea la llave privada de GA4 para que funcione en Vercel y Local.
 */
function formatPrivateKey(key: string | undefined): string | undefined {
  if (!key) return undefined;
  
  // 1. Quitar comillas accidentales
  let formattedKey = key.replace(/^"|"$/g, '');
  
  // 2. Reemplazar \n literales por saltos de línea reales
  formattedKey = formattedKey.replace(/\\n/g, '\n');
  
  return formattedKey;
}

export const clientEmail = import.meta.env.GA4_CLIENT_EMAIL;
export const privateKey = formatPrivateKey(import.meta.env.GA4_PRIVATE_KEY);

let gaClient: BetaAnalyticsDataClient | null = null;

/**
 * Obtiene una instancia del cliente de GA4. 
 * Si fallan las credenciales, devuelve null en lugar de colgar el servidor.
 */
export function getGa4Client() {
  if (gaClient) return gaClient;

  if (!clientEmail || !privateKey) {
    console.error("GA4 Client: Missing credentials. Check GA4_CLIENT_EMAIL and GA4_PRIVATE_KEY in Environment Variables.");
    return null;
  }

  try {
    gaClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
    });
    return gaClient;
  } catch (err) {
    console.error("GA4 Client: Initialization failed", err);
    return null;
  }
}

export const propertyId = import.meta.env.GA4_PROPERTY_ID;
