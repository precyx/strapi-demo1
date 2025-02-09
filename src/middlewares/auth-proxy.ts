export default () => {
  return async (ctx, next) => {
    console.log("🔍 Incoming request URL:", ctx.request.url);
    console.log("🔍 Headers before modification:", ctx.request.headers);

    if (ctx.request.url.startsWith("/api/")) {
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
