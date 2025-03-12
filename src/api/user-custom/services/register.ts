import { factories } from "@strapi/strapi";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sendEmail from "../../../services/email";
import { Context } from "koa";
import Joi from "joi";

const userSchema = Joi.object({
  username: Joi.string().min(2).alphanum().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(2).required(),
  phone: Joi.string().optional(),
  country: Joi.string().optional(),
});

// Function to validate user input using the schema
const validateUserData = (data: {
  username: string;
  email: string;
  password: string;
  phone: string;
  country: string;
}) => {
  const { error } = userSchema.validate(data);
  if (error) {
    throw new Error(error.details[0].message);
  }
};

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
 * Register
 */
// prettier-ignore
export const register = async ({username, email, password, phone, country}) => {
  // ✅ check if user already exists
  const existingUser = await strapi
    .documents("api::user-custom.user-custom")
    .findMany({
      filters: { email },
    });

  if (existingUser.length > 0) throw new Error("User already exists"); // prettier-ignore

  validateUserData({ username, email, password, phone, country });

  // ✅ create user
  const user = await strapi.documents("api::user-custom.user-custom").create({
    data: { username, email, password: password, phone, country },
  });

  // ✅ generate login and confirm token, registration link
  const loginToken = generateJWT(user.documentId, user.email, "7d");
  const confirmationToken = generateJWT(user.documentId, user.email, "1d");
  const registrationLink = `${process.env.CORS_ORIGIN}/login/verify-email?token=${confirmationToken}`;
  const baseUrl = process.env.CORS_ORIGIN;
  const imgBaseUrl = process.env.CORST_ORIGIN_LIVE;

  // ✅ send email
  let to = email;
  let subject = "Verifica tu cuenta";
  let templateName = "confirm-registration";
  let variables = {
    name: username,
    registrationLink: registrationLink,
    email: email,
    baseUrl: baseUrl,
    imgBaseUrl: imgBaseUrl
  };
  await sendEmail(to, subject, templateName, variables);

  return { loginToken, user };
};
