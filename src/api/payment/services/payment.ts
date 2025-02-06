const axios = require("axios");

const PAYPAL_API = process.env.PAYPAL_API || "https://api-m.sandbox.paypal.com"; // PayPal API URL
const CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

module.exports = {
  async createOrder(amount) {
    try {
      console.log("armount", amount);
      const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString(
        "base64"
      );
      const response = await axios.post(
        `${PAYPAL_API}/v2/checkout/orders`,
        {
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: "USD",
                value: amount || "1.00",
              },
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${auth}`,
          },
        }
      );
      return response.data;
    } catch (err) {
      throw new Error(`Failed to create order: ${err.message}`);
    }
  },

  async captureOrder(orderId) {
    try {
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
      return response.data;
    } catch (err) {
      throw new Error(`Failed to capture order: ${err.message}`);
    }
  },
};
