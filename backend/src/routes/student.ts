import { Router } from "express";

import {
  authenticate,
  requireStudent,
} from "../middleware/auth";

import {
  getStudentProfile,
} from "../controllers/student";

import {
  getStudentTasks,
  submitTask,
} from "../controllers/task";

const router = Router();

router.get(
  "/me",
  authenticate,
  requireStudent,
  getStudentProfile
);

router.get(
  "/tasks",
  authenticate,
  requireStudent,
  getStudentTasks
);

router.post(
  "/tasks/:id/submit",
  authenticate,
  requireStudent,
  submitTask
);

export default router;