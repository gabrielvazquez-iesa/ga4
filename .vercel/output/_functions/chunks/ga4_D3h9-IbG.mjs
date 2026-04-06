import { v as verifyApiAuth, g as getGa4Client, p as propertyId } from './api-auth-server_BX11py_x.mjs';

const GET = async ({ request }) => {
  if (!await verifyApiAuth(request)) return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 });
  const client = getGa4Client();
  if (!client || !propertyId) {
    return new Response(JSON.stringify({ error: "Error de servidor: Configuración de Google Analytics faltante o inválida." }), { status: 500 });
  }
  const url = new URL(request.url);
  const days = parseInt(url.searchParams.get("days") || "30", 10);
  const pathFilter = url.searchParams.get("pathFilter");
  try {
    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
      dimensions: [{ name: "date" }],
      dimensionFilter: pathFilter ? {
        filter: {
          fieldName: "pagePathPlusQueryString",
          stringFilter: {
            matchType: "CONTAINS",
            value: pathFilter
          }
        }
      } : void 0,
      metrics: [
        { name: "screenPageViews" },
        { name: "sessions" },
        { name: "activeUsers" },
        { name: "bounceRate" },
        { name: "averageSessionDuration" }
      ],
      orderBys: [{ dimension: { dimensionName: "date" }, desc: false }]
    });
    const rows = response.rows?.map((row) => {
      const dateStr = row.dimensionValues?.[0]?.value || "";
      return {
        date: `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`,
        views: Number(row.metricValues?.[0]?.value || 0),
        sessions: Number(row.metricValues?.[1]?.value || 0),
        users: Number(row.metricValues?.[2]?.value || 0),
        bounceRate: Number(row.metricValues?.[3]?.value || 0),
        avgSession: Number(row.metricValues?.[4]?.value || 0)
      };
    }) || [];
    return new Response(JSON.stringify({ data: rows }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("GA4 API Error:", error);
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
