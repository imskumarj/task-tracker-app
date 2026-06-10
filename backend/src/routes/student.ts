import { Router } from "express";

import {
  authenticate,
  requireStudent,
} from "../middleware/auth";

import {
  getStudentProfile,
} from "../controllers/student";

const router = Router();

router.get(
  "/me",
  authenticate,
  requireStudent,
  getStudentProfile
);

export default router;