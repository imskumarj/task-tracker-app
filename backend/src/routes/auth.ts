import { Router } from "express";

import {
  login,
  register,
  getCurrentUser,

  sendRegisterOtp,
  verifyRegisterOtp,

  sendForgotOtp,
  resetPassword,

  logout,
} from "../controllers/auth";

import { authenticate as auth } from "../middleware/auth";

const router = Router();

router.post(
  "/login",
  login
);

router.post(
  "/register",
  register
);

router.post(
  "/register/send-otp",
  sendRegisterOtp
);

router.post(
  "/register/verify-otp",
  verifyRegisterOtp
);

router.post(
  "/forgot-password/send-otp",
  sendForgotOtp
);

router.post(
  "/forgot-password/reset",
  resetPassword
);

router.get(
  "/me",
  auth,
  getCurrentUser
);

router.post(
  "/logout",
  auth,
  logout
);

export default router;