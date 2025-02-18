import jwt from "jsonwebtoken";

export default (config, { strapi }) => {
  return async (ctx, next) => {
    try {
      // ✅ Extract token from the request body
      const loginToken = ctx.request.body?.loginToken;

      if (!loginToken) {
        return ctx.unauthorized("No token provided in request body.");
      }

      // ✅ Verify the token
      const decoded = jwt.verify(loginToken, process.env.JWT_SECRET) as {
        documentId: string;
      };

      // ✅ Attach user documentId to request
      ctx.state.user = await strapi
        .documents("api::user-custom.user-custom")
        .findOne({
          documentId: decoded.documentId,
        });

      if (!ctx.state.user) {
        return ctx.unauthorized("Invalid token");
      }

      console.log("✅ Token Verified, Proceeding");
      return next();
    } catch (error) {
      console.error("❌ JWT Error:", error.message);
      return ctx.unauthorized("Invalid token");
    }
  };
};
