# TaskBoard

TaskBoard is a role-based task management and resource sharing platform built for **admins, instructors, and students**. It includes account approval workflows, OTP-based registration and password reset, task assignment, document uploads, student submissions, instructor evaluations, resource sharing, a web dashboard, and an Android app built with **Capacitor**.

The project is deployed with a split cloud architecture:

- **Frontend**: Next.js app deployed on **AWS CloudFront + S3**
- **Backend**: Node.js/Express API hosted on **AWS EC2**
- **Database**: **AWS RDS PostgreSQL**
- **File Storage**: **AWS S3**
- **Email**: **Nodemailer + Gmail SMTP app password**
- **Mobile App**: Android APK generated using **Capacitor**

---

## Features

### Authentication and Account Flow
- Email/password login
- OTP-based email verification during registration
- Forgot password flow with OTP
- Automatic role-based redirection after login
- Account approval workflow for students and instructors
- Secure logout and session handling

### Admin Dashboard
- View all students and instructors
- Approve pending accounts
- Delete students and instructors
- Clean dashboard with refresh and logout actions

### Instructor Dashboard
- Create, edit, and delete tasks
- Assign tasks to **all students** or **selected students by SUID**
- Upload task documents to S3
- View task PDFs inside the page using an embedded viewer
- View submissions in expandable cards
- Evaluate submissions as **evaluated** or **resubmit**
- Create resources for all or selected students
- View resources in expandable cards
- Delete tasks and resources
- Clean card-based UI for tasks, submissions, and resources

### Student Dashboard
- View assigned tasks
- Submit task responses with text and/or document upload
- Resubmit when requested by instructor
- View instructor evaluations
- View assigned resources
- Task and resource PDFs shown inside expandable cards using iframe-based viewing

### File Uploads
- PDF and document upload support
- Files are uploaded through the backend to **AWS S3**
- Organized folder structure in S3 for:
  - `tasks/`
  - `submissions/`
  - `resources/`

### Mobile App
- Android APK created from the web app using **Capacitor**
- Runs the deployed web app inside an Android WebView
- Useful for quick mobile distribution without native React Native development

---

## Tech Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Sonner
- lucide-react
- iframe-based PDF preview where needed

### Backend
- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL (AWS RDS)
- AWS S3
- JWT authentication
- Nodemailer
- Gmail SMTP app password
- Multer for multipart upload handling

### Cloud / Deployment
- AWS EC2 for backend hosting
- AWS CloudFront + S3 for frontend deployment
- AWS S3 for document storage
- AWS RDS for managed PostgreSQL
- AWS WAF enabled on CloudFront

### Mobile Build
- Capacitor
- Android Studio
- Gradle
- APK generation from the deployed frontend

---

## Project Structure

### Frontend
```text
frontend/
  app/
    admin/
    instructor/
    student/
  components/
    common/
    student/
    ui/
  context/
    AuthContext.tsx
  lib/
    upload.ts
  services/
    api.ts
    auth.ts
    admin.ts
    instructor.ts
    student.ts
    task.ts
    resource.ts
    upload.ts
```

### Backend
```text
backend/
  src/
    config/
    controllers/
    middleware/
    routes/
    types/
    utils/
  prisma/
    schema.prisma
```

---

## Main Roles

### Admin
- Can approve or delete students and instructors
- Manages account access for the platform

### Instructor
- Can create tasks and resources
- Can assign work to all students or specific students
- Can evaluate submissions
- Can upload and share documents

### Student
- Can see tasks assigned to them
- Can submit work and resubmit if asked
- Can view resources shared by instructors

---

## Environment Variables

### Frontend
```env
NEXT_PUBLIC_API_URL=https://<your-backend-domain>/api
```

### Backend
```env
PORT=5000
DATABASE_URL=postgresql://...
JWT_SECRET=...
AWS_REGION=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_BUCKET_NAME=...
EMAIL_USER=...
EMAIL_PASSWORD=...
```

---

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
- Add the frontend and backend `.env` values correctly
- Make sure AWS credentials, database URL, JWT secret, and email credentials are set

