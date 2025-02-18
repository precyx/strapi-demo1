import nodemailer from "nodemailer";
import fs from "fs";
import Handlebars from "handlebars";
import path from "path";

const sendEmail = async (
  to: string,
  subject: string,
  templateName: string,
  variables: any
) => {
  try {
    // ✅ Ensure templates are read from `src/` instead of `dist/`
    const templatePath = path.join(
      process.cwd(),
      "src",
      "templates",
      `${templateName}.html`
    );

    // ✅ Check if the template exists before reading
    if (!fs.existsSync(templatePath)) {
      console.error(
        `❌ Email template "${templateName}.html" not found at ${templatePath}`
      );
      throw new Error(`Email template "${templateName}" does not exist.`);
    }

    // ✅ Read and compile the email template
    const templateSource = fs.readFileSync(templatePath, "utf8");
    const template = Handlebars.compile(templateSource);
    const htmlContent = template(variables);

    // ✅ Configure Nodemailer (MailHog setup)
    const transporter = nodemailer.createTransport({
      host: "localhost",
      port: 1025, // MailHog default port
      ignoreTLS: true,
    });

    // ✅ Send the email
    const info = await transporter.sendMail({
      from: "no-reply@yourdomain.com",
      to,
      subject,
      html: htmlContent,
    });

    console.log(`📧 Email sent to ${to}: ${info.messageId}`);
  } catch (error) {
    console.error("❌ Email Sending Failed:", error.message);
  }
};

export default sendEmail;
