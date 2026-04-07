import { v as verifyApiAuth, g as getGa4Client, p as propertyId } from './api-auth-server_BQc1zFH3.mjs';

const GET = async ({ request }) => {
  if (!await verifyApiAuth(request)) return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 });
  const client = getGa4Client();
  if (!client || !propertyId) {
    return new Response(JSON.stringify({ error: "Configuración de Google Analytics faltante o inválida." }), { status: 500 });
  }
  const url = new URL(request.url);
  const days = parseInt(url.searchParams.get("days") || "30", 10);
  const pathFilter = url.searchParams.get("pathFilter");
  if (!pathFilter) {
    return new Response(JSON.stringify({ error: "Falta pathFilter" }), { status: 400 });
  }
  try {
    const [[currentRes], [prevRes]] = await Promise.all([
      client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
        dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
        metrics: [
          { name: "screenPageViews" },
          { name: "averageSessionDuration" }
        ],
        dimensionFilter: {
          filter: {
            fieldName: "pagePathPlusQueryString",
            stringFilter: {
              matchType: "CONTAINS",
              value: pathFilter
            }
          }
        },
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 100
        // Top 100 articles
      }),
      client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: `${days * 2}daysAgo`, endDate: `${days + 1}daysAgo` }],
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }],
        dimensionFilter: {
          filter: {
            fieldName: "pagePathPlusQueryString",
            stringFilter: {
              matchType: "CONTAINS",
              value: pathFilter
            }
          }
        },
        limit: 1e3
      })
    ]);
    const prevMap = /* @__PURE__ */ new Map();
    prevRes.rows?.forEach((r) => {
      const path = r.dimensionValues?.[0]?.value || "";
      const views = Number(r.metricValues?.[0]?.value || 0);
      prevMap.set(path, views);
    });
    const rows = currentRes.rows?.map((row) => {
      const path = row.dimensionValues?.[0]?.value || "";
      const title = row.dimensionValues?.[1]?.value || "";
      const views = Number(row.metricValues?.[0]?.value || 0);
      const prevViews = prevMap.get(path) || 0;
      let trend = 0;
      if (prevViews > 0) trend = (views - prevViews) / prevViews * 100;
      else if (views > 0 && prevViews === 0) trend = 100;
      return {
        path,
        title: title.split("|")[0].trim(),
        // Clean up exact page title before the pipe if any
        views,
        avgDuration: Number(row.metricValues?.[1]?.value || 0),
        trend
      };
    }) || [];
    const filteredRows = rows.filter(
      (r) => r.path !== pathFilter && r.path !== `${pathFilter}/`
    );
    return new Response(JSON.stringify({ data: filteredRows }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("GA4 Content List API Error:", error);
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
