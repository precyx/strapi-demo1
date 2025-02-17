import jwt from "jsonwebtoken";

export default (config, { strapi }) => {
  return async (ctx, next) => {
    try {
      // ✅ Extract token from the request body
      const token = ctx.request.body?.token;

      if (!token) {
        return ctx.unauthorized("No token provided in request body.");
      }

      // ✅ Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
        id: string;
      };

      // ✅ Attach user ID to request
      ctx.state.user = await strapi.entityService.findOne(
        "api::user-custom.user-custom",
        decoded.id
      );

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
