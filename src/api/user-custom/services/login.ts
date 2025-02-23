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
  // ✅ get user
  const user = await strapi
    .documents("api::user-custom.user-custom")
    .findFirst({
      filters: { email },
    });

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  // ✅ check pw
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    throw new Error("Invalid email or password.");
  }

  // ✅ generate jwt
  const loginToken = generateJWT(user.documentId, user.email, "7d");

  return { loginToken, user: user };
};
