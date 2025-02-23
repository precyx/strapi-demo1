module.exports = {
  routes: [
    {
      method: "GET",
      path: "/my-courses",
      handler: "course-extended.myCourses",
      config: {
        policies: [],
        middlewares: ["global::jwtAuth"],
      },
    },
  ],
};
