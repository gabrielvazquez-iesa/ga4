import type { APIRoute } from 'astro';
import { getGa4Client } from '../../lib/ga4-client';

// Propiedades con acceso en el servicio GA4
const LIVE_PROPERTIES = [
  { id: '306124053', name: 'IESA Principal', domain: 'www.iesa.edu.ve', isMain: true },
  { id: '367450688', name: 'Debates IESA', domain: 'www.debatesiesa.com', isMain: false },
  { id: '401872944', name: 'IESA Foundation', domain: 'iesafoundation.org', isMain: false },
  { id: '424276965', name: 'IESA Alumni', domain: 'www.iesaalumni.org', isMain: false },
  { id: '411820299', name: 'IESA Dominicana', domain: 'www.iesa.edu.do', isMain: false },
  { id: '397530949', name: 'CIEA', domain: 'ciea.iesa.edu.pa', isMain: false }
];

const POSTGRADUATE_PAGES = [
  { name: 'Maestría en Administración (MBA)', path: '/postgrados/maestria-en-administracion-mba', gscClicks: 1918, gscImp: 55042, gscCtr: '3.48%' },
  { name: 'Maestría en Finanzas', path: '/postgrados/maestria-en-finanzas', gscClicks: 1451, gscImp: 31971, gscCtr: '4.54%' },
  { name: 'Maestría en Mercadeo', path: '/postgrados/maestria-en-mercadeo', gscClicks: 714, gscImp: 12316, gscCtr: '5.80%' },
  { name: 'Especialización en gerencia de operaciones', path: '/especializacion-en-gerencia-de-operaciones', gscClicks: 484, gscImp: 11274, gscCtr: '4.29%' },
  { name: 'Maestría en Gerencia Pública', path: '/postgrados/maestria-en-gerencia-publica', gscClicks: 882, gscImp: 17772, gscCtr: '4.96%' },
  { name: 'Especialización Gerencia Legal', path: '/especializacion-en-gerencia-legal-corporativa', gscClicks: 35, gscImp: 122, gscCtr: '28.69%' }
];

function withTimeout<T>(promise: Promise<T>, ms = 7000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Timeout de consulta GA4')), ms))
  ]);
}

