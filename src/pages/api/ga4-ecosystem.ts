import type { APIRoute } from 'astro';
import { getGa4Client, propertyId as mainPropertyId } from '../../lib/ga4-client';
import { verifyApiAuth } from '../../lib/api-auth-server';
import { supabase } from '../../lib/supabase';

export const GET: APIRoute = async ({ request }) => {
  if (!(await verifyApiAuth(request))) return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });

  const client = getGa4Client();
  if (!client || !mainPropertyId) {
    return new Response(JSON.stringify({ error: 'Configuración de GA4 faltante' }), { status: 500 });
  }

  try {
    // 1. Fetch additional properties from DB
    const { data: dbProperties, error: dbError } = await supabase.from('ga4_properties').select('name, property_id');
    
    if (dbError) {
      console.error("Supabase Error fetching properties:", dbError);
    }

    const propertiesToQuery = [
      { name: 'IESA Principal', property_id: mainPropertyId },
      ...(dbProperties || [])
    ];
    
    console.log(`Ecosystem API: Loading data for ${propertiesToQuery.length} properties.`);

    const ecosystemData: Record<string, any> = {};
    const propertyErrors: string[] = [];

    // 3. Run reports for each property
    // We use Promise.all to run them in parallel
    const reports = await Promise.all(propertiesToQuery.map(async (prop) => {
      try {
        const [response] = await client.runReport({
          property: `properties/${prop.property_id}`,
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
        
        // If response has no rows, it might be that there's no data for the range
        if (!response.rows || response.rows.length === 0) {
          console.warn(`No data for property ${prop.name} (${prop.property_id}) in 2025-2026.`);
        }

        return { prop, response, error: null };
      } catch (err: any) {
        console.error(`Error querying property ${prop.name} (${prop.property_id}):`, err);
        return { prop, response: null, error: `${prop.name}: ${err.message}` };
      }
    }));

    // 4. Process all reports
    reports.forEach(({ prop, response, error }) => {
      if (error) {
        propertyErrors.push(error);
        return;
      }
      if (!response) return;

      response.rows?.forEach(row => {
        const hostname = row.dimensionValues?.[0]?.value || 'Desconocido';
        const channel = row.dimensionValues?.[1]?.value?.toLowerCase() || '';
        const year = row.dimensionValues?.[2]?.value || '2025';
        
        const sessions = Number(row.metricValues?.[0]?.value || 0);
        const users = Number(row.metricValues?.[1]?.value || 0);
        const avgDuration = Number(row.metricValues?.[2]?.value || 0);

        // We use a unique key combining property name and hostname to avoid collisions
        // but if it's the main property, we just use the hostname for cleaner view
        const entryKey = prop.property_id === mainPropertyId ? hostname : `${prop.name} (${hostname})`;
        const displayName = prop.property_id === mainPropertyId ? hostname : `${prop.name}`;

        if (!ecosystemData[entryKey]) {
          ecosystemData[entryKey] = {
            id: entryKey,
            name: displayName,
            hostname: hostname,
            propertyName: prop.name,
            isMain: prop.property_id === mainPropertyId,
            y2025: { organic: 0, direct: 0, referral: 0, users: 0, avgDuration: 0, totalSessions: 0, count: 0 },
            y2026: { organic: 0, direct: 0, referral: 0, users: 0, avgDuration: 0, totalSessions: 0, count: 0 }
          };
        }

        const yearKey = `y${year}` as 'y2025' | 'y2026';
        if (!ecosystemData[entryKey][yearKey]) return;

        const yearData = ecosystemData[entryKey][yearKey];
        
        yearData.totalSessions += sessions;
        yearData.users += users; 
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
    });

    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}m ${secs}s`;
    };

    const result = Object.values(ecosystemData).map((item: any) => ({
      ...item,
      y2025: { ...item.y2025, avgDurationFormatted: formatTime(item.y2025.avgDuration) },
      y2026: { ...item.y2026, avgDurationFormatted: formatTime(item.y2026.avgDuration) }
    })).sort((a, b) => (b.y2026.totalSessions + b.y2025.totalSessions) - (a.y2026.totalSessions + a.y2025.totalSessions));

    return new Response(JSON.stringify({ success: true, data: result, errors: propertyErrors }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Ecosystem API Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
