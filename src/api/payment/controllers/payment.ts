module.exports = {
  async createOrder(ctx) {
    const { amount } = ctx.request.body;

    console.log("data", ctx.request.body);

    try {
      const order = await strapi
        .service("api::payment.payment")
        .createOrder(amount);

      console.log("order", order);

      ctx.send(order);
    } catch (err) {
      ctx.throw(500, err);
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
      ctx.throw(500, err);
    }
  },
};
