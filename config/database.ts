import path from "path";

export default ({ env }) => {
  const client = env("DATABASE_CLIENT", "postgres");

  const isProduction = env("NODE_ENV") === "production";

  const connections = {
    mysql: {
      connection: {
        host: env("DATABASE_HOST", "localhost"),
        port: env.int("DATABASE_PORT", 3306),
        database: env("DATABASE_NAME", "strapi"),
        user: env("DATABASE_USERNAME", "strapi"),
        password: env("DATABASE_PASSWORD", "strapi"),
        ssl: env.bool("DATABASE_SSL", false) && {
          key: env("DATABASE_SSL_KEY", undefined),
          cert: env("DATABASE_SSL_CERT", undefined),
          ca: env("DATABASE_SSL_CA", undefined),
          capath: env("DATABASE_SSL_CAPATH", undefined),
          cipher: env("DATABASE_SSL_CIPHER", undefined),
          rejectUnauthorized: env.bool(
            "DATABASE_SSL_REJECT_UNAUTHORIZED",
            true
          ),
        },
      },
      pool: {
        min: env.int("DATABASE_POOL_MIN", 2),
        max: env.int("DATABASE_POOL_MAX", 10),
      },
    },
    postgres: {
      connection: isProduction
        ? {
            // Production Database (Railway)
            host: env("DATABASE_HOST", "your-production-db-host"),
            port: env.int("DATABASE_PORT", 5432),
            database: env("DATABASE_NAME", "your-production-db-name"),
            user: env("DATABASE_USERNAME", "your-production-db-user"),
            password: env("DATABASE_PASSWORD", "your-production-db-password"),
            ssl: env.bool("DATABASE_SSL", true),
          }
        : {
            // Local Database (PostgreSQL or SQLite)
            host: env("DATABASE_HOST", "localhost"),
            port: env.int("DATABASE_PORT", 5432),
            database: env("DATABASE_NAME", "strapi"),
            user: env("DATABASE_USERNAME", "admin"),
            password: env("DATABASE_PASSWORD", "superStrapi$123"),
            ssl: env.bool("DATABASE_SSL", false),
          },
      /**/

      /*
        connectionString: env('DATABASE_URL'),
        host: env('DATABASE_HOST', 'localhost'),
        port: env.int('DATABASE_PORT', 5432),
        database: env('DATABASE_NAME', 'strapi'),
        user: env('DATABASE_USERNAME', 'admin'),
        password: env('DATABASE_PASSWORD', 'superStrapi$123'),
        ssl: env.bool('DATABASE_SSL', false) // && {
          // key: env('DATABASE_SSL_KEY', undefined),
          // cert: env('DATABASE_SSL_CERT', undefined),
          // ca: env('DATABASE_SSL_CA', undefined),
          // capath: env('DATABASE_SSL_CAPATH', undefined),
          // cipher: env('DATABASE_SSL_CIPHER', undefined),
          // ejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', true),
        },
        */

      schema: env("DATABASE_SCHEMA", "public"),
    },
    pool: {
      min: env.int("DATABASE_POOL_MIN", 2),
      max: env.int("DATABASE_POOL_MAX", 10),
    },
  };

  return {
    connection: {
      client,
      ...connections[client],
      acquireConnectionTimeout: env.int("DATABASE_CONNECTION_TIMEOUT", 60000),
    },
  };
};
