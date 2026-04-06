import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { v as verifyApiAuth } from './api-auth-server_Cju2ZX1J.mjs';

const client = new BetaAnalyticsDataClient({
  credentials: {
    client_email: "proyecto-dashboard@proyecto-dashboard-490018.iam.gserviceaccount.com",
    private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDDbxSW31JtvE6b\n3jP38JQVW0mSX6OIi/Oyw1hePW5Nflrb1AxWqDNko+DmgzlmQmn2nCidMN+lOaY3\nq073+E+m6wYBupuJiDC5ZGGY/J3Kno10XVbKKHwnwTLh5lsda1d5b1Y8liMq5Fn7\nr0BYk05WLiGzZ1QqPcTFM5rgHgGVKkVO3uhsQVBRdvHrBW13+uUqQgvaoYPiCzfk\n3kQkxoVXXNZvyJrNa0uK4ktixCzXsAiauLn8V69IKjCLrY4GQ0EH7JDF9NzWOGJL\nSXS3ApimFP3eqqXkRwIVvS9dJu8je3akILFafPceXmSalElnGK8+2ns6ceDFpAG2\n/a5+MWhnAgMBAAECggEAW7F30wundHYH2cio0FkPWW/Rtnvp0cx8A/D0Oo8O/Avf\nHEnCmjvjlQHwqKaD3U8mwT5mLc46+B3ytybIb76QvIuDb3c6t43u8mS/B9TqQaEf\nVCvg5wuUqOBT+7olIMn2qjKLHvUAPgUSlOwWQBipBfUx+abuzbzaX/3E2gcqDe4K\nNfkKHAInBEtHYUx78gsFuRC0DXoPjFAh7288a9rwEvhfmUFwhuvxuloOnriqGE/M\ncwBB3PAiLv7pCSd7OXIdlgDO684KPL5HGrryu7Hra0iTcuvGXK4si9qGqSgZ1cLi\nNFfiHWdQViQiro6bb4GvQqK3sNas7mOrfbkw+kyJyQKBgQD9p6aWAkPlZXh2JDBf\nzA6tBmOieU9r6Dj4cBXWdDjeZWGjJqBI0CiJ/O5S09T84g8ZQ2oDjF7WeF/+xaD2\n3nWYMnNBFWd8rsqpLq9FryQj1NMZW/3f30G3KjF0qzlzz2Vyf4zrcAVZJ11WYkyY\nAP4N7Yy+UeqUOhLMb9OR0i2QeQKBgQDFPaHufVpkyUx+NhanK6zhSE+DmaR5sMAE\nUq8YR9fjVOcEu2fFhECfm8ichDNDYiIPDQD8YzV8SLB7A3NN9ALVvLB9abfhs8o4\nzTEytZ+HyR6Ar7kQXQ89aEvQPo2ogR4OCkah7RHRXQbAcc6/NLcrkes9NJrZdbHr\noWqwGydH3wKBgFcQl5Z/2ow/wxRSIaSQJy1utv5Kw18Xi46C8ov0wpxbkiLtHDFB\n+dg7UBZwDXhro6EZSadEJD1bfh+1+CUkgJqoHnVlgmsCmB9wHcs+bZo67+aRc9fH\nCwhy3BzetM6yjnC5pUYe4kcSwu/mt8Go/YsMUbX16h3MvS0c6TLxQKCJAoGAfy7d\nwt27su+GTn/sHYFxKZcqBo7E2t8ZAfCbDQoOcH0ntgptwJQl44VdV2d7csDNe20E\nLLqAG5L3kWrJKAPm7BGOsF/B/VykUfol9i/dHX6XF523tJB9KjidYjtjtrsDOURx\nBSrL6XeVyfPYv7xrPEIMMNxB2WUmA+2C0OnBa3sCgYEAmYhQhylRob0ydQoqepy8\nmC7ovLy+nH8bsFpTMBRwJal8zbCaXoITWu2u1MXP0g3UpmPC/7S44wDHHLDdXVve\nSXcAR6ACL9SsSbE3B5kDtsGalu4DdV3hfsZLsRh3PCbhD2nSzdhHnEZsWFNNc8D7\nqXwTPrS8wREDGusyhajWZ/k=\n-----END PRIVATE KEY-----\n"?.split(String.raw`\n`).join("\n")
  }
});
const GET = async ({ request }) => {
  if (!await verifyApiAuth(request)) return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 });
  const url = new URL(request.url);
  const days = parseInt(url.searchParams.get("days") || "30", 10);
  const pathFilter = url.searchParams.get("pathFilter");
  const propertyId = "306124053";
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
