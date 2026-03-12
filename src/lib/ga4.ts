import { BetaAnalyticsDataClient } from "@google-analytics/data";

const client = new BetaAnalyticsDataClient({
  credentials: {
    client_email: import.meta.env.GA4_CLIENT_EMAIL,
    private_key: import.meta.env.GA4_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
});

export async function getQuickStats() {
  const [response] = await client.runReport({
    property: `properties/${import.meta.env.GA4_PROPERTY_ID}`,
    dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
    metrics: [{ name: "activeUsers" }, { name: "sessions" }],
  });
  return response;
}
