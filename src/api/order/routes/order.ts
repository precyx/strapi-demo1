export default {
  routes: [
    {
      method: "GET",
      path: "/orders",
      handler: "order.getAllByUser",
      config: { middlewares: ["global::jwtAuth"] },
    },
    {
      method: "GET",
      path: "/orders/:orderId",
      handler: "order.getByUser",
      config: { middlewares: ["global::jwtAuth"] },
    },
  ],
};
