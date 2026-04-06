import { google } from 'googleapis';
import { v as verifyApiAuth, g as getGa4Client, p as propertyId, a as privateKey, c as clientEmail } from './api-auth-server_BX11py_x.mjs';

const GET = async ({ request }) => {
  if (!await verifyApiAuth(request)) return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 });
  const url = new URL(request.url);
  const month = url.searchParams.get("month");
  const gscUrl = url.searchParams.get("gscUrl") || "sc-domain:iesa.edu.ve";
  if (!month) {
    return new Response(JSON.stringify({ error: `Falta parámetro month (formato YYYY-MM).` }), { status: 400 });
  }
  const gaClient = getGa4Client();
  if (!gaClient || !propertyId || !clientEmail || !privateKey) {
    return new Response(JSON.stringify({ error: "Configuración de GA4/GSC faltante o inválida en el servidor" }), { status: 500 });
  }
  const [yearStr, monthStr] = month.split("-");
  const startDate = `${yearStr}-${monthStr}-01`;
  const lastDay = new Date(parseInt(yearStr), parseInt(monthStr), 0).getDate();
  const endDate = `${yearStr}-${monthStr}-${String(lastDay).padStart(2, "0")}`;
  try {
    const [globalRes] = await gaClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: "screenPageViews" },
        { name: "bounceRate" },
        { name: "sessions" },
        { name: "newUsers" },
        { name: "activeUsers" },
        { name: "averageSessionDuration" }
      ]
    });
    const [eventsRes] = await gaClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }]
    });
    const [channelsRes] = await gaClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics: [{ name: "sessions" }]
    });
    const globalRow = globalRes.rows?.[0]?.metricValues || [];
    const vistas = Number(globalRow[0]?.value || 0);
    const reboteNum = Number(globalRow[1]?.value || 0);
    const sesiones = Number(globalRow[2]?.value || 0);
    const nuevosUsers = Number(globalRow[3]?.value || 0);
    const activeUsers = Number(globalRow[4]?.value || 0);
    const avgSecs = Number(globalRow[5]?.value || 0);
    const recurrentes = activeUsers > nuevosUsers ? activeUsers - nuevosUsers : 0;
    let userEngagement = 0;
    let scroll = 0;
    eventsRes.rows?.forEach((r) => {
      const eName = r.dimensionValues?.[0]?.value;
      const count = Number(r.metricValues?.[0]?.value || 0);
      if (eName === "user_engagement") userEngagement = count;
      if (eName === "scroll") scroll = count;
    });
    let direct = 0, organic = 0, paid = 0, social = 0, referral = 0;
    channelsRes.rows?.forEach((r) => {
      const channel = r.dimensionValues?.[0]?.value?.toLowerCase() || "";
      const count = Number(r.metricValues?.[0]?.value || 0);
      if (channel.includes("direct")) direct += count;
      else if (channel.includes("organic search")) organic += count;
      else if (channel.includes("paid search")) paid += count;
      else if (channel.includes("organic social")) social += count;
      else if (channel.includes("referral")) referral += count;
    });
    let clics = 0, ctrNum = 0, impresiones = 0;
    let gscError = null;
    try {
      const auth = new google.auth.GoogleAuth({
        credentials: { client_email: clientEmail, private_key: privateKey },
        scopes: ["https://www.googleapis.com/auth/webmasters.readonly"]
      });
      const webmasters = google.webmasters({ version: "v3", auth });
      const gscRes = await webmasters.searchanalytics.query({
        siteUrl: gscUrl,
        requestBody: {
          startDate,
          endDate,
          dimensions: ["date"]
        }
      });
      const rows = gscRes.data.rows || [];
      rows.forEach((r) => {
        clics += r.clicks || 0;
        impresiones += r.impressions || 0;
      });
      if (impresiones > 0) ctrNum = clics / impresiones * 100;
    } catch (e) {
      console.warn("GSC Fetch Error:", e.message);
      gscError = `GSC no autorizado o URL incorrecta. (Tratando de consultar ${gscUrl}). Error: ${e.message}`;
    }
    const minutes = Math.floor(avgSecs / 60);
    const seconds = Math.floor(avgSecs % 60);
    const formattedTime = `${minutes} min ${seconds} s`;
    const formattedCTR = `${ctrNum.toFixed(2)}%`;
    const formattedRebote = `${(reboteNum * 100).toFixed(2)}%`;
    return new Response(JSON.stringify({
      data: {
        vistas,
        rebote: formattedRebote,
        userEngagement,
        sesiones,
        nuevosUsers,
        recurrentes,
        scroll,
        formattedTime,
        clics,
        ctr: formattedCTR,
        impresiones,
        direct,
        organic,
        paid,
        social,
        referral,
        gscError
      }
    }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Monthly Report API Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
