import nodemailer from "nodemailer";
import fs from "fs";
import Handlebars from "handlebars";
import path from "path";
import mailgun from "mailgun-js";

const EMAIL_MODE = process.env.EMAIL_MODE;

/**
 * Mail Gun
 */
// prettier-ignore
const sendEmailMailGun = async (from: string, to: string, subject: string, htmlContent: any) => { // prettier-ignore
  debugger;
  const mg = mailgun({
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
  });
  const data = {
    from: from,
    to,
    subject,
    html: htmlContent,
  };
  mg.messages().send(data, (error, body) => {
    if (error) {
      console.error("❌ Email Sending Failed:", error);
      throw new ApplicationError(`Email sending failed: ${error.message}`);
    } else {
      console.log(`📧 [Live] Email sent to ${to}: ${body.message}`);
    }
  });
};

/**
 * Node Mailer
 */
// prettier-ignore
const sendEmailNodemailer = async (from: string, to: string, subject: string, htmlContent: any) => {
  let transporter = nodemailer.createTransport({
    host: "localhost",
    port: 1025, // MailHog default port
    ignoreTLS: true,
  });
  const info = await transporter.sendMail({
    from: from,
    to,
    subject,
    html: htmlContent,
  });
  console.log(`📧 [Test] Email sent to ${to}: ${info.messageId}`);
};

/**
 * Send Email
 */
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
    const FROM = `"Snaiders Clean" ${process.env.EMAIL_FROM}`;

    if (EMAIL_MODE === "production") {
      await sendEmailMailGun(FROM, to, subject, htmlContent);
    } else {
      await sendEmailNodemailer(FROM, to, subject, htmlContent);
    }
  } catch (error) {
    console.error("❌ Email Sending Failed:", error.message);
  }
};

export default sendEmail;
