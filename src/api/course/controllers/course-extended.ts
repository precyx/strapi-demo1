import { factories } from "@strapi/strapi";
import { Context } from "koa";
import { Strapi } from "@strapi/types/dist/core";
import qs from "qs";

export default factories.createCoreController(
  "api::course.course",
  ({ strapi }) => ({
    /**
     * Get My Courses
     */
    // Custom controller method to fetch courses by userId
    async myCourses(ctx: Context) {
      try {
        //debugger;
        let user = ctx.state.user;
        let { populate } = ctx.request.query;

        if (!user) return ctx.unauthorized("You are not logged in."); // prettier-ignore

        console.log("🦋 User", user);

        const coursesByUser = await strapi
          .documents("api::course.course")
          .findMany({
            filters: { user_customs: { id: user.id } },
            populate: populate,
            limit: 10,
            start: 0,
          });

        // Manually add meta data if needed
        const meta = {
          pagination: {
            page: 1,
            pageSize: 10,
            pageCount: Math.ceil(coursesByUser.length / 10),
            total: coursesByUser.length,
          },
        };

        return { data: coursesByUser, meta: meta}; // prettier-ignore
      } catch (err) {
        console.log("❌ GET MY COURSES: ", err);
        return (ctx as any).badRequest(err.message, err.details);
      }
    },
  })
);
