import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { createClient } from '@supabase/supabase-js';

function formatPrivateKey(key) {
  let formattedKey = key.replace(/^"|"$/g, "");
  formattedKey = formattedKey.replace(/\\n/g, "\n");
  return formattedKey;
}
const clientEmail = "proyecto-dashboard@proyecto-dashboard-490018.iam.gserviceaccount.com";
const privateKey = formatPrivateKey("-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC302e3Rr8rbHi8\n0ngfkhVJ94efsbuencT8awLSPFv7Q+YDvo0XgX0QDU0SoU17zTAHN0dAEzY5e2Cj\na+xiLtqYAMngvTzIyrC/sXsDg0NwokPFyzsaCxCqpYyQSQNE5aSivch6kbWp0DyX\nN+mtEC70J1zzV5j1v4xuk7MX57ZSVvFVQN1drLozT18IvWmIl2njY0r8OM5hXbex\necFCilvkzjUNsmIROSxF3nrx4chnA/Z0PySI9l706/7pmCbJQML5YnF8uK4EEDrL\nQXiM6qK1hU16khfFMYPwbWK0C0DPNhV9j1nvRocsP64DXrB+Chfp8IsYjgy2sfac\noIesDuFVAgMBAAECggEADAeS4DjKPlx7Gzo3v7Mm3wAKmU3/fe4Lq8wR83GdQFht\nZz3TTGA+L6x7KHazVCB1nedFa6FGOWVESfWAUt2Hkw5sJ5+iqG4xOl4yM2Tl5ytL\nPZii3b2vIcezJucMRngzua2rPrAl3/6/VFMFoPxv4izoRYlsOlrGZR8Xx37znLg0\n3NBFoQ4nbHZHDe9hyAfydOWR3pFoC1Ai6UQiCDSq6G10gDBi25yXJRJyZMZ59Tz+\nXFTn1szUW5PKUNAFcfzR7pUZE0m60snBWctZEaFiVcsWnx1Um2ZHIFHNujisOIwL\naG2JsXo4KjlmKyIFIaQPwF9tt2Bf2jqdm9a8YZcf0QKBgQDowixkPE60AWniLe+z\nuXKmSwmANMoxhnUGcNdlMRxzZah0fdVHZ2ZHp3OGI/PE+UbySwqUDWB5FSQk5ine\n8MTOGrHPLz0g+GSKURitLl5ItrOzUh7IrEG2OI0E4dn/JTDJrY/RB8yovkGsaspF\nRYx20d/HKBzUdXn8Rn63m8MQcQKBgQDKLmcp4sd8EBlq/o/yZpiUkWFXkSvfFYtt\nObUZiYA5/8ZilbC4l1KaBnBcQCvW4uZcf80YPN65/epy74xow8U/PF+QasXQnWMB\n2RndaYjB2OPA2wTh2VuTAZ0ucJasz7b0TpssBiXFRfNbl+HOs3zQoH5aU9owDlV9\nZ+JwBCYRJQKBgQCCyFfZGmm+iuzLwbPl8FWTSqZT+1WA7mPi8pSUrzulO4GjsvCb\n5mV57YTj4l+eVdKfYbrX5YxHfLGKaikss2xhwm4WVBys4eTcMyUCagNgKAhgwcu6\nRc/Ga5ARJjYvPt5i87rTYOaGCiEsl/R/Z8y9Fr/+T3OjjT61mYap9ENugQKBgGDm\nUIdgq18okCYZj4AL8AD0lITVjQNEXiihSczNe+lQTxKcz7AIxowPnfZ4wwoggWu/\nzNpbAhx+N8mSSedEPNsL4nli0yAi7nrKRH07wVG206Fw1ywvcpZIZb8GMxDsFLGO\noww8fgnIdtRlPNJGcAHFiglcuuvhUtPh4ELzmhMJAoGBAMLFPdqFKkYtVitUnbjV\nkqAR09L5NkmQgBumdMS9KodL6Yksrk+tO/MzbdKd5elismHx05N7l4qEYX8HN+3q\nc0//tX+RrkJO/3d5k5F6SWjdosHXOea5nmlYEKxJKWEdmHLeT77JV7PV+BTTiLEJ\nJkPcoQW/kWnw0CZzzqJ56Nwn\n-----END PRIVATE KEY-----\n");
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
