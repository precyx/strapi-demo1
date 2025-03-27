import { Context } from "koa";

const LOG_AND_ERROR = (msg: string, err: any, ctx: Context) => {
  console.log(msg, err);
  return (ctx as any).badRequest(err.message, err.details);
};

module.exports = {
  async createOrderPaypal(ctx: Context) {
    const { ids } = ctx.request.body;
    try {
      ctx.send(await strapi.service("api::payment.payment").createOrderPaypal(ids)); // prettier-ignore
    } catch (err) { return LOG_AND_ERROR("❌ CREATE ORDER PAYPAL: ", err, ctx); } // prettier-ignore
  },

  async captureOrderPaypal(ctx: Context) {
    let user = ctx.state.user;
    const { paymentDetails } = ctx.request.body;

    try {
      ctx.send(await strapi.service("api::payment.payment").captureOrderPaypal(user, paymentDetails)); // prettier-ignore
    } catch (err) { return LOG_AND_ERROR("❌ CAPTURE ORDER PAYPAL: ", err, ctx); } // prettier-ignore
  },

  async captureOrderPagomovil(ctx: Context) {
    let user = ctx.state.user;
    const { paymentDetails } = ctx.request.body;

    try {
      ctx.send(await strapi.service("api::payment.payment").captureOrderPagomovil(user, paymentDetails)); // prettier-ignore
    } catch (err) { return LOG_AND_ERROR("❌ CAPTURE ORDER PAGOMOViL: ", err, ctx); } // prettier-ignore
  },

  async getPagomovilBankInfo(ctx: Context) {
    let user = ctx.state.user;
    try {
      ctx.send(await strapi.service("api::payment.payment").getPagomovilBankInfo(user)); // prettier-ignore
    } catch (err) { return LOG_AND_ERROR("❌ PAGOMOVIL BANK INFO: ", err, ctx); } // prettier-ignore
  },
};
