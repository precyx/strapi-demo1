import { factories } from "@strapi/strapi";
import { Context } from "koa";

export default factories.createCoreController(
  "api::cart.cart",
  ({ strapi }) => ({
    /**
     * Get
     */
    async get(ctx) {
      try {
        //ctx.throw(404, "Data not found");

        //debugger;
        if (!ctx.state.user) {
          return ctx.unauthorized("You are not logged in.");
        }
        let user = ctx.state.user;

        // ✅ get cart
        const cart = await strapi.documents("api::cart.cart").findFirst({
          filters: { user: { documentId: user.documentId } },
          populate: "*",
        });

        /*if (!cart) {
          return ctx.notFound("Cart not found for this user.");
        }*/

        ctx.send(cart || { courses: [] });
      } catch (err) {
        console.log("❌ CART GET: ", err);
        return ctx.badRequest("Error fetching the cart.");
      }
    },

    /**
     * Update
     */
    async update(ctx) {
      try {
        //debugger;
        let user = ctx.state.user;
        const { courseId } = ctx.request.body; // courseId and quantity will be passed in the request body

        if (!ctx.state.user) return ctx.unauthorized("You are not logged in."); // prettier-ignore

        // ✅ find cart by user
        let cart;
        cart = await strapi.documents("api::cart.cart").findFirst({
          filters: { user: { documentId: user.documentId } },
          populate: "*",
        });

        // ✅ If no cart found, create a new one
        if (!cart) {
          cart = await strapi.documents("api::cart.cart").create({
            data: { user: user.documentId, courses: [] },
            populate: "*",
          });
        }

        // ✅ find course
        let course = await strapi.documents("api::course.course").findFirst({
          filters: { documentId: courseId },
        });
        if (!course) return ctx.badRequest("Course not found"); // prettier-ignore

        // ✅ check if course is already in the cart
        if (!cart.courses.includes(courseId)) cart.courses.push(courseId);

        // ✅ update cart
        let updatedCart = await strapi.documents("api::cart.cart").update({
          documentId: cart.documentId,
          data: {
            courses: cart.courses,
            user: user.documentId,
          },
          populate: "*",
        });

        ctx.send(updatedCart);
      } catch (err) {
        console.log("❌ UPDATE CART: ", err);
        return (ctx as any).badRequest(err.message, err.details);
      }
    },

    /**
     * Delete
     */
    async delete(ctx) {
      debugger;
      try {
        let user = ctx.state.user;
        const { courseId } = ctx.request.body;

        if (!ctx.state.user) return ctx.unauthorized("You are not logged in."); // prettier-ignore

        // ✅ find cart by user
        let cart = await strapi.documents("api::cart.cart").findFirst({
          filters: { user: { documentId: user.documentId } },
          populate: "*",
        });
        if (!cart) return ctx.notFound("Cart not found for this user.");

        // ✅ If no courseId provided, delete the whole cart
        if (!courseId) {
          await strapi.documents("api::cart.cart").delete({
            documentId: cart.documentId,
          });
          return ctx.send({ message: "Cart cleared successfully." });
        }

        // ✅ remove course from cart
        const updatedCourses = cart.courses.filter((item) => item.documentId !== courseId); // prettier-ignore

        // ✅ update cart
        if (updatedCourses.length !== cart.courses.length) {
          cart.courses = updatedCourses;

          let updatedCart = await strapi.documents("api::cart.cart").update({
            documentId: cart.documentId,
            data: cart as any,
            populate: "*",
          });

          return ctx.send(updatedCart);
        }

        // ✅ if the course was not found in the cart
        return ctx.badRequest("Course not found in cart.");
      } catch (err) {
        ctx.throw(500, "Error removing the course from the cart.");
      }
    },
  })
);
