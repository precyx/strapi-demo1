import { factories } from "@strapi/strapi";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

/**
 * Confirm Registration
 */
export const confirmRegistration = async (confirmToken: string) => {
  // ✅ decode confirm token
  const decoded = jwt.verify(confirmToken, process.env.JWT_SECRET) as {
    documentId: string;
    email: string;
  };

  console.log("🏀 CONFIRM REGISTRATION - decoded token", decoded);

  // ✅ set user 'confirmed'
  let user = await strapi.documents("api::user-custom.user-custom").update({
    documentId: decoded.documentId,
    data: { confirmed: true },
  });

  return {
    email: decoded.email,
    confirmed: user.confirmed,
    message: "Email successfully verified!",
  };
};
