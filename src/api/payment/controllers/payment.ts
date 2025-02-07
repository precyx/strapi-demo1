module.exports = {
  async createOrder(ctx) {
    const { ids } = ctx.request.body;

    console.log("data", ctx.request.body);
    debugger;

    try {
      const order = await strapi
        .service("api::payment.payment")
        .createOrder(ids);

      console.log("order", order);

      ctx.send(order);
    } catch (err) {
      return ctx.badRequest(err.message, err.details);
    }
  },

  async captureOrder(ctx) {
    const { orderId } = ctx.request.body;

    try {
      const capture = await strapi
        .service("api::payment.payment")
        .captureOrder(orderId);
      ctx.send(capture);
    } catch (err) {
      return ctx.badRequest(err.message, err.details);
    }
  },
};