export const GET: APIRoute = async () => {
  const client = getGa4Client();

  if (!client) {
    return new Response(JSON.stringify({ 
      isLive: false,
      message: 'Faltan credenciales GA4 en variables de entorno.',
      updatedAt: 'Período 2025-2026'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // 1. Consultar métricas en vivo para las propiedades de GA4
    // Período 2025: Septiembre 2024 hasta Octubre 2025
    // Período 2026: Octubre 2025 hasta Septiembre 2026
    const propertyResults = await Promise.all(LIVE_PROPERTIES.map(async (prop) => {
      try {
        const [res2025] = await withTimeout(client.runReport({
          property: `properties/${prop.id}`,
          dateRanges: [{ startDate: '2024-09-01', endDate: '2025-10-31' }],
          metrics: [
            { name: 'sessions' },
            { name: 'activeUsers' },
            { name: 'screenPageViews' },
            { name: 'averageSessionDuration' }
          ]
        }));

        const [chRes2025] = await withTimeout(client.runReport({
          property: `properties/${prop.id}`,
          dateRanges: [{ startDate: '2024-09-01', endDate: '2025-10-31' }],
          dimensions: [{ name: 'sessionDefaultChannelGroup' }],
          metrics: [{ name: 'sessions' }]
        }));

        let organic2025 = 0, direct2025 = 0;
        chRes2025.rows?.forEach(r => {
          const ch = (r.dimensionValues?.[0]?.value || '').toLowerCase();
          const sess = Number(r.metricValues?.[0]?.value || 0);
          if (ch.includes('organic')) organic2025 += sess;
          else if (ch.includes('direct')) direct2025 += sess;
        });

        const [res2026] = await withTimeout(client.runReport({
          property: `properties/${prop.id}`,
          dateRanges: [{ startDate: '2025-10-01', endDate: '2026-09-30' }],
          metrics: [
            { name: 'sessions' },
            { name: 'activeUsers' },
            { name: 'screenPageViews' },
            { name: 'averageSessionDuration' }
          ]
        }));

        const [chRes] = await withTimeout(client.runReport({
          property: `properties/${prop.id}`,
          dateRanges: [{ startDate: '2025-10-01', endDate: '2026-09-30' }],
          dimensions: [{ name: 'sessionDefaultChannelGroup' }],
          metrics: [{ name: 'sessions' }]
        }));

        let organic2026 = 0, direct2026 = 0, referral2026 = 0, social2026 = 0;
        chRes.rows?.forEach(r => {
          const ch = (r.dimensionValues?.[0]?.value || '').toLowerCase();
          const sess = Number(r.metricValues?.[0]?.value || 0);
          if (ch.includes('organic')) organic2026 += sess;
          else if (ch.includes('direct')) direct2026 += sess;
          else if (ch.includes('referral')) referral2026 += sess;
          else if (ch.includes('social')) social2026 += sess;
        });

        const formatTime = (secs: number) => {
          const m = Math.floor(secs / 60);
          const s = Math.floor(secs % 60);
          return `${m}m ${s}s`;
        };

        const r25 = res2025.rows?.[0];
        const r26 = res2026.rows?.[0];

        return {
          id: prop.id,
          name: prop.name,
          domain: prop.domain,
          isLive: true,
          y2025: {
            sessions: Number(r25?.metricValues?.[0]?.value || 0),
            users: Number(r25?.metricValues?.[1]?.value || 0),
            views: Number(r25?.metricValues?.[2]?.value || 0),
            time: formatTime(Number(r25?.metricValues?.[3]?.value || 0)),
            organic: organic2025,
            direct: direct2025
          },
          y2026: {
            sessions: Number(r26?.metricValues?.[0]?.value || 0),
            users: Number(r26?.metricValues?.[1]?.value || 0),
            views: Number(r26?.metricValues?.[2]?.value || 0),
            time: formatTime(Number(r26?.metricValues?.[3]?.value || 0)),
            organic: organic2026,
            direct: direct2026,
            referral: referral2026,
            social: social2026
          }
        };
      } catch (err: any) {
        console.warn(`Error or timeout querying ${prop.name}:`, err.message);
        return { id: prop.id, name: prop.name, error: err.message };
      }
    }));

    // 2. Consultar páginas de postgrado en IESA Principal (Período 2026: Octubre 2025 hasta Septiembre 2026)
    const postgradResults = await Promise.all(POSTGRADUATE_PAGES.map(async (p) => {
      try {
        const [response] = await withTimeout(client.runReport({
          property: `properties/306124053`,
          dateRanges: [{ startDate: '2025-10-01', endDate: '2026-09-30' }],
          dimensionFilter: {
            filter: {
              fieldName: 'pagePath',
              stringFilter: { matchType: 'CONTAINS', value: p.path }
            }
          },
          metrics: [
            { name: 'screenPageViews' },
            { name: 'activeUsers' },
            { name: 'sessions' },
            { name: 'averageSessionDuration' }
          ]
        }));

        const views = Number(response.rows?.[0]?.metricValues?.[0]?.value || 0);
        const users = Number(response.rows?.[0]?.metricValues?.[1]?.value || 0);
        const sessions = Number(response.rows?.[0]?.metricValues?.[2]?.value || 0);
        const avgDurationSecs = Number(response.rows?.[0]?.metricValues?.[3]?.value || 0);
        const timeFormatted = `${Math.floor(avgDurationSecs / 60)}m ${Math.floor(avgDurationSecs % 60)}s`;

        return {
          name: p.name,
          path: p.path,
          views,
          users,
          sessions,
          avgDuration: timeFormatted,
          gscClicks: p.gscClicks,
          gscImp: p.gscImp,
          gscCtr: p.gscCtr
        };
      } catch (err: any) {
        return { 
          name: p.name, 
          path: p.path, 
          views: 0, 
          users: 0, 
          sessions: 0,
          avgDuration: '0m 0s',
          gscClicks: p.gscClicks,
          gscImp: p.gscImp,
          gscCtr: p.gscCtr,
          error: err.message 
        };
      }
    }));

    return new Response(JSON.stringify({
      isLive: true,
      updatedAt: 'Período 2025-2026',
      dateRanges: {
        period2025: 'Septiembre 2024 - Octubre 2025',
        period2026: 'Octubre 2025 - Septiembre 2026'
      },
      properties: propertyResults,
      postgrades: postgradResults
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ isLive: false, error: err.message }), { status: 500 });
  }
};
