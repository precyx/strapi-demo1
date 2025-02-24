const axios = require("axios");

const { errors } = require("@strapi/utils");
const { ApplicationError, UnauthorizedError } = errors;

const PAYPAL_API = process.env.PAYPAL_API || "https://api-m.sandbox.paypal.com";
const CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

module.exports = {
  async getCoursePrices(courseIds) {
    const courses = await strapi.documents("api::course.course").findMany({
      filters: { documentId: { $in: courseIds } },
      fields: ["id", "price"],
    });

    if (!courses.length) {
      throw new Error("No valid courses found for the given IDs.");
    }

    return courses.map((course) => ({
      id: course.id,
      price: course.price || 0,
      documentId: course.documentId,
    }));
  },

  /**
   * Create Order
   */
  async createOrder(courseIds: string[]) {
    if (!courseIds || courseIds.length === 0) {
      throw new ApplicationError("No course IDs provided.");
    }

    // ✅ get course prices
    const courses = await this.getCoursePrices(courseIds);

    console.log("🐸 CREATE ORDER - courses", courses);

    const totalAmount = courses
      .reduce((sum, course) => sum + course.price, 0)
      .toFixed(2);

    const purchase_units = [
      {
        description: `Courses: ${courseIds.join(", ")}`,
        amount: {
          currency_code: "USD",
          value: totalAmount,
        },
      },
    ];

    // ✅ encode authentication for paypal
    const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString(
      "base64"
    );

    // ✅ create paypal order
    const response = await axios.post(
      `${PAYPAL_API}/v2/checkout/orders`,
      {
        intent: "CAPTURE",
        purchase_units,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${auth}`,
        },
      }
    );

    return response.data;
  },

  /**
   * Capture Order
   */
  async captureOrder(user, orderId) {
    debugger;
    if (!user) {
      throw new UnauthorizedError("You are not logged in.");
    }
    if (!orderId) {
      throw new ApplicationError("Order ID is required.");
    }

    // ✅ encode authentication for paypal
    const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString(
      "base64"
    );

    // ✅ get cart
    let cart = await strapi.documents("api::cart.cart").findFirst({
      filters: { user: { documentId: user.documentId } },
      populate: "*",
    });

    if (!cart) {
      throw new ApplicationError("Cart not found for this user.");
    }

    let cartCourses = cart.courses.map((course) => course.documentId);

    // ✅ capture paypal order
    const paypalCapture = await axios.post(
      `${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${auth}`,
        },
      }
    );
    const paypalCaptureData = paypalCapture.data;

    if (paypalCaptureData.status !== "COMPLETED") {
      throw new ApplicationError(
        `PayPal order capture failed: ${paypalCaptureData.status}`
      );
    }

    // ✅ update user's bought courses
    const updatedCourses = [...new Set([...user.courses, ...cartCourses])];
    await strapi.documents("api::user-custom.user-custom").update({
      documentId: user.documentId,
      data: { courses: updatedCourses },
    });

    // ✅ clear cart
    await strapi.documents("api::cart.cart").delete({
      documentId: cart.documentId,
    });

    return paypalCaptureData;
  },
};
