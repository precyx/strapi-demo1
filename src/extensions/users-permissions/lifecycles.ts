/*
import sendEmail from "../../../../services/email";

export default {
  async afterCreate(event) {
    const { result } = event;
    const { email, username } = result;

    console.log("🎈 AFTER CREATE");

    try {
      await sendEmail(email, "Welcome to Our Course!", "welcome-email", {
        name: username,
        course_url: "https://yourwebsite.com/courses",
      });

      console.log(`Welcome email sent to ${email}`);
    } catch (error) {
      console.error("Error sending welcome email:", error);
    }
  },
};
*/

export default {
  async afterCreate(event) {
    console.log("🎈 BEFORE CREATE - User");
  },
};
