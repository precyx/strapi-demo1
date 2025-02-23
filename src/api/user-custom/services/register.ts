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
export const register = async ({
  username,
  email,
  password,
  phone,
  country,
}) => {
  // ✅ check if user already exists
  const existingUser = await strapi
    .documents("api::user-custom.user-custom")
    .findMany({
      filters: { email },
    });

  if (existingUser.length > 0) throw new Error("User already exists");

  validateUserData({ username, email, password, phone, country });

  // ✅ create user
  const user = await strapi.documents("api::user-custom.user-custom").create({
    data: { username, email, password: password, phone, country },
  });

  // ✅ generate jwt
  const loginToken = generateJWT(user.documentId, user.email, "7d");
  // ✅ generate confirmation token
  const confirmationToken = generateJWT(user.documentId, user.email, "1d");
  // ✅ generate registration linke
  const registrationLink = `${process.env.CORS_ORIGIN}/login/verify-email?token=${confirmationToken}`;

  // ✅ send email
  let to = email;
  let subject = "Confirm Your Registration";
  let templateName = "confirm-registration";
  let variables = {
    name: username,
    registrationLink: registrationLink,
    email: email,
  };
  await sendEmail(to, subject, templateName, variables);

  return { loginToken, user };
};