### 4. Run Prisma migration
```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

### 5. Start backend
```bash
npm run dev
```

### 6. Start frontend
```bash
cd ../frontend
npm run dev
```

---

## Auth Flow

1. User registers with email verification OTP.
2. Student or instructor account is created in **pending** status.
3. Admin approves the account from the admin dashboard.
4. User logs in and gets redirected to the correct dashboard.
5. Forgot password works through OTP verification sent by email.

---

## Task Flow

1. Instructor creates a task.
2. Task is assigned to all students or specific SUIDs.
3. Student opens the task and submits a response.
4. Task status becomes `submitted`.
5. Instructor evaluates the submission or sends it back for `resubmit`.
6. Student resubmits only when required.
7. Final status becomes `evaluated`.

---

## Resource Flow

1. Instructor creates a resource.
2. Resource is assigned to all students or selected students.
3. Student sees the resource in the resources tab.
4. Attached PDF/document can be viewed inside the page.

---

## Upload Flow

1. Frontend sends a `FormData` request to `POST /api/files/upload`.
2. Backend receives the file through Multer.
3. File is uploaded to AWS S3.
4. Public S3 URL is returned.
5. That URL is stored in the database with the task/resource/submission.

---

## API Overview

### Auth
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/register/send-otp`
- `POST /api/auth/register/verify-otp`
- `POST /api/auth/forgot-password/send-otp`
- `POST /api/auth/forgot-password/reset`
- `GET /api/auth/me`
- `POST /api/auth/logout`

### Student
- `GET /api/student/me`
- `GET /api/student/tasks`
- `GET /api/student/resources`
- `POST /api/student/tasks/:id/submit`

### Instructor
- `GET /api/instructor/me`
- `GET /api/instructor/students`
- `GET /api/instructor/tasks`
- `POST /api/instructor/tasks`
- `PUT /api/instructor/tasks/:id`
- `DELETE /api/instructor/tasks/:id`
- `GET /api/instructor/submissions`
- `PATCH /api/instructor/tasks/:id/evaluate`
- `GET /api/instructor/resources`
- `POST /api/instructor/resources`
- `DELETE /api/instructor/resources/:id`

### Admin
- `GET /api/admin/students/pending`
- `GET /api/admin/students/approved`
- `PATCH /api/admin/students/:id/approve`
- `DELETE /api/admin/students/:id`
- `GET /api/admin/instructors/pending`
- `GET /api/admin/instructors/approved`
- `PATCH /api/admin/instructors/:id/approve`
- `DELETE /api/admin/instructors/:id`

### Uploads
- `POST /api/files/upload`

---

## Database Schema Summary

### Core Models
- `Admin`
- `Instructor`
- `Student`
- `Task`
- `Resource`
- `RegisterOtp`
- `ForgotOtp`

### Task Model Highlights
- Stores task title, content, document URL, status, submissions, and evaluations
- Uses unique task UID (`tuid`)
- Supports assigned student SUIDs

### Resource Model Highlights
- Stores resource title, content, document URL, and assigned SUID list
- Uses unique resource UID (`ruid`)

---

## Cloud Setup

### Frontend Deployment
- Deployed on **S3 + CloudFront**
- Served through HTTPS
- Static Next.js output is hosted as a cloud distribution

### Backend Deployment
- Deployed on **AWS EC2**
- Served behind CloudFront for HTTPS access
- API routes and upload endpoints are exposed securely

### File Storage
- Documents and PDFs are stored in **AWS S3**
- Files are organized by feature and date-based folders

### WAF
- AWS WAF is enabled on the backend CloudFront distribution
- Upload rules were adjusted so larger PDF uploads are allowed on the upload route

---

## Android APK Build

The Android app is built using **Capacitor**:

1. Build the frontend
2. Sync it to the Android project
3. Open the Android project in Android Studio
4. Build the APK
5. Install the APK on an emulator or real device

This approach avoids rewriting the app in React Native while still providing a mobile app experience.

---

## Notes

- Role-based access is enforced throughout the app.
- PDFs are displayed inside the app using embedded viewing/iframe-based rendering.
- Uploaded files are stored in S3 and the resulting public URL is saved in the database.
- Tasks and resources are shown in expandable cards for a cleaner UI.
- Some deletions are cascaded:
  - Deleting a student removes or updates related assigned resources
  - Deleting an instructor removes their tasks and resources

---

## License

This project is currently private and maintained for internal use.
