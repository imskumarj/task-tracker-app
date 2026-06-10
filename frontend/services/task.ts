import { api } from "./api";

export interface TaskSubmission {
  suid: string;
  name: string;
  content?: string;
  document_url?: string;
  submitted_at?: string;
}

export interface TaskEvaluation {
  remarks: string;
  created_at?: string;
}

export interface TaskInstructor {
  iuid: string;
  name: string;
}

export interface StudentTask {
  tuid: string;
  iuid: string;
  suid: string;

  title: string;
  content: string;

  document_url?: string;

  status:
    | "assigned"
    | "submitted"
    | "evaluated"
    | "resubmit";

  instructor: TaskInstructor;

  submissions: TaskSubmission[];

  evaluations: TaskEvaluation[];
}

export interface StudentTasksResponse {
  success: boolean;
  tasks: StudentTask[];
}

export const getStudentTasks =
  async (): Promise<StudentTasksResponse> => {
    const { data } = await api.get(
      "/tasks/student"
    );

    return data;
  };

export interface SubmitTaskPayload {
  tuid: string;
  content?: string;
  documentUrl?: string;
}

export const submitTask =
  async ({
    tuid,
    content,
    documentUrl,
  }: SubmitTaskPayload) => {

    const { data } =
      await api.post(
        `/tasks/${tuid}/submit`,
        {
          content,
          document_url:
            documentUrl,
        }
      );

    return data;
  };

export const getTaskById =
  async (tuid: string) => {
    const { data } = await api.get(
      `/tasks/${tuid}`
    );

    return data;
  };