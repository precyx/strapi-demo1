import { factories } from "@strapi/strapi";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

/**
 * Confirm Registration
 */
export const confirmRegistration = async (confirmToken: string) => {
  // Decode the token
  const decoded = jwt.verify(confirmToken, process.env.JWT_SECRET) as {
    documentId: string;
    email: string;
  };

  // Log decoded information for debugging purposes
  console.log("🏀 CONFIRM REGISTRATION - decoded token", decoded);

  // Find the user by documentId and update `confirmed`
  let user = await strapi.documents("api::user-custom.user-custom").update({
    documentId: decoded.documentId,
    data: { confirmed: true },
  });

  // Return the result
  return {
    email: decoded.email,
    confirmed: user.confirmed,
    message: "Email successfully verified!",
  };
};
