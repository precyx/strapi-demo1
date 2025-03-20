module.exports = {
  routes: [
    {
      method: "POST",
      path: "/payment/create-order",
      handler: "payment.createOrder",
      config: {
        policies: [],
        middlewares: ["global::jwtAuth"],
      },
    },
    {
      method: "POST",
      path: "/payment/capture-order",
      handler: "payment.captureOrder",
      config: {
        policies: [],
        middlewares: ["global::jwtAuth"],
      },
    },
    {
      method: "GET",
      path: "/payment/pagomovil-bank-info",
      handler: "payment.pagomovilBankInfo",
      config: {
        policies: [],
        middlewares: ["global::jwtAuth"],
      },
    },
  ],
};
