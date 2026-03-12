import { BetaAnalyticsDataClient } from '@google-analytics/data';

// src/lib/ga4.ts
const client = new BetaAnalyticsDataClient({
  credentials: {
    client_email: import.meta.env.GA4_CLIENT_EMAIL,
    // Esta línea es la que limpia los saltos de línea del .env
    private_key: import.meta.env.GA4_PRIVATE_KEY?.split(String.raw`\n`).join('\n'),
  },
});

export async function getDashboardData() {
  console.log("Intentando conectar con el correo:", import.meta.env.GA4_CLIENT_EMAIL);
  
  const [response] = await client.runReport({
    property: `properties/${import.meta.env.GA4_PROPERTY_ID}`,
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'date' }],
    metrics: [
      { name: 'activeUsers' },
      { name: 'sessions' },
      { name: 'screenPageViews' }
    ],
  });

  return response;
}