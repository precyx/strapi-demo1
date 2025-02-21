import { factories } from "@strapi/strapi";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sendEmail from "../../../services/email";
import { Context } from "koa";
import Joi from "joi";

const generateJWT = (documentId, email, days) => {
  return jwt.sign(
    { documentId: documentId, email: email },
    process.env.JWT_SECRET,
    {
      expiresIn: days,
    }
  );
};

/**
 * Login
 */
export const login = async ({ email, password }) => {
  const user = await strapi.documents("api::user-custom.user-custom").findMany({
    filters: { email },
  });

  if (user.length === 0) {
    throw new Error("Invalid email or password.");
  }

  // Check password
  const validPassword = await bcrypt.compare(password, user[0].password);
  if (!validPassword) {
    throw new Error("Invalid email or password.");
  }

  // Generate JWT token
  const loginToken = generateJWT(user[0].documentId, user[0].email, "7d");

  return { loginToken, user: user[0] };
};
