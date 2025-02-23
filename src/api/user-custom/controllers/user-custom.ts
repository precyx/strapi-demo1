import { factories } from "@strapi/strapi";
import { Context } from "koa";

import { register } from "../services/register";
import { login } from "../services/login";
import { confirmRegistration } from "../services/confirmRegistration";

export default factories.createCoreController(
  "api::user-custom.user-custom",
  ({ strapi }) => ({
    /**
     * Register User
     */
    async register(ctx: Context) {
      try {
        const { username, email, password, phone, country } = ctx.request.body;
        const { loginToken, user } = await register({
          username,
          email,
          password,
          phone,
          country,
        });

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
      try {
        const { email, password } = ctx.request.body;
        const { loginToken, user } = await login({ email, password });

        return ctx.send({
          loginToken,
          user,
        });
      } catch (error) {
        return ctx.badRequest(error.message);
      }
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
      try {
        const { confirmToken } = ctx.request.body;
        const { email, confirmed, message } =
          await confirmRegistration(confirmToken);

        // Send the successful response
        return ctx.send({
          email,
          confirmed,
          message,
        });
      } catch (error) {
        return ctx.badRequest(error.message);
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
