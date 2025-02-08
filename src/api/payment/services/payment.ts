const axios = require("axios");

const { errors } = require("@strapi/utils");
const { ApplicationError } = errors;

const PAYPAL_API = process.env.PAYPAL_API || "https://api-m.sandbox.paypal.com";
const CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

module.exports = {
  async getCoursePrices(courseIds) {
    const courses = await strapi.entityService.findMany("api::course.course", {
      filters: { documentId: { $in: courseIds } },
      fields: ["id", "price", "documentId"],
    } as any);

    if (!courses.length) {
      throw new Error("No valid courses found for the given IDs.");
    }

    return courses.map((course) => ({
      id: course.id,
      price: course.price || 0,
    }));
  },

  async createOrder(courseIds: string[]) {
    if (!courseIds || courseIds.length === 0) {
      throw new ApplicationError("No course IDs provided.");
    }

    // Fetch course prices directly from Strapi's DB
    const courses = await this.getCoursePrices(courseIds);

    // Calculate total price
    const totalAmount = courses
      .reduce((sum, course) => sum + course.price, 0)
      .toFixed(2);

    // Construct PayPal purchase units
    const purchase_units = [
      {
        description: `Courses: ${courseIds.join(", ")}`,
        amount: {
          currency_code: "USD",
          value: totalAmount,
        },
      },
    ];

    // Encode authentication for PayPal
    const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString(
      "base64"
    );

    // Create PayPal order
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

  async captureOrder(orderId) {
    if (!orderId) {
      throw new ApplicationError("Order ID is required.");
    }

    const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString(
      "base64"
    );

    const response = await axios.post(
      `${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${auth}`,
        },
      }
    );
    const data = response.data;

    // 🔍 Ensure the transaction was actually completed
    if (data.status !== "COMPLETED") {
      throw new ApplicationError(`PayPal order capture failed: ${data.status}`);
    }

    debugger;
    return data;
  },
};
