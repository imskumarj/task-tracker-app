import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth";
import adminRoutes from "./routes/admin";
import studentRoutes from "./routes/student";
// import instructorRoutes from "./routes/instructors";
// import taskRoutes from "./routes/tasks";
// import resourceRoutes from "./routes/resources";
// import uploadRoutes from "./routes/uploads";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
    ],
    credentials: true,
  })
);

app.use(express.json());

app.get(
  "/api/health",
  (_req, res) => {
    res.json({
      success: true,
      message:
        "TaskBoard API Running",
    });
  }
);

/*
|--------------------------------------------------------------------------
| Auth
|--------------------------------------------------------------------------
*/

app.use(
  "/api/auth",
  authRoutes
);

/*
|--------------------------------------------------------------------------
| Admin
|--------------------------------------------------------------------------
*/

app.use(
  "/api/admin",
  adminRoutes
);

/*
|--------------------------------------------------------------------------
| Students
|--------------------------------------------------------------------------
*/

app.use(
  "/api/student",
  studentRoutes
);

/*
|--------------------------------------------------------------------------
| Instructors
|--------------------------------------------------------------------------
*/

// app.use(
//   "/api/instructors",
//   instructorRoutes
// );

/*
|--------------------------------------------------------------------------
| Tasks
|--------------------------------------------------------------------------
*/

// app.use(
//   "/api/tasks",
//   taskRoutes
// );

/*
|--------------------------------------------------------------------------
| Resources
|--------------------------------------------------------------------------
*/

// app.use(
//   "/api/resources",
//   resourceRoutes
// );

/*
|--------------------------------------------------------------------------
| Uploads
|--------------------------------------------------------------------------
*/

// app.use(
//   "/api/uploads",
//   uploadRoutes
// );

export default app;