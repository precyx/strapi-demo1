import { factories } from "@strapi/strapi";
import { Context } from "koa";
import { Strapi } from "@strapi/types/dist/core";

export default factories.createCoreController(
  "api::course.course",
  ({ strapi }) => ({
    /**
     * Register User
     */
    // Custom controller method to fetch courses by userId
    async myCourses(ctx: Context) {
      try {
        let user = ctx.state.user;
        if (!user) {
          return ctx.unauthorized("You are not logged in.");
        }

        /*const coursesByUser = await strapi.services.course.find({
        user: user.id, // Assuming "user" is the relation field in the Course model
      });*/

        /*const coursesByUser = await strapi.documents("api::course.course").findMany({
        filters: { user_customs: { $in: courseIds } },
        fields: ["id", "price"],
      });*/

        console.log("🦋 User", user);

        /*const coursesByUser = await strapi.db.query("api::course.course").findMany({
          populate: {
            videoPreview: true,
            products: {
              populate: {
                images: true,
              },
            },
          },
          where: {
            user_customs: {
              id: user.id, // Filter courses by the authenticated user's ID
            },
          },
        });*/

        const coursesByUser = await strapi
          .documents("api::course.course")
          .findMany({
            filters: { user_customs: { id: user.id } },
            populate: {
              videoPreview: true,
              products: {
                populate: {
                  images: true,
                },
              },
            },
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

        return {
          data: coursesByUser,
          meta: meta,
        };
      } catch (err) {
        console.log("err", err);
        return ctx.badRequest(err.message);
      }
    },
  })
);
