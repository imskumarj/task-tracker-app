import nodemailer from "nodemailer";

export const transporter =
  nodemailer.createTransport({
    service: "gmail",

    auth: {
      user:
        process.env.EMAIL_USER,

      pass:
        process.env.EMAIL_PASSWORD,
    },
  });

export const sendMail = async (
  to: string,
  subject: string,
  html: string
) => {
  await transporter.sendMail({
    from:
      process.env.EMAIL_USER,

    to,
    subject,
    html,
  });
};