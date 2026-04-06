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
    const currentStartDate = `${days}daysAgo`;
    const currentEndDate = "today";
    const previousStartDate = `${days * 2}daysAgo`;
    const previousEndDate = `${days + 1}daysAgo`;
    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        { startDate: currentStartDate, endDate: currentEndDate, name: "current" },
        { startDate: previousStartDate, endDate: previousEndDate, name: "previous" }
      ],
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
        { name: "sessions" },
        { name: "activeUsers" },
        { name: "sessionConversionRate" }
      ]
    });
    let currentData = { sessions: 0, activeUsers: 0, conversionRate: 0 };
    let previousData = { sessions: 0, activeUsers: 0, conversionRate: 0 };
    (response.rows || []).forEach((row) => {
      const rangeName = row.dimensionValues?.[0]?.value || "";
    });
    return new Response(JSON.stringify({ data: { current: currentData, previous: previousData } }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("GA4 MoM API Error:", error);
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
