import { v as verifyApiAuth, g as getGa4Client, p as propertyId } from './api-auth-server_BX11py_x.mjs';

const GET = async ({ request }) => {
  if (!await verifyApiAuth(request)) return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 });
  const client = getGa4Client();
  if (!client || !propertyId) {
    return new Response(JSON.stringify({ error: "Configuración de Google Analytics faltante o inválida." }), { status: 500 });
  }
  const url = new URL(request.url);
  const days = parseInt(url.searchParams.get("days") || "30", 10);
  const pathFilter = url.searchParams.get("pathFilter");
  try {
    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
      dimensions: [{ name: "pagePath" }],
      metrics: [
        { name: "averageSessionDuration" },
        { name: "userEngagementDuration" },
        { name: "eventCount" }
      ],
      // Filter by click, purchase or register to measure interaction
      dimensionFilter: pathFilter ? {
        andGroup: {
          expressions: [
            {
              filter: {
                fieldName: "eventName",
                inListFilter: { values: ["click", "purchase", "sign_up"] }
              }
            },
            {
              filter: {
                fieldName: "pagePathPlusQueryString",
                stringFilter: { matchType: "CONTAINS", value: pathFilter }
              }
            }
          ]
        }
      } : {
        filter: {
          fieldName: "eventName",
          inListFilter: {
            values: ["click", "purchase", "sign_up"]
          }
        }
      },
      orderBys: [{ metric: { metricName: "userEngagementDuration" }, desc: true }],
      limit: 50
    });
    const rows = response.rows?.map((row) => {
      const path = row.dimensionValues?.[0]?.value || "";
      const avgDuration = Number(row.metricValues?.[0]?.value || 0);
      const engDuration = Number(row.metricValues?.[1]?.value || 0);
      const events = Number(row.metricValues?.[2]?.value || 0);
      let score = Math.min(100, Math.round(events * 1.5 + avgDuration / 10));
      if (score < 0) score = 0;
      return { path, avgDuration, engDuration, events, score };
    }) || [];
    return new Response(JSON.stringify({ data: rows }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("GA4 Engagement API Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
