module.exports = ({ env }) => ({
  /**
   * Cloudflare Upload Plugin
   */
  upload: {
    config: {
      provider: "strapi-provider-cloudflare-r2",
      providerOptions: {
        accessKeyId: env("R2_ACCESS_KEY"),
        secretAccessKey: env("R2_SECRET_KEY"),
        /**
         * `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`
         */
        endpoint: env("R2_ENDPOINT"),
        params: {
          Bucket: env("R2_BUCKET"),
        },
        /**
         * Set this Option to store the CDN URL of your files and not the R2 endpoint URL in your DB.
         * Can be used in Cloudflare R2 with Domain-Access or Public URL: https://pub-<YOUR_PULIC_BUCKET_ID>.r2.dev
         * This option is required to upload files larger than 5MB, and is highly recommended to be set.
         * Check the cloudflare docs for the setup: https://developers.cloudflare.com/r2/data-access/public-buckets/#enable-public-access-for-your-bucket
         */
        cloudflarePublicAccessUrl: env("R2_PUBLIC_ACCESS_URL"),
        /**
         * Sets if all assets should be uploaded in the root dir regardless the strapi folder.
         * It is useful because strapi sets folder names with numbers, not by user's input folder name
         * By default it is false
         */
        pool: false,
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {
          ACL: null, // Ensures proper permissions for deletion
        },
      },
    },
  },

  /**
   * Email Plugin
   */
  /**
   * Email Plugin
   */
  email: {
    config: {
      provider: "nodemailer", // Use nodemailer for both dev and prod
      providerOptions:
        env("NODE_ENV") === "production"
          ? {} // Use Strapi's default production email settings
          : {
              host: "localhost", // Use MailHog in development
              port: 1025,
              ignoreTLS: true,
            },
      settings: {
        defaultFrom: "no-reply@example.com",
        defaultReplyTo: "support@example.com",
      },
    },
  },
  // ...
});
