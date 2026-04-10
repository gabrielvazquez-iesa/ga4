import type { APIRoute } from 'astro';
import { getGa4Client, propertyId } from '../../lib/ga4-client';
import { verifyApiAuth } from '../../lib/api-auth-server';

export const GET: APIRoute = async ({ request }) => {
  if (!(await verifyApiAuth(request))) return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });

  const client = getGa4Client();
  if (!client || !propertyId) {
    return new Response(JSON.stringify({ error: 'Configuración de GA4 faltante.' }), { status: 500 });
  }

  const url = new URL(request.url);
  const days = parseInt(url.searchParams.get('days') || '30', 10);

  try {
    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
      dimensions: [{ name: 'sessionDefaultChannelGroup' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' }
      ],
    });

    const rows = response.rows?.map(row => ({
      channel: row.dimensionValues?.[0]?.value || 'Other',
      users: Number(row.metricValues?.[0]?.value || 0),
      sessions: Number(row.metricValues?.[1]?.value || 0),
    })) || [];

    return new Response(JSON.stringify({ data: rows }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
