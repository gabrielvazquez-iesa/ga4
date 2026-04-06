import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { google } from 'googleapis';
import { v as verifyApiAuth } from './api-auth-server_Cju2ZX1J.mjs';

const GET = async ({ request }) => {
  if (!await verifyApiAuth(request)) return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 });
  const url = new URL(request.url);
  const month = url.searchParams.get("month");
  const gscUrl = url.searchParams.get("gscUrl") || "sc-domain:iesa.edu.ve";
  if (!month) {
    return new Response(JSON.stringify({ error: `Falta parámetro month (formato YYYY-MM). URL entrante: ${request.url}` }), { status: 400 });
  }
  const [yearStr, monthStr] = month.split("-");
  const startDate = `${yearStr}-${monthStr}-01`;
  const lastDay = new Date(parseInt(yearStr), parseInt(monthStr), 0).getDate();
  const endDate = `${yearStr}-${monthStr}-${String(lastDay).padStart(2, "0")}`;
  const clientEmail = "proyecto-dashboard@proyecto-dashboard-490018.iam.gserviceaccount.com";
  const privateKey = "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDDbxSW31JtvE6b\n3jP38JQVW0mSX6OIi/Oyw1hePW5Nflrb1AxWqDNko+DmgzlmQmn2nCidMN+lOaY3\nq073+E+m6wYBupuJiDC5ZGGY/J3Kno10XVbKKHwnwTLh5lsda1d5b1Y8liMq5Fn7\nr0BYk05WLiGzZ1QqPcTFM5rgHgGVKkVO3uhsQVBRdvHrBW13+uUqQgvaoYPiCzfk\n3kQkxoVXXNZvyJrNa0uK4ktixCzXsAiauLn8V69IKjCLrY4GQ0EH7JDF9NzWOGJL\nSXS3ApimFP3eqqXkRwIVvS9dJu8je3akILFafPceXmSalElnGK8+2ns6ceDFpAG2\n/a5+MWhnAgMBAAECggEAW7F30wundHYH2cio0FkPWW/Rtnvp0cx8A/D0Oo8O/Avf\nHEnCmjvjlQHwqKaD3U8mwT5mLc46+B3ytybIb76QvIuDb3c6t43u8mS/B9TqQaEf\nVCvg5wuUqOBT+7olIMn2qjKLHvUAPgUSlOwWQBipBfUx+abuzbzaX/3E2gcqDe4K\nNfkKHAInBEtHYUx78gsFuRC0DXoPjFAh7288a9rwEvhfmUFwhuvxuloOnriqGE/M\ncwBB3PAiLv7pCSd7OXIdlgDO684KPL5HGrryu7Hra0iTcuvGXK4si9qGqSgZ1cLi\nNFfiHWdQViQiro6bb4GvQqK3sNas7mOrfbkw+kyJyQKBgQD9p6aWAkPlZXh2JDBf\nzA6tBmOieU9r6Dj4cBXWdDjeZWGjJqBI0CiJ/O5S09T84g8ZQ2oDjF7WeF/+xaD2\n3nWYMnNBFWd8rsqpLq9FryQj1NMZW/3f30G3KjF0qzlzz2Vyf4zrcAVZJ11WYkyY\nAP4N7Yy+UeqUOhLMb9OR0i2QeQKBgQDFPaHufVpkyUx+NhanK6zhSE+DmaR5sMAE\nUq8YR9fjVOcEu2fFhECfm8ichDNDYiIPDQD8YzV8SLB7A3NN9ALVvLB9abfhs8o4\nzTEytZ+HyR6Ar7kQXQ89aEvQPo2ogR4OCkah7RHRXQbAcc6/NLcrkes9NJrZdbHr\noWqwGydH3wKBgFcQl5Z/2ow/wxRSIaSQJy1utv5Kw18Xi46C8ov0wpxbkiLtHDFB\n+dg7UBZwDXhro6EZSadEJD1bfh+1+CUkgJqoHnVlgmsCmB9wHcs+bZo67+aRc9fH\nCwhy3BzetM6yjnC5pUYe4kcSwu/mt8Go/YsMUbX16h3MvS0c6TLxQKCJAoGAfy7d\nwt27su+GTn/sHYFxKZcqBo7E2t8ZAfCbDQoOcH0ntgptwJQl44VdV2d7csDNe20E\nLLqAG5L3kWrJKAPm7BGOsF/B/VykUfol9i/dHX6XF523tJB9KjidYjtjtrsDOURx\nBSrL6XeVyfPYv7xrPEIMMNxB2WUmA+2C0OnBa3sCgYEAmYhQhylRob0ydQoqepy8\nmC7ovLy+nH8bsFpTMBRwJal8zbCaXoITWu2u1MXP0g3UpmPC/7S44wDHHLDdXVve\nSXcAR6ACL9SsSbE3B5kDtsGalu4DdV3hfsZLsRh3PCbhD2nSzdhHnEZsWFNNc8D7\nqXwTPrS8wREDGusyhajWZ/k=\n-----END PRIVATE KEY-----\n"?.split(String.raw`\n`).join("\n");
  const propertyId = "306124053";
  const gaClient = new BetaAnalyticsDataClient({
    credentials: { client_email: clientEmail, private_key: privateKey }
  });
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
