import { factories } from "@strapi/strapi";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const generateJWT = (userId, email) => {
  return jwt.sign({ id: userId, email: email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export default factories.createCoreController(
  "api::user-custom.user-custom",
  ({ strapi }) => ({
    /**
     * Register User
     */
    async register(ctx) {
      const { username, email, password } = ctx.request.body;

      // Check if user already exists
      const existingUser = await strapi.entityService.findMany(
        "api::user-custom.user-custom",
        { filters: { email } }
      );
      if (existingUser.length > 0) return ctx.badRequest("User already exists");

      // Create user
      const user = await strapi.entityService.create(
        "api::user-custom.user-custom",
        {
          data: { username, email, password: password },
        }
      );

      // ✅ Generate JWT token for the newly registered user
      const token = generateJWT(user.id, user.email);

      return ctx.send({ message: "User registered successfully", token, user });
    },

    /**
     * Login User
     */
    async login(ctx) {
      const { email, password } = ctx.request.body;

      const user = await strapi.entityService.findMany(
        "api::user-custom.user-custom",
        { filters: { email } }
      );
      if (user.length === 0)
        return ctx.badRequest("Invalid email or password.");

      // Check password
      const validPassword = await bcrypt.compare(password, user[0].password);
      if (!validPassword) return ctx.badRequest("Invalid email or password");

      // Generate JWT token
      const token = generateJWT(user[0].id, user[0].email);

      return ctx.send({
        token,
        user: {
          id: user[0].id,
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
