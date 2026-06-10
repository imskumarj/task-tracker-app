import { Router } from "express";

import {
  authenticate,
  requireStudent,
} from "../middleware/auth";

import {
  getStudentResources,
  getResourceById,
} from "../controllers/resource";

const router = Router();

router.get(
  "/student",
  authenticate,
  requireStudent,
  getStudentResources
);

router.get(
  "/:ruid",
  authenticate,
  getResourceById
);

export default router;