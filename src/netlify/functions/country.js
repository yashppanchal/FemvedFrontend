function normalizeCountryCode(rawCode) {
  if (typeof rawCode !== "string") return "US";
  const code = rawCode.trim().toUpperCase();
  if (code === "GB") return "UK";
  if (code === "IN" || code === "UK" || code === "US") return code;
  return "US";
}

function getHeader(headers, name) {
  if (!headers) return undefined;
  const direct = headers[name];
  if (typeof direct === "string") return direct;

  const lowerName = name.toLowerCase();
  for (const key of Object.keys(headers)) {
    if (key.toLowerCase() === lowerName) {
      const value = headers[key];
      if (typeof value === "string") return value;
    }
  }
  return undefined;
}

function readGeoCountryFromHeader(headers) {
  const rawGeo = getHeader(headers, "x-nf-geo");
  if (!rawGeo) return undefined;

  try {
    const parsed = JSON.parse(rawGeo);
    if (typeof parsed?.country?.code === "string") return parsed.country.code;
    if (typeof parsed?.country_code === "string") return parsed.country_code;
    if (typeof parsed?.countryCode === "string") return parsed.countryCode;
  } catch {
    // Ignore malformed payloads and continue with other headers.
  }

  return undefined;
}

function readGeoCountryFromContext(context) {
  return context?.geo?.country?.code;
}

function detectRawCountry(event, context) {
  const headers = event?.headers ?? {};

  const fromContext = readGeoCountryFromContext(context);
  if (fromContext) return { rawCountryCode: fromContext, source: "context.geo.country.code" };

  const fromGeoHeaderCode = getHeader(headers, "x-nf-geo-country-code");
  if (fromGeoHeaderCode) {
    return { rawCountryCode: fromGeoHeaderCode, source: "x-nf-geo-country-code" };
  }

  const fromGeoHeader = readGeoCountryFromHeader(headers);
  if (fromGeoHeader) return { rawCountryCode: fromGeoHeader, source: "x-nf-geo" };

  const fromXCountry = getHeader(headers, "x-country");
  if (fromXCountry) return { rawCountryCode: fromXCountry, source: "x-country" };

  const fromCfCountry = getHeader(headers, "cf-ipcountry");
  if (fromCfCountry) return { rawCountryCode: fromCfCountry, source: "cf-ipcountry" };

  return { rawCountryCode: undefined, source: "fallback-default" };
}

export const handler = async (event, context) => {
  const { rawCountryCode, source } = detectRawCountry(event, context);
  const debugMode = event?.queryStringParameters?.debug === "1";

  const countryCode = normalizeCountryCode(rawCountryCode);
  const responseBody = debugMode
    ? {
        countryCode,
        debug: {
          source,
          rawCountryCode: rawCountryCode ?? null,
          contextGeoCountryCode: context?.geo?.country?.code ?? null,
        },
      }
    : { countryCode };

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
    body: JSON.stringify(responseBody),
  };
};
