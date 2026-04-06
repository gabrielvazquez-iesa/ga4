import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { createClient } from '@supabase/supabase-js';

function formatPrivateKey(key) {
  let formattedKey = key.replace(/^"|"$/g, "");
  formattedKey = formattedKey.replace(/\\n/g, "\n");
  return formattedKey;
}
const clientEmail = "proyecto-dashboard@proyecto-dashboard-490018.iam.gserviceaccount.com";
const privateKey = formatPrivateKey("-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDDbxSW31JtvE6b\n3jP38JQVW0mSX6OIi/Oyw1hePW5Nflrb1AxWqDNko+DmgzlmQmn2nCidMN+lOaY3\nq073+E+m6wYBupuJiDC5ZGGY/J3Kno10XVbKKHwnwTLh5lsda1d5b1Y8liMq5Fn7\nr0BYk05WLiGzZ1QqPcTFM5rgHgGVKkVO3uhsQVBRdvHrBW13+uUqQgvaoYPiCzfk\n3kQkxoVXXNZvyJrNa0uK4ktixCzXsAiauLn8V69IKjCLrY4GQ0EH7JDF9NzWOGJL\nSXS3ApimFP3eqqXkRwIVvS9dJu8je3akILFafPceXmSalElnGK8+2ns6ceDFpAG2\n/a5+MWhnAgMBAAECggEAW7F30wundHYH2cio0FkPWW/Rtnvp0cx8A/D0Oo8O/Avf\nHEnCmjvjlQHwqKaD3U8mwT5mLc46+B3ytybIb76QvIuDb3c6t43u8mS/B9TqQaEf\nVCvg5wuUqOBT+7olIMn2qjKLHvUAPgUSlOwWQBipBfUx+abuzbzaX/3E2gcqDe4K\nNfkKHAInBEtHYUx78gsFuRC0DXoPjFAh7288a9rwEvhfmUFwhuvxuloOnriqGE/M\ncwBB3PAiLv7pCSd7OXIdlgDO684KPL5HGrryu7Hra0iTcuvGXK4si9qGqSgZ1cLi\nNFfiHWdQViQiro6bb4GvQqK3sNas7mOrfbkw+kyJyQKBgQD9p6aWAkPlZXh2JDBf\nzA6tBmOieU9r6Dj4cBXWdDjeZWGjJqBI0CiJ/O5S09T84g8ZQ2oDjF7WeF/+xaD2\n3nWYMnNBFWd8rsqpLq9FryQj1NMZW/3f30G3KjF0qzlzz2Vyf4zrcAVZJ11WYkyY\nAP4N7Yy+UeqUOhLMb9OR0i2QeQKBgQDFPaHufVpkyUx+NhanK6zhSE+DmaR5sMAE\nUq8YR9fjVOcEu2fFhECfm8ichDNDYiIPDQD8YzV8SLB7A3NN9ALVvLB9abfhs8o4\nzTEytZ+HyR6Ar7kQXQ89aEvQPo2ogR4OCkah7RHRXQbAcc6/NLcrkes9NJrZdbHr\noWqwGydH3wKBgFcQl5Z/2ow/wxRSIaSQJy1utv5Kw18Xi46C8ov0wpxbkiLtHDFB\n+dg7UBZwDXhro6EZSadEJD1bfh+1+CUkgJqoHnVlgmsCmB9wHcs+bZo67+aRc9fH\nCwhy3BzetM6yjnC5pUYe4kcSwu/mt8Go/YsMUbX16h3MvS0c6TLxQKCJAoGAfy7d\nwt27su+GTn/sHYFxKZcqBo7E2t8ZAfCbDQoOcH0ntgptwJQl44VdV2d7csDNe20E\nLLqAG5L3kWrJKAPm7BGOsF/B/VykUfol9i/dHX6XF523tJB9KjidYjtjtrsDOURx\nBSrL6XeVyfPYv7xrPEIMMNxB2WUmA+2C0OnBa3sCgYEAmYhQhylRob0ydQoqepy8\nmC7ovLy+nH8bsFpTMBRwJal8zbCaXoITWu2u1MXP0g3UpmPC/7S44wDHHLDdXVve\nSXcAR6ACL9SsSbE3B5kDtsGalu4DdV3hfsZLsRh3PCbhD2nSzdhHnEZsWFNNc8D7\nqXwTPrS8wREDGusyhajWZ/k=\n-----END PRIVATE KEY-----\n");
let gaClient = null;
function getGa4Client() {
  if (gaClient) return gaClient;
  if (!privateKey) {
    console.error("GA4 Client: Missing credentials. Check GA4_CLIENT_EMAIL and GA4_PRIVATE_KEY in Environment Variables.");
    return null;
  }
  try {
    gaClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey
      }
    });
    return gaClient;
  } catch (err) {
    console.error("GA4 Client: Initialization failed", err);
    return null;
  }
}
const propertyId = "306124053";

async function verifyApiAuth(request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error("API Auth: Missing or invalid Authorization header");
    return false;
  }
  const token = authHeader.split(" ")[1];
  if (!token || token === "undefined" || token === "null" || token === "") {
    console.error("API Auth: Token is empty or invalid string");
    return false;
  }
  try {
    const serverSupabase = createClient(
      "https://mkzrljmfgesxnrtnxzib.supabase.co",
      "sb_publishable_ei-WnhRWoUCmnoFE3NG7GA_Pzvf4_b0"
    );
    const { data: { user }, error } = await serverSupabase.auth.getUser(token);
    if (error || !user) {
      console.error("API Auth User Error:", error?.message);
      const isDev = process.env.NODE_ENV === "development";
      if (isDev && token && token !== "undefined") {
        console.warn("API Auth: [DEV BYPASS] Permitido acceso local con token:", token.substring(0, 10) + "...");
        return true;
      }
      return false;
    }
    return true;
  } catch (err) {
    console.error("API Verification Crash:", err);
    return false;
  }
}

export { privateKey as a, clientEmail as c, getGa4Client as g, propertyId as p, verifyApiAuth as v };
