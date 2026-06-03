import nodemailer from "nodemailer";
import { envVars } from "../../config/env";

export const transporter = nodemailer.createTransport({
  host: envVars.EMAIL_SENDER_SMTP_HOST,
  port: Number(envVars.EMAIL_SENDER_SMTP_PORT),
  secure: Number(envVars.EMAIL_SENDER_SMTP_PORT) === 465,
  auth: {
    user: envVars.EMAIL_SENDER_SMTP_USER,
    pass: envVars.EMAIL_SENDER_SMTP_PASS,
  },
});

export const sendMail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  return transporter.sendMail({
    from: `"Rated Docs" <${envVars.EMAIL_SENDER_SMTP_FROM}>`,
    to,
    subject,
    html,
  });
};
