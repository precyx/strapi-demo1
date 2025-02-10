/**
 * Strapi Middleware Configuration
 *
 * - Dynamically sets CORS origins based on environment
 * - Ensures secure Content Security Policy (CSP)
 * - Configures CORS, logging, security, and other middleware
 */

// Get allowed CORS origins from environment variables (comma-separated)
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
  : [];

// Ensure CORS_ORIGIN is set in production
if (process.env.NODE_ENV === "production" && allowedOrigins.length === 0) {
  throw new Error("CORS_ORIGIN is not set in production!");
}

// Define the public Cloudflare R2 URL (change this if needed)
const PUBLIC_R2_URL = process.env.R2_PUBLIC_ACCESS_URL;

export default [
  "strapi::logger",
  "strapi::errors",

  // Security Middleware:
  // Sets Content Security Policy (CSP) to allow images and media from Cloudflare R2
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "img-src": ["'self'", "data:", "blob:", PUBLIC_R2_URL],
          "media-src": ["'self'", "data:", "blob:", PUBLIC_R2_URL],
        },
      },
    },
  },

  // CORS Middleware: Allows requests from configured origins
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

  // Custom Middleware: API Key Injection for Authentication Proxy
  "global::auth-proxy",
];
