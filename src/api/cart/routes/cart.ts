export default {
  routes: [
    {
      method: "GET",
      path: "/cart",
      handler: "cart.get",
      config: { middlewares: ["global::jwtAuth"] },
    },
    {
      method: "POST",
      path: "/cart/update",
      handler: "cart.update",
      config: { middlewares: ["global::jwtAuth"] },
    },
    {
      method: "POST",
      path: "/cart/delete",
      handler: "cart.delete",
      config: { middlewares: ["global::jwtAuth"] },
    },
  ],
};
