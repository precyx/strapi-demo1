import { factories } from "@strapi/strapi";
import { Context } from "koa";

const OrderPopulate = {
  courses: {
    populate: {
      videoPreview: true,
    },
  },
};

export default factories.createCoreController(
  "api::order.order",
  ({ strapi }) => ({
    /**
     * Get
     */
    async get(ctx) {
      try {
        // ✅ check if user is logged in
        if (!ctx.state.user) return ctx.unauthorized("You are not logged in."); // prettier-ignore
        let user = ctx.state.user;

        // ✅ get orders by user
        const orders = await strapi.documents("api::order.order").findMany({
          filters: { user: { documentId: user.documentId } },
          populate: OrderPopulate,
        });

        ctx.send(orders);
      } catch (err) {
        console.log("❌ ORDERS GET: ", err);
        return (ctx as any).badRequest(err.message, err.details);
      }
    },
  })
);
