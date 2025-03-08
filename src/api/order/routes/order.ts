export default {
  routes: [
    {
      method: "GET",
      path: "/orders",
      handler: "order.get",
      config: { middlewares: ["global::jwtAuth"] },
    },
  ],
};
