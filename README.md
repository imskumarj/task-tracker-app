# TaskBoard

TaskBoard is a role-based task management platform built for **admins, instructors, and students**. It supports user approval flows, task assignment, document uploads, submissions, evaluations, and resource sharing, with secure role-based access across the app.

## Features

### Authentication

* Email/password login
* OTP-based email verification during registration
* Forgot password flow with OTP
* Role-based access for **admin**, **instructor**, and **student**
* Automatic redirect to the correct dashboard after login

### Admin Dashboard

* View all students and instructors
* Approve pending accounts
* Delete any account, including approved ones
* Clean dashboard with logout and refresh actions

### Instructor Dashboard

* Create, edit, and delete tasks
* Assign tasks to **all students** or **selected students by SUID**
* View assigned student list for each task
* Upload task documents to S3
* View task PDFs inside the website
* View submissions and evaluate them
* Mark submissions as **evaluated** or **resubmit**
* Create resources for all or selected students
* Expand/collapse tasks, submissions, and resources for a cleaner UI

### Student Dashboard

* View assigned tasks
* Submit task responses with text and/or document upload
* Resubmit when requested by instructor
* View instructor evaluations
* View assigned resources
* All task and resource PDFs are shown inside the page with expandable cards

### File Uploads

* PDF and document upload support
* Files are uploaded through the backend to **AWS S3**
* Organized S3 storage for tasks, submissions, and resources

## Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* Sonner
* lucide-react
* react-pdf / iframe-based PDF viewing where needed

### Backend

* Node.js
* Express
* TypeScript
* Prisma ORM
* PostgreSQL
* AWS S3
* JWT authentication
* OTP email system

## Project Structure

```text
frontend/
  app/
  components/
  context/
  services/
  lib/

backend/
  src/
    controllers/
    routes/
    middleware/
    utils/
    config/
```

## Main Roles

### Admin

* Can manage users
* Can approve or delete students and instructors

### Instructor

* Can create tasks and resources
* Can assign work to all students or specific students
* Can evaluate submissions

### Student

* Can see tasks assigned to them
* Can submit work and resubmit if asked
* Can view resources shared by instructors

## Environment Variables

### Frontend

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Backend

```env
DATABASE_URL=
JWT_SECRET=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_BUCKET_NAME=
```

## Installation

### 1. Clone the repository

```bash
git clone <repo-url>
cd task-tracker-app
```

### 2. Install dependencies

#### Frontend

```bash
cd frontend
npm install
```

#### Backend

```bash
cd ../backend
npm install
```

### 3. Configure environment variables

* Copy the example env files if available
* Fill backend and frontend `.env` files correctly

### 4. Run Prisma migration

```bash
npx prisma migrate dev
npx prisma generate
```

### 5. Start backend

```bash
npm run dev
```

### 6. Start frontend

```bash
npm run dev
```

## Auth Flow

1. User registers with email verification OTP.
2. Student or instructor account is created in **pending** status.
3. Admin approves the account from the admin dashboard.
4. User logs in and gets redirected to the correct dashboard.

## Task Flow

1. Instructor creates a task.
2. Task is assigned to all students or specific SUIDs.
3. Student opens the task and submits response.
4. Task status becomes `submitted`.
5. Instructor evaluates the submission or sends it back for `resubmit`.
6. Student can resubmit only when required.
7. Final status becomes `evaluated` when complete.

## Resource Flow

1. Instructor creates a resource.
2. Resource is assigned to all students or selected students.
3. Student sees the resource in the resources tab.
4. Attached PDF/document can be viewed inside the website.

## API Overview

### Auth

* `POST /api/auth/login`
* `POST /api/auth/register`
* `POST /api/auth/register/send-otp`
* `POST /api/auth/register/verify-otp`
* `POST /api/auth/forgot-password/send-otp`
* `POST /api/auth/forgot-password/reset`
* `GET /api/auth/me`
* `POST /api/auth/logout`

### Student

* `GET /api/student/me`
* `GET /api/student/tasks`
* `POST /api/student/tasks/:id/submit`

### Instructor

* `GET /api/instructor/me`
* `GET /api/instructor/students`
* `GET /api/instructor/tasks`
* `POST /api/instructor/tasks`
* `PUT /api/instructor/tasks/:id`
* `DELETE /api/instructor/tasks/:id`
* `GET /api/instructor/submissions`
* `PATCH /api/instructor/tasks/:id/evaluate`
* `GET /api/instructor/resources`
* `POST /api/instructor/resources`
* `DELETE /api/instructor/resources/:id`

### Admin

* `GET /api/admin/students/pending`
* `GET /api/admin/students/approved`
* `PATCH /api/admin/students/:id/approve`
* `DELETE /api/admin/students/:id`
* `GET /api/admin/instructors/pending`
* `GET /api/admin/instructors/approved`
* `PATCH /api/admin/instructors/:id/approve`
* `DELETE /api/admin/instructors/:id`

### File Uploads

* `POST /api/files/upload`

## Notes

* All dashboards use role-based redirection.
* PDFs are displayed inside the app using an embedded viewer / iframe approach.
* Uploaded files are stored in S3 and the public URL is saved in the database.
* Tasks and resources are shown in expandable cards to keep the UI clean.

## License

This project is currently private and maintained for internal use.
