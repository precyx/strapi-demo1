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
  // Read and compile email template
  const templatePath = path.join(
    __dirname,
    `../templates/${templateName}.html`
  );
  const templateSource = fs.readFileSync(templatePath, "utf8");
  const template = Handlebars.compile(templateSource);
  const htmlContent = template(variables);

  // Configure Nodemailer (MailHog setup for local testing)
  const transporter = nodemailer.createTransport({
    host: "localhost",
    port: 1025, // MailHog default port
    ignoreTLS: true,
  });

  // Send email
  await transporter.sendMail({
    from: "no-reply@yourdomain.com",
    to,
    subject,
    html: htmlContent,
  });

  console.log(`Email sent to ${to}`);
};

export default sendEmail;
