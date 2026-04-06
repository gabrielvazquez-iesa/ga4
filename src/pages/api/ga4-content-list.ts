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

  if (!pathFilter) {
    return new Response(JSON.stringify({ error: 'Falta pathFilter' }), { status: 400 });
  }

  try {
    const [[currentRes], [prevRes]] = await Promise.all([
      client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
        dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
        metrics: [
          { name: 'screenPageViews' },
          { name: 'averageSessionDuration' }
        ],
        dimensionFilter: {
          filter: {
            fieldName: 'pagePathPlusQueryString',
            stringFilter: {
              matchType: 'CONTAINS',
              value: pathFilter
            }
          }
        },
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 100, // Top 100 articles
      }),
      client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: `${days * 2}daysAgo`, endDate: `${days + 1}daysAgo` }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'screenPageViews' }],
        dimensionFilter: {
          filter: {
            fieldName: 'pagePathPlusQueryString',
            stringFilter: {
              matchType: 'CONTAINS',
              value: pathFilter
            }
          }
        },
        limit: 1000,
      })
    ]);

    const prevMap = new Map();
    prevRes.rows?.forEach((r: any) => {
      const path = r.dimensionValues?.[0]?.value || '';
      const views = Number(r.metricValues?.[0]?.value || 0);
      prevMap.set(path, views);
    });

    const rows = currentRes.rows?.map((row: any) => {
      const path = row.dimensionValues?.[0]?.value || '';
      const title = row.dimensionValues?.[1]?.value || '';
      const views = Number(row.metricValues?.[0]?.value || 0);
      const prevViews = prevMap.get(path) || 0;
      
      let trend = 0;
      if (prevViews > 0) trend = ((views - prevViews) / prevViews) * 100;
      else if (views > 0 && prevViews === 0) trend = 100;

      return {
        path,
        title: title.split('|')[0].trim(), // Clean up exact page title before the pipe if any
        views,
        avgDuration: Number(row.metricValues?.[1]?.value || 0),
        trend
      };
    }) || [];

    const filteredRows = rows.filter(r => 
      r.path !== pathFilter && 
      r.path !== `${pathFilter}/`
    );

    return new Response(JSON.stringify({ data: filteredRows }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error: any) {
    console.error('GA4 Content List API Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
