import { Context } from "koa";

module.exports = {
  async createOrder(ctx: Context) {
    const { ids } = ctx.request.body;

    try {
      const order = await strapi
        .service("api::payment.payment")
        .createOrder(ids);

      console.log("order", order);

      ctx.send(order);
    } catch (err) {
      // console.log("🚨 CREATE ORDER ERROR", err.response);
      return (ctx as any).badRequest(err.message, err.response.data);
    }
  },

  async captureOrder(ctx: Context) {
    let user = ctx.state.user;
    const { orderId } = ctx.request.body;

    try {
      const capture = await strapi
        .service("api::payment.payment")
        .captureOrder(user, orderId);
      ctx.send(capture);
    } catch (err) {
      return (ctx as any).badRequest(err.message, err.response.data);
    }
  },
};
