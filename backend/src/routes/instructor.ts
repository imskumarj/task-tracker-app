import { Router } from "express";

import {
  authenticate,
  requireInstructor,
} from "../middleware/auth";

import {
  getInstructorProfile,
  getStudents,

  getInstructorTasks,
  createTask,
  updateTask,
  deleteTask,

  getSubmissions,
  evaluateSubmission,

  getInstructorResources,
  createResource,
  deleteResource,
} from "../controllers/instructor";

const router = Router();

router.use(
  authenticate,
  requireInstructor
);

/*
|--------------------------------------------------------------------------
| Profile
|--------------------------------------------------------------------------
*/

router.get(
  "/me",
  getInstructorProfile
);

/*
|--------------------------------------------------------------------------
| Students
|--------------------------------------------------------------------------
*/

router.get(
  "/students",
  getStudents
);

/*
|--------------------------------------------------------------------------
| Tasks
|--------------------------------------------------------------------------
*/

router.get(
  "/tasks",
  getInstructorTasks
);

router.post(
  "/tasks",
  createTask
);

router.put(
  "/tasks/:id",
  updateTask
);

router.delete(
  "/tasks/:id",
  deleteTask
);

/*
|--------------------------------------------------------------------------
| Submissions
|--------------------------------------------------------------------------
*/

router.get(
  "/submissions",
  getSubmissions
);

router.patch(
  "/tasks/:id/evaluate",
  evaluateSubmission
);

/*
|--------------------------------------------------------------------------
| Resources
|--------------------------------------------------------------------------
*/

router.get(
  "/resources",
  getInstructorResources
);

router.post(
  "/resources",
  createResource
);

router.delete(
  "/resources/:id",
  deleteResource
);

export default router;