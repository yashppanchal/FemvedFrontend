export const handler = async (event) => {
  const countryCode = event.headers["x-nf-geo-country-code"] || "US";

  return {
    statusCode: 200,
    body: JSON.stringify({
      countryCode,
    }),
  };
};
