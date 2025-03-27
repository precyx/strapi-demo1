module.exports = {
  routes: [
    {
      method: "POST",
      path: "/payment/create-order-paypal",
      handler: "payment.createOrderPaypal",
      config: {
        policies: [],
        middlewares: ["global::jwtAuth"],
      },
    },
    {
      method: "POST",
      path: "/payment/capture-order-paypal",
      handler: "payment.captureOrderPaypal",
      config: {
        policies: [],
        middlewares: ["global::jwtAuth"],
      },
    },
    {
      method: "POST",
      path: "/payment/capture-order-pagomovil",
      handler: "payment.captureOrderPagomovil",
      config: {
        policies: [],
        middlewares: ["global::jwtAuth"],
      },
    },
    {
      method: "GET",
      path: "/payment/pagomovil-bank-info",
      handler: "payment.getPagomovilBankInfo",
      config: {
        policies: [],
        middlewares: ["global::jwtAuth"],
      },
    },
  ],
};
