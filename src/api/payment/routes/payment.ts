module.exports = {
    routes: [
      {
        method: "POST",
        path: "/payment/create-order",
        handler: "payment.createOrder",
        config: {
            "policies": []
          }
      },
      {
        method: "POST",
        path: "/payment/capture-order",
        handler: "payment.captureOrder",
        config: {
            "policies": []
          }
      },
    ],
  };
  