import sendEmail from "../../../services/email";
import axios from "axios";
import { UID, Data } from "@strapi/strapi";
import { errors } from "@strapi/utils";
const { ApplicationError, UnauthorizedError } = errors;

type User = Data.ContentType<"api::user-custom.user-custom">;

const PAYPAL_API = process.env.PAYPAL_API || "https://api-m.sandbox.paypal.com";
const CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

const OrderPopulate = {
  courses: {
    populate: {
      videoPreview: true,
    },
  },
  user: true,
};

const _createPaypalOrder = async (purchase_units: any[]) => {
  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"); // prettier-ignore
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
};

const _capturePaypalOrder = async (method, endpoint, data = {}) => {
  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
  const response = await axios({
    method,
    url: `${PAYPAL_API}/v2/checkout/orders/${endpoint}`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
    data,
  });
  return response.data;
};

const _getCoursePrices = async (courseIds: string[]) => {
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
};

module.exports = {
  /**
   * Create Order
   */
  async createOrder(courseIds: string[]) {
    if (!courseIds?.length) throw new ApplicationError("No course IDs provided."); // prettier-ignore

    // ✅ get course prices
    const courses = await _getCoursePrices(courseIds);
    const totalAmount = courses.reduce((sum, course) => sum + course.price, 0).toFixed(2); // prettier-ignore
    const purchase_units = [
      {
        description: `Courses: ${courseIds.join(", ")}`,
        amount: {
          currency_code: "USD",
          value: totalAmount,
        },
      },
    ];
    console.log("🐸 CREATE ORDER - courses", courses);

    // ✅ create paypal order
    let response = _createPaypalOrder(purchase_units);
    return response;
  },

  /**
   * Capture Order
   */
  async captureOrder(user: User, orderId: string) {
    debugger;
    if (!user) throw new UnauthorizedError("You are not logged in.");
    if (!orderId) throw new ApplicationError("Order ID is required.");

    // ✅ get cart
    let cart = await strapi.documents("api::cart.cart").findFirst({
      filters: { user: { documentId: user.documentId } },
      populate: "*",
    });
    if (!cart?.courses?.length) throw new ApplicationError("Cart not found for this user."); // prettier-ignore

    let cartCoursesIds: string[] = cart.courses.map((course) => course.documentId); // prettier-ignore
    let userCoursesIds: string[] = user.courses.map((course) => course.documentId); // prettier-ignore

    // ✅ check for already purchased courses
    const alreadyPurchasedCourses = user.courses.filter((course) => cartCoursesIds.includes(course.documentId)); // prettier-ignore
    if (alreadyPurchasedCourses.length > 0) {
      throw new ApplicationError(`You have already purchased the following courses: ${alreadyPurchasedCourses.join(", ")}`); // prettier-ignore
    }

    // ✅ Get PayPal order details
    let paypalOrder = await _capturePaypalOrder("GET", orderId);

    // ✅ check if paypal total matches the cart total
    let _paypalTotal = parseFloat(paypalOrder.purchase_units[0].amount.value); // prettier-ignore
    let _cartTotal = cart.courses.reduce((sum, course) => sum + course.price, 0); // prettier-ignore
    let TOLERANCE = 0.1;
    if (Math.abs(_paypalTotal - _cartTotal) > TOLERANCE) {
      throw new ApplicationError(`PayPal total does not match cart total: ${_paypalTotal} !== ${_cartTotal}`); // prettier-ignore
    }

    // ✅ Create Order object
    const order = {
      user: user.documentId,
      orderId: orderId,
      paymentMethod: "paypal",
      courses: cart.courses.map((course) => course.documentId),
      totalPrice: _paypalTotal,
      prices: cart.courses.map((course) => {
        return {
          price: course.price,
          documentId: course.documentId,
        };
      }),
      //
      orderDate: new Date(),
      orderStatus: "created",
      orderHistory: "created",
      //
    };

    // ✅ Create order object
    let newOrder = await strapi.documents("api::order.order").create({
      populate: OrderPopulate,
      data: { ...order },
    });

    // ✅ Capture PayPal order
    const paypalCaptureData = await _capturePaypalOrder("POST", `${orderId}/capture`); // prettier-ignore
    if (paypalCaptureData.status !== "COMPLETED") {
      throw new ApplicationError(`PayPal order capture failed: ${paypalCaptureData.status}`); // prettier-ignore
    }

    // ✅ Update order object
    newOrder = await strapi.documents("api::order.order").update({
      populate: OrderPopulate,
      documentId: newOrder.documentId,
      data: {
        orderStatus: "paypal captured",
        orderHistory: newOrder.orderHistory + ", paypal captured",
      },
    });

    // ✅ Update user's bought courses
    const updatedCourses = [...new Set([...userCoursesIds, ...cartCoursesIds])];
    await strapi.documents("api::user-custom.user-custom").update({
      documentId: user.documentId,
      data: { courses: updatedCourses },
    });

    // ✅ Update order object
    newOrder = await strapi.documents("api::order.order").update({
      populate: OrderPopulate,
      documentId: newOrder.documentId,
      data: {
        orderStatus: "courses added",
        orderHistory: newOrder.orderHistory + ", coursesAdded",
        courses: cartCoursesIds,
      },
    });

    // ✅ Clear cart
    await strapi.documents("api::cart.cart").delete({
      documentId: cart.documentId,
    });

    debugger;

    // ✅ Send user email
    let to = user.email;
    let subject = "Gracias por tu compra";
    let templateName = "order-user";
    const baseUrl = process.env.CORS_ORIGIN;
    const imgBaseUrl = process.env.CORS_ORIGIN_LIVE;
    let variables = {
      baseUrl: baseUrl,
      imgBaseUrl: imgBaseUrl,
      username: newOrder.user.username,
      email: newOrder.user.email,
      courses: newOrder.courses,
      paymentMethod: newOrder.paymentMethod,
      orderId: newOrder.orderId,
      orderDate: newOrder.orderDate,
      totalPrice: newOrder.totalPrice + "",
    };
    await sendEmail(to, subject, templateName, variables);

    /*
    // ✅ send admin email
    let to2 = "ADMIN-EMAIL";
    let subject2 = "Gracias por tu compra";
    let templateName2 = "order-admin";
    let variables2 = {
      username: user.username,
      email: user.email,
      courses: newOrder.courses,
    };
    await sendEmail(to2, subject2, templateName2, variables2);
    */

    return paypalCaptureData;
  },
};
