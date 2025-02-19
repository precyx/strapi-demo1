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

const userSchema = Joi.object({
  username: Joi.string().min(3).alphanum().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(3).required(),
  phone: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .optional(),
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

export default factories.createCoreController(
  "api::user-custom.user-custom",
  ({ strapi }) => ({
    /**
     * Register User
     */
    async register(ctx: Context) {
      try {
        const { username, email, password, phone, country } = ctx.request.body;

        const existingUser = await strapi
          .documents("api::user-custom.user-custom")
          .findMany({
            filters: { email },
          });

        if (existingUser.length > 0)
          return ctx.badRequest("User already exists");

        validateUserData({ username, email, password, phone, country });

        // ✅ Create user
        const user = await strapi
          .documents("api::user-custom.user-custom")
          .create({
            data: { username, email, password: password, phone, country },
          });

        // ✅ Generate JWT token for the newly registered user
        const loginToken = generateJWT(user.documentId, user.email, "7d");
        // ✅ Generate confirmation token
        const confirmationToken = generateJWT(
          user.documentId,
          user.email,
          "1d"
        );

        // ✅ Generate registration link
        const registrationLink = `${process.env.CORS_ORIGIN}/login/verify-email?token=${confirmationToken}`;

        // ✅ Send email using Handlebars template
        let to = email;
        let subject = "Confirm Your Registration";
        let templateName = "confirm-registration";
        let variables = {
          name: username,
          registrationLink: registrationLink,
          email: email,
        };
        await sendEmail(to, subject, templateName, variables);

        return ctx.send({
          message: "User registered successfully",
          loginToken,
          user,
        });
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },

    /**
     * Login User
     */
    async login(ctx) {
      const { email, password } = ctx.request.body;

      const user = await strapi
        .documents("api::user-custom.user-custom")
        .findMany({
          filters: { email },
        });

      if (user.length === 0)
        return ctx.badRequest("Invalid email or password.");

      // Check password
      const validPassword = await bcrypt.compare(password, user[0].password);
      if (!validPassword) return ctx.badRequest("Invalid email or password");

      // Generate JWT token
      const loginToken = generateJWT(user[0].documentId, user[0].email, "7d");

      return ctx.send({
        loginToken,
        user: {
          documentId: user[0].documentId,
          username: user[0].username,
          email: user[0].email,
        },
      });
    },

    /**
     * Get Authenticated User
     */
    async me(ctx) {
      // ✅ Ensure the user is attached from `jwtAuth`
      if (!ctx.state.user) {
        return ctx.unauthorized("You are not logged in.");
      }

      return ctx.send(ctx.state.user);
    },

    /**
     * Confirm Registration
     */
    async confirmRegistration(ctx) {
      const { confirmToken } = ctx.request.body;

      try {
        // ✅ Decode the token
        const decoded = jwt.verify(confirmToken, process.env.JWT_SECRET) as {
          documentId: string;
          email: string;
        };

        console.log("🏀 CONFIRM REGISTRATION - decoded token", decoded);
        console.log("--");

        // ✅ Find user by documentId and update `confirmed`
        strapi.documents("api::user-custom.user-custom").update({
          documentId: decoded.documentId,
          data: { confirmed: true },
        });

        return ctx.send({
          email: decoded.email,
          confirmed: true,
          message: "Email successfully verified!",
        });
      } catch (error) {
        return ctx.badRequest("Invalid or expired token.");
      }
    },

    // 🔹 Update User Profile
    async update(ctx) {
      /*
    const userId = ctx.state.user.id;
    const { username, email } = ctx.request.body;

    const updatedUser = await strapi.entityService.update("api::user-custom.user-custom", userId, { data: { username, email } });

    return ctx.send({ message: "User updated successfully", user: updatedUser });
    */
    },

    // 🔹 Change Password
    async changePassword(ctx) {
      /*
    const userId = ctx.state.user.id;
    const { oldPassword, newPassword } = ctx.request.body;

    const user = await strapi.entityService.findOne("api::user-custom.user-custom", userId);
    const validPassword = await bcrypt.compare(oldPassword, user.password);
    if (!validPassword) return ctx.badRequest("Old password is incorrect");

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await strapi.entityService.update("api::user-custom.user-custom", userId, { data: { password: hashedPassword } });

    return ctx.send({ message: "Password changed successfully" });
    */
    },

    // 🔹 Forgot Password
    async forgotPassword(ctx) {
      /*
    const { email } = ctx.request.body;

    const user = await strapi.entityService.findMany("api::user-custom.user-custom", { filters: { email } });
    if (user.length === 0) return ctx.badRequest("User not found");

    const resetToken = jwt.sign({ id: user[0].id }, "your_secret_key", { expiresIn: "1h" });

    // Send email (Integrate with your email service)
    console.log(`Password reset token: ${resetToken}`);

    return ctx.send({ message: "Password reset email sent" });
    */
    },

    // 🔹 Reset Password
    async resetPassword(ctx) {
      /*
    const { token, newPassword } = ctx.request.body;

    try {
      const decoded = jwt.verify(token, "your_secret_key");
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await strapi.entityService.update("api::user-custom.user-custom", decoded.id, { data: { password: hashedPassword } });

      return ctx.send({ message: "Password reset successfully" });
    } catch (error) {
      return ctx.badRequest("Invalid or expired token");
    }
    */
    },
  })
);
