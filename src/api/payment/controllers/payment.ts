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
    const { paymentMethod, paymentDetails } = ctx.request.body;

    try {
      const capture = await strapi.service("api::payment.payment").captureOrder(user, paymentMethod, paymentDetails); // prettier-ignore
      ctx.send(capture);
    } catch (err) {
      console.log("❌ CAPTURE ORDER: ", err);
      return (ctx as any).badRequest(err.message, err.details);
    }
  },

  async pagomovilBankInfo(ctx: Context) {
    let user = ctx.state.user;
    try {
      const bankInfo = await strapi.service("api::payment.payment").pagomovilBankInfo(user); // prettier-ignore
      ctx.send(bankInfo);
    } catch (err) {
      console.log("❌ PAGOMOVIL BANK INFO: ", err);
      return (ctx as any).badRequest(err.message, err.details);
    }
  },
};
