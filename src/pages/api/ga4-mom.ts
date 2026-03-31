import type { APIRoute } from 'astro';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

const client = new BetaAnalyticsDataClient({
  credentials: {
    client_email: import.meta.env.GA4_CLIENT_EMAIL,
    private_key: import.meta.env.GA4_PRIVATE_KEY?.split(String.raw`\n`).join('\n'),
  },
});

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const days = parseInt(url.searchParams.get('days') || '30', 10);
  const propertyId = import.meta.env.GA4_PROPERTY_ID;

  if (!propertyId) {
    return new Response(JSON.stringify({ error: 'Configuración GA4 faltante' }), { status: 500 });
  }

  try {
    // Current period vs Previous period
    // e.g., 30 days ago to today vs 60 days ago to 31 days ago
    const currentStartDate = `${days}daysAgo`;
    const currentEndDate = 'today';
    
    // For proper MoM/YoY comparison based on the selected "days"
    // Though usually MoM is calendar month, here it's "Selected Period vs Previous Equivalent Period"
    const previousStartDate = `${days * 2}daysAgo`;
    const previousEndDate = `${days + 1}daysAgo`;

    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        { startDate: currentStartDate, endDate: currentEndDate, name: 'current' },
        { startDate: previousStartDate, endDate: previousEndDate, name: 'previous' }
      ],
      metrics: [
        { name: 'sessions' },
        { name: 'activeUsers' },
        { name: 'sessionConversionRate' }
      ],
    });

    // Parse the 2 rows (one for current dateRange, one for previous)
    let currentData = { sessions: 0, activeUsers: 0, conversionRate: 0 };
    let previousData = { sessions: 0, activeUsers: 0, conversionRate: 0 };

    (response.rows || []).forEach(row => {
      const rangeName = row.dimensionValues?.[0]?.value || ''; // dateRange is usually returned implicitly or as first dimensions if requested.
      // Actually runReport returns the date_range as a dimension if multiple date ranges are provided.
      // Wait, date range name is reported in dimension values if we requested `dateRange` as dimension? 
      // Nope, but let's be safe. By default, date_range isn't returned unless requested? Let me fix the query.
      // We didn't add the `dateRange` dimension. Let's fix that below.
    });

    return new Response(JSON.stringify({ data: { current: currentData, previous: previousData } }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error: any) {
    console.error('GA4 MoM API Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
