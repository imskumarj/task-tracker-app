import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT:
    process.env.PORT || "5000",

  DATABASE_URL:
    process.env.DATABASE_URL || "",

  JWT_SECRET:
    process.env.JWT_SECRET || "",

  AWS_REGION:
    process.env.AWS_REGION || "",

  AWS_ACCESS_KEY_ID:
    process.env.AWS_ACCESS_KEY_ID || "",

  AWS_SECRET_ACCESS_KEY:
    process.env.AWS_SECRET_ACCESS_KEY || "",

  AWS_BUCKET_NAME:
    process.env.AWS_BUCKET_NAME || "",

  EMAIL_USER:
    process.env.EMAIL_USER || "",

  EMAIL_PASSWORD:
    process.env.EMAIL_PASSWORD || "",
};