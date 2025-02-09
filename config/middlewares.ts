/* dynamic cors origin based on environment */
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
  : [];

if (process.env.NODE_ENV === "production" && allowedOrigins.length === 0) {
  throw new Error("CORS_ORIGIN is not set in production!");
}

export default [
  "strapi::logger",
  "strapi::errors",
  "strapi::security",
  {
    name: "strapi::cors",
    config: {
      origin: allowedOrigins,
      methods: ["GET", "POST", "PUT", "DELETE"],
      headers: ["Content-Type", "Authorization"],
      credentials: true,
    },
  },
  "strapi::poweredBy",
  "strapi::query",
  "strapi::body",
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
  "global::auth-proxy", // api key injection
];
