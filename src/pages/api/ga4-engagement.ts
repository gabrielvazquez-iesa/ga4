import type { APIRoute } from 'astro';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

const client = new BetaAnalyticsDataClient({
  credentials: {
    client_email: import.meta.env.GA4_CLIENT_EMAIL,
    private_key: import.meta.env.GA4_PRIVATE_KEY?.split(String.raw`\n`).join('\n'),
  },
});

import { verifyApiAuth } from '../../lib/api-auth-server';

export const GET: APIRoute = async ({ request }) => {
  if (!(await verifyApiAuth(request))) return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });

  const url = new URL(request.url);
  const days = parseInt(url.searchParams.get('days') || '30', 10);
  const pathFilter = url.searchParams.get('pathFilter');
  const propertyId = import.meta.env.GA4_PROPERTY_ID;

  if (!propertyId) {
    return new Response(JSON.stringify({ error: 'Configuración GA4 faltante' }), { status: 500 });
  }

  try {
    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [
        { name: 'averageSessionDuration' },
        { name: 'userEngagementDuration' },
        { name: 'eventCount' }
      ],
      // Filter by click, purchase or register to measure interaction
      dimensionFilter: pathFilter ? {
        andGroup: {
          expressions: [
            {
              filter: {
                fieldName: 'eventName',
                inListFilter: { values: ['click', 'purchase', 'sign_up'] }
              }
            },
            {
              filter: {
                fieldName: 'pagePathPlusQueryString',
                stringFilter: { matchType: 'CONTAINS', value: pathFilter }
              }
            }
          ]
        }
      } : {
        filter: {
          fieldName: 'eventName',
          inListFilter: {
            values: ['click', 'purchase', 'sign_up'],
          }
        }
      },
      orderBys: [{ metric: { metricName: 'userEngagementDuration' }, desc: true }],
      limit: 50,
    });

    const rows = response.rows?.map(row => {
      const path = row.dimensionValues?.[0]?.value || '';
      const avgDuration = Number(row.metricValues?.[0]?.value || 0);
      const engDuration = Number(row.metricValues?.[1]?.value || 0);
      const events = Number(row.metricValues?.[2]?.value || 0);
      
      // Lógica de Score de Efectividad (0-100)
      // Basado libremente en duration y events. Normalmente normalizaríamos al máximo valor, pero aquí usamos un cálculo seguro:
      let score = Math.min(100, Math.round((events * 1.5) + (avgDuration / 10)));
      if (score < 0) score = 0;

      return { path, avgDuration, engDuration, events, score };
    }) || [];

    return new Response(JSON.stringify({ data: rows }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error: any) {
    console.error('GA4 Engagement API Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
