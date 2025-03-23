import sendEmail from "../../../services/email";
import axios from "axios";
import { UID, Data } from "@strapi/strapi";
import { errors } from "@strapi/utils";
const { ApplicationError, UnauthorizedError } = errors;

type User = Data.ContentType<"api::user-custom.user-custom">;
type Order = Data.ContentType<"api::order.order">;

const PAYPAL_API = process.env.PAYPAL_API || "https://api-m.sandbox.paypal.com";
const CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const BASE_URL = process.env.CORS_ORIGIN;
const IMG_BASE_URL = process.env.CORS_ORIGIN_LIVE;
const EMAIL_ADMIN_RECEIVER = process.env.EMAIL_ADMIN_RECEIVER;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

const _sendOrderEmails = async (order: Order) => {
  const toUser = order.user.email;
  const subjectUser = "Gracias por tu compra";
  const templateNameUser = "order-user";

  const variablesForUser = {
    baseUrl: BASE_URL,
    imgBaseUrl: IMG_BASE_URL,
    username: order.user.username,
    email: order.user.email,
    courses: order.courses,
    paymentMethod: order.paymentMethod,
    orderId: order.orderId,
    orderDate: new Date(order.orderDate).toISOString().slice(0, 10),
    totalPrice: `${order.totalPrice}`,
    myOrdersLink: `${BASE_URL}/profile`,
  };
  await sendEmail(toUser, subjectUser, templateNameUser, variablesForUser);

  // Admin email
  const toAdmin = EMAIL_ADMIN_RECEIVER;
  const subjectAdmin = "Nuevo Pedido";
  const templateNameAdmin = "order-admin";

  const variablesForAdmin = {
    baseUrl: BASE_URL,
    imgBaseUrl: IMG_BASE_URL,
    username: order.user.username,
    userEmail: order.user.email,
    userPhone: order.user.phone,
    userCountry: order.user.country,
    courses: order.courses,
    paymentMethod: order.paymentMethod,
    orderId: order.orderId,
    orderDate: new Date(order.orderDate).toISOString().slice(0, 10),
    totalPrice: `${order.totalPrice}`,
    myOrdersLink: `${BASE_URL}/profile`,
  };
  await sendEmail(toAdmin, subjectAdmin, templateNameAdmin, variablesForAdmin);
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
  async captureOrder(user: User, orderId: string, paymentMethod: string) {
    debugger;
    if (!user) throw new UnauthorizedError("You are not logged in.");
    if (!orderId) throw new ApplicationError("Order ID is required.");
    if (!["paypal", "pagomovil"].includes(paymentMethod)) throw new ApplicationError("No recognized Payment Method."); // prettier-ignore

    // ✅ 1. get cart
    let cart = await strapi.documents("api::cart.cart").findFirst({
      filters: { user: { documentId: user.documentId } },
      populate: "*",
    });
    if (!cart?.courses?.length) throw new ApplicationError("Cart not found for this user."); // prettier-ignore

    let cartCoursesIds: string[] = cart.courses.map((course) => course.documentId); // prettier-ignore
    let userCoursesIds: string[] = user.courses.map((course) => course.documentId); // prettier-ignore

    // ✅ 2. check for already purchased courses
    const alreadyPurchasedCourses = user.courses.filter((course) => cartCoursesIds.includes(course.documentId)); // prettier-ignore
    if (alreadyPurchasedCourses.length > 0) {
      throw new ApplicationError(`You have already purchased the following courses: ${alreadyPurchasedCourses.join(", ")}`); // prettier-ignore
    }

    // ✅ 3. If PayPal, get the order details
    let paypalOrder;
    if (paymentMethod == "paypal") paypalOrder = await _capturePaypalOrder("GET", orderId); // prettier-ignore

    // ✅ 4. Check if paypal total matches the cart total
    let _cartTotal = cart.courses.reduce((sum, course) => sum + course.price, 0); // prettier-ignore
    let _paypalTotal = paymentMethod == "pagomovil" ? _cartTotal : parseFloat(paypalOrder.purchase_units[0].amount.value); // prettier-ignore
    let TOLERANCE = 0.1;
    if (Math.abs(_paypalTotal - _cartTotal) > TOLERANCE) {
      throw new ApplicationError(`PayPal total does not match cart total: ${_paypalTotal} !== ${_cartTotal}`); // prettier-ignore
    }

    // ✅ 5. Create Order object
    const order = {
      user: user.documentId,
      orderId: orderId,
      paymentMethod: paymentMethod,
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

    let newOrder: Order = await strapi.documents("api::order.order").create({
      populate: OrderPopulate,
      data: { ...order },
    });

    // ✅ 6. Capture PayPal order
    let paypalCaptureData;
    if (paymentMethod == "paypal") {
      paypalCaptureData = await _capturePaypalOrder("POST", `${orderId}/capture`); // prettier-ignore
      if (paypalCaptureData.status !== "COMPLETED") throw new ApplicationError(`PayPal order capture failed: ${paypalCaptureData.status}`); // prettier-ignore

      // ✅ Update order object
      newOrder = await strapi.documents("api::order.order").update({
        populate: OrderPopulate,
        documentId: newOrder.documentId,
        data: {
          orderStatus: "paypal captured",
          orderHistory: newOrder.orderHistory + ", paypal captured",
        },
      });

      // ✅ 7. Update user's bought courses
      const updatedCourses = [
        ...new Set([...userCoursesIds, ...cartCoursesIds]),
      ];
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
    }

    // ✅ 8. Clear cart
    await strapi.documents("api::cart.cart").delete({documentId: cart.documentId}); // prettier-ignore

    debugger;

    // ✅ 9. Send user email
    await _sendOrderEmails(newOrder);

    return newOrder;
  },

  /**
   * Pagomovil Bank Info
   */
  async pagomovilBankInfo(user: User) {
    debugger;

    if (!user) throw new UnauthorizedError("You are not logged in.");

    // ✅ 1. get payment settings
    let bankInfo;
    bankInfo = await strapi.documents("api::payment-setting.payment-setting").findFirst(); // prettier-ignore
    if(!bankInfo) throw new ApplicationError("No bank info found."); // prettier-ignore

    // ✅ 2. get cart total
    let cart = await strapi.documents("api::cart.cart").findFirst({
      filters: { user: { documentId: user.documentId } },
      populate: "*",
    });
    if (!cart?.courses?.length) throw new ApplicationError("Cart not found for this user."); // prettier-ignore
    let _cartTotal = cart.courses.reduce((sum, course) => sum + course.price, 0); // prettier-ignore

    // ✅ 3. update exchange rate if needed
    const lastUpdated = new Date(bankInfo.dailyExchangeRateVESUpdatedAt);
    const isInvalidDate = isNaN(lastUpdated.getTime());
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    if (isInvalidDate || lastUpdated < oneDayAgo) {
      let CURRENCY_API = `https://api.currencyapi.com/v3/latest?apikey=${process.env.CURRENCY_API_KEY}&currencies=VES`;
      let response;
      response = await axios.get(CURRENCY_API);

      if (!response?.data?.data?.VES?.value) {
        await sleep(1000);
        response = await axios.get(CURRENCY_API);
      }
      if (!response?.data?.data?.VES?.value) {
        await sleep(2000);
        response = await axios.get(CURRENCY_API);
      }
      if (!response?.data?.data?.VES?.value) {
        throw new ApplicationError("Error getting the exchange rate");
      }

      // get the exchange rate
      let _exchangeRate = response.data.data.VES.value;
      let _updatedAt = response.data.meta.last_updated_at;

      // update bank info
      bankInfo = await strapi
        .documents("api::payment-setting.payment-setting")
        .update({
          documentId: bankInfo.documentId,
          data: {
            dailyExchangeRateVES: _exchangeRate,
            dailyExchangeRateVESUpdatedAtExternal: _updatedAt,
            dailyExchangeRateVESUpdatedAt: new Date(),
          },
        });
    }

    // ✅ 4. calculate mount to pay
    let _amountToPay = (_cartTotal * parseFloat(bankInfo.dailyExchangeRateVES)).toFixed(2); // prettier-ignore

    return {
      ...bankInfo,
      amountToPay: _amountToPay,
    };
  },
};
