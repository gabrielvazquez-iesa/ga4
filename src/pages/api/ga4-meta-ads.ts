import type { APIRoute } from 'astro';
import { getGa4Client, propertyId } from '../../lib/ga4-client';
import { verifyApiAuth } from '../../lib/api-auth-server';

export const GET: APIRoute = async ({ request }) => {
  if (!(await verifyApiAuth(request))) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  const client = getGa4Client();
  const metaAdsPropertyId = import.meta.env.GA4_META_ADS_PROPERTY_ID || propertyId;

  if (!client || !metaAdsPropertyId) {
    return new Response(JSON.stringify({ error: 'Configuración de GA4 (Property ID) faltante' }), { status: 500 });
  }

  try {
    const [response] = await client.runReport({
      property: `properties/${metaAdsPropertyId}`,
      dateRanges: [{ startDate: '2025-01-01', endDate: 'today' }],
      dimensions: [
        { name: 'sessionSource' },
        { name: 'sessionMedium' },
        { name: 'sessionCampaignName' },
        { name: 'sessionManualAdContent' },
        { name: 'sessionManualTerm' }
      ],
      metrics: [
        { name: 'sessions' },
        { name: 'activeUsers' }
      ],
      dimensionFilter: {
        filter: {
          fieldName: 'pagePath',
          stringFilter: {
            matchType: 'CONTAINS',
            value: '/publish/comunicaciones/meta-ads.html'
          }
        }
      }
    });

    const rows = response.rows?.map(row => ({
      source: row.dimensionValues?.[0]?.value || '(not set)',
      medium: row.dimensionValues?.[1]?.value || '(not set)',
      campaign: row.dimensionValues?.[2]?.value || '(not set)',
      content: row.dimensionValues?.[3]?.value || '(not set)',
      term: row.dimensionValues?.[4]?.value || '(not set)',
      sessions: Number(row.metricValues?.[0]?.value || 0),
      users: Number(row.metricValues?.[1]?.value || 0),
    })) || [];

    // Sort by sessions descending
    rows.sort((a, b) => b.sessions - a.sessions);

    return new Response(JSON.stringify({ success: true, data: rows }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Meta Ads API Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
