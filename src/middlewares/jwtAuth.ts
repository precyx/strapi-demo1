import jwt from "jsonwebtoken";
import { Context } from "koa";
import { Strapi } from "@strapi/types/dist/core";

export default (config, { strapi: Strapi }) => {
  return async (ctx: Context, next) => {
    try {
      let loginToken: any = ctx.request.header["user-authorization"];
      console.log("🌈 logintoken", loginToken);

      if (!loginToken) {
        return ctx.unauthorized("No token provided in request body.");
      }

      loginToken = loginToken.replace("Bearer ", "");

      // ✅ Verify the token
      const decoded = jwt.verify(loginToken, process.env.JWT_SECRET) as {
        documentId: string;
      };

      // ✅ Attach user documentId to request
      let user = await strapi
        .documents("api::user-custom.user-custom")
        .findOne({
          documentId: decoded.documentId,
          populate: "*",
        });
      ctx.state.user = user;

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
