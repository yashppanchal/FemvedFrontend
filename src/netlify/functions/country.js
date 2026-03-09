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

export const handler = async (event) => {
  const headers = event?.headers ?? {};
  const rawCountryCode =
    getHeader(headers, "x-nf-geo-country-code") ??
    readGeoCountryFromHeader(headers) ??
    getHeader(headers, "x-country") ??
    getHeader(headers, "cf-ipcountry");

  const countryCode = normalizeCountryCode(rawCountryCode);

  return {
    statusCode: 200,
    body: JSON.stringify({ countryCode }),
  };
};
