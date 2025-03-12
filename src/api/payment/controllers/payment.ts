import { Context } from "koa";

module.exports = {
  async createOrder(ctx: Context) {
    const { ids } = ctx.request.body;

    try {
      const order = await strapi.service("api::payment.payment").createOrder(ids); // prettier-ignore
      console.log("order", order);
      ctx.send(order);
    } catch (err) {
      debugger;
      console.log("❌ CREATE ORDER: ", err);
      return (ctx as any).badRequest(err.message, err.details);
    }
  },

  async captureOrder(ctx: Context) {
    let user = ctx.state.user;
    const { orderId } = ctx.request.body;

    try {
      const capture = await strapi.service("api::payment.payment").captureOrder(user, orderId); // prettier-ignore
      ctx.send(capture);
    } catch (err) {
      console.log("❌ CAPTURE ORDER: ", err);
      return (ctx as any).badRequest(err.message, err.details);
    }
  },
};
