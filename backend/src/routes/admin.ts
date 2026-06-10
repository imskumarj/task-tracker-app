import { Router } from "express";

import {
  getPendingStudents,
  getPendingInstructors,
  approveStudent,
  approveInstructor,
  deleteStudent,
  deleteInstructor,
  getApprovedStudents,
  getApprovedInstructors,
  getStudents,
  getInstructors,
} from "../controllers/admin";

import {
  authenticate,
} from "../middleware/auth";

import {
  adminOnly,
} from "../middleware/admin";

const router = Router();

router.use(
  authenticate,
  adminOnly
);

router.get(
  "/students",
  getStudents
);

router.get(
  "/instructors",
  getInstructors
);

router.get(
  "/students/pending",
  getPendingStudents
);

router.get(
  "/students/approved",
  getApprovedStudents
);

router.patch(
  "/students/:id/approve",
  approveStudent
);

router.delete(
  "/students/:id",
  deleteStudent
);

router.get(
  "/instructors/pending",
  getPendingInstructors
);

router.get(
  "/instructors/approved",
  getApprovedInstructors
);

router.patch(
  "/instructors/:id/approve",
  approveInstructor
);

router.delete(
  "/instructors/:id",
  deleteInstructor
);

export default router;