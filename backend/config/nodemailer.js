/**
 * Create a transporter for sending emails
 */

import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // allow less secure apps to access the email account for localhost
  tls: {
    rejectUnauthorized: process.env.SMTP_PRODUCTION,
  },
});

export default transporter;
