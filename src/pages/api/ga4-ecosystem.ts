import type { APIRoute } from 'astro';
import { getGa4Client, propertyId } from '../../lib/ga4-client';
import { verifyApiAuth } from '../../lib/api-auth-server';

export const GET: APIRoute = async ({ request }) => {
  if (!(await verifyApiAuth(request))) return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });

  const client = getGa4Client();
  if (!client || !propertyId) {
    return new Response(JSON.stringify({ error: 'Configuración de GA4 faltante' }), { status: 500 });
  }

  try {
    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '2025-01-01', endDate: 'today' }],
      dimensions: [
        { name: 'hostName' },
        { name: 'sessionDefaultChannelGroup' },
        { name: 'year' }
      ],
      metrics: [
        { name: 'sessions' },
        { name: 'activeUsers' },
        { name: 'averageSessionDuration' }
      ],
    });

    const ecosystemData: Record<string, any> = {};

    response.rows?.forEach(row => {
      const hostname = row.dimensionValues?.[0]?.value || 'Desconocido';
      const channel = row.dimensionValues?.[1]?.value?.toLowerCase() || '';
      const year = row.dimensionValues?.[2]?.value || '2025';
      
      const sessions = Number(row.metricValues?.[0]?.value || 0);
      const users = Number(row.metricValues?.[1]?.value || 0);
      const avgDuration = Number(row.metricValues?.[2]?.value || 0);

      if (!ecosystemData[hostname]) {
        ecosystemData[hostname] = {
          name: hostname,
          y2025: { organic: 0, direct: 0, referral: 0, users: 0, avgDuration: 0, totalSessions: 0, count: 0 },
          y2026: { organic: 0, direct: 0, referral: 0, users: 0, avgDuration: 0, totalSessions: 0, count: 0 }
        };
      }

      const yearKey = `y${year}` as 'y2025' | 'y2026';
      if (!ecosystemData[hostname][yearKey]) return;

      const yearData = ecosystemData[hostname][yearKey];
      
      yearData.totalSessions += sessions;
      yearData.users += users; // Note: Summing users across channels/rows is an approximation in GA4 API reports
      yearData.avgDuration = (yearData.avgDuration * yearData.count + avgDuration) / (yearData.count + 1);
      yearData.count += 1;

      if (channel.includes('organic search')) {
        yearData.organic += sessions;
      } else if (channel.includes('direct')) {
        yearData.direct += sessions;
      } else if (channel.includes('referral')) {
        yearData.referral += sessions;
      }
    });

    const result = Object.values(ecosystemData).map(item => {
      // Format avgDuration to minutes/seconds
      const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}m ${secs}s`;
      };

      return {
        ...item,
        y2025: { ...item.y2025, avgDurationFormatted: formatTime(item.y2025.avgDuration) },
        y2026: { ...item.y2026, avgDurationFormatted: formatTime(item.y2026.avgDuration) }
      };
    }).sort((a, b) => (b.y2026.totalSessions + b.y2025.totalSessions) - (a.y2026.totalSessions + a.y2025.totalSessions));

    return new Response(JSON.stringify({ success: true, data: result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Ecosystem API Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
