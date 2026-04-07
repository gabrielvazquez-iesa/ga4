import type { APIRoute } from 'astro';
import { getGa4Client, propertyId } from '../../lib/ga4-client';
import { verifyApiAuth } from '../../lib/api-auth-server';

export const GET: APIRoute = async ({ request }) => {
  if (!(await verifyApiAuth(request))) return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });

  const client = getGa4Client();
  if (!client || !propertyId) {
    return new Response(JSON.stringify({ error: 'Configuración de Google Analytics faltante o inválida.' }), { status: 500 });
  }

  const url = new URL(request.url);
  const days = parseInt(url.searchParams.get('days') || '30', 10);
  const pathFilter = url.searchParams.get('pathFilter');

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
      dimensions: [{ name: 'dateRange' }],
      dateRanges: [
        { startDate: currentStartDate, endDate: currentEndDate, name: 'current' },
        { startDate: previousStartDate, endDate: previousEndDate, name: 'previous' }
      ],
      dimensionFilter: pathFilter ? {
        filter: {
          fieldName: 'pagePathPlusQueryString',
          stringFilter: {
            matchType: 'CONTAINS',
            value: pathFilter
          }
        }
      } : undefined,
      metrics: [
        { name: 'sessions' },
        { name: 'activeUsers' },
        { name: 'sessionConversionRate' }
      ],
    });

    // Parse the rows
    let currentData = { sessions: 0, activeUsers: 0, conversionRate: 0 };
    let previousData = { sessions: 0, activeUsers: 0, conversionRate: 0 };

    (response.rows || []).forEach(row => {
      const rangeName = row.dimensionValues?.[0]?.value || ''; 
      const sessions = parseInt(row.metricValues?.[0]?.value || '0', 10);
      const activeUsers = parseInt(row.metricValues?.[1]?.value || '0', 10);
      const conversionRate = parseFloat(row.metricValues?.[2]?.value || '0');

      if (rangeName === 'current') {
        currentData = { sessions, activeUsers, conversionRate };
      } else if (rangeName === 'previous') {
        previousData = { sessions, activeUsers, conversionRate };
      }
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
