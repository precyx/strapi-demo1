export default {
  routes: [
    {
      method: "POST",
      path: "/user-custom/register",
      handler: "user-custom.register",
      config: { policies: [] },
    },
    {
      method: "POST",
      path: "/user-custom/login",
      handler: "user-custom.login",
      config: { policies: [] },
    },
    {
      method: "POST",
      path: "/user-custom/me",
      handler: "user-custom.me",
      config: { middlewares: ["global::jwtAuth"] },
    },
    {
      method: "PUT",
      path: "/user-custom/update",
      handler: "user-custom.update",
      config: { policies: [] },
    },
    {
      method: "PUT",
      path: "/user-custom/change-password",
      handler: "user-custom.changePassword",
      config: { policies: [] },
    },
    {
      method: "POST",
      path: "/user-custom/forgot-password",
      handler: "user-custom.forgotPassword",
      config: { policies: [] },
    },
    {
      method: "POST",
      path: "/user-custom/reset-password",
      handler: "user-custom.resetPassword",
      config: { policies: [] },
    },
  ],
};
