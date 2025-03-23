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
     * Get All By User
     */
    async getAllByUser(ctx) {
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
        console.log("❌ ORDERS GET ALL BY USER: ", err);
        return (ctx as any).badRequest(err.message, err.details);
      }
    },

    /**
     * Get By User
     */
    async getByUser(ctx) {
      try {
        const { orderId } = ctx.params;

        // ✅ check if user is logged in
        if (!ctx.state.user) return ctx.unauthorized("You are not logged in."); // prettier-ignore
        let user = ctx.state.user;

        // ✅ get order
        const order = await strapi.documents("api::order.order").findOne({
          documentId: orderId,
          populate: "*",
        });

        // ✅ check if order is by user
        if (!order || order.user.documentId !== user.documentId) {
          return ctx.unauthorized("You are not authorized to view this order.");
        }
        ctx.send(order);
      } catch (err) {
        console.log("❌ ORDERS GET BY USER: ", err);
        return (ctx as any).badRequest(err.message, err.details);
      }
    },
  })
);
