export default () => {
  return async (ctx, next) => {
    if (ctx.request.url.startsWith("/api/")) {
      ctx.request.headers["authorization"] =
        `Bearer ${process.env.STRAPI_API_TOKEN}`;
    }
    await next();
  };
};
