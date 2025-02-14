export default () => {
  return async (ctx, next) => {
    console.log("🔍 Incoming request URL:", ctx.request.url);
    console.log("🔍 Headers before modification:", ctx.request.headers);

    let startsWithApi = ctx.request.url.startsWith("/api/");
    let hasNoAuthHeader = !ctx.request.headers["authorization"];

    // inject api token
    if (startsWithApi && hasNoAuthHeader) {
      ctx.request.headers["authorization"] =
        `Bearer ${process.env.STRAPI_API_TOKEN}`;

      console.log(
        "✅ Injected Authorization Header:",
        ctx.request.headers["authorization"]
      );
    }

    await next();

    console.log("🔍 Response status:", ctx.response.status);
  };
};
