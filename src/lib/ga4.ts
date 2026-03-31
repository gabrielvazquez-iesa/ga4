import { BetaAnalyticsDataClient } from '@google-analytics/data';

// src/lib/ga4.ts
const client = new BetaAnalyticsDataClient({
  credentials: {
    client_email: import.meta.env.GA4_CLIENT_EMAIL,
    // Limpia los saltos de línea del .env
    private_key: import.meta.env.GA4_PRIVATE_KEY?.split(String.raw`\n`).join('\n'),
  },
});

export async function getDashboardData() {
  const propertyId = import.meta.env.GA4_PROPERTY_ID;
  const clientEmail = import.meta.env.GA4_CLIENT_EMAIL;
  const privateKey = import.meta.env.GA4_PRIVATE_KEY;

  console.log('--- GA4 Debug Info ---');
  console.log('Property ID:', propertyId);
  console.log('Client Email:', clientEmail);
  console.log('Private Key length:', privateKey?.length || 0);
  
  if (!propertyId || !clientEmail || !privateKey) {
    throw new Error('Missing GA4 Environment Variables');
  }

  try {
    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'month' }],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'bounceRate' },
        { name: 'userEngagementDuration' },
        { name: 'sessions' },
        { name: 'newUsers' },
        { name: 'activeUsers' },
        { name: 'scrolledUsers' },
        { name: 'averageSessionDuration' },
        { name: 'conversions' },
        { name: 'sessionsPerUser' }
      ],
    });
    console.log('GA4 response successfully received');
    return response;
  } catch (error: any) {
    console.error('GA4 runReport Error:', error.message);
    if (error.code) console.error('Error Code:', error.code);
    throw error;
  }
}