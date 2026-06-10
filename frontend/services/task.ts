import { api } from "./api";

export interface StudentTask {
  tuid: string;

  title: string;

  content?: string;

  document_url?: string;

  status:
    | "assigned"
    | "submitted"
    | "resubmit"
    | "evaluated";

  instructor?: {
    iuid: string;
    name: string;
  };

  submissions?: any[];

  evaluations?: any[];

  createdAt?: string;

  updatedAt?: string;
}

export const getStudentTasks =
  async () => {
    const { data } =
      await api.get(
        "/student/tasks"
      );

    return data;
  };

export const submitTask =
  async (
    taskId: string,
    payload: {
      content?: string;
      documentUrl?: string;
    }
  ) => {
    const { data } =
      await api.post(
        `/student/tasks/${taskId}/submit`,
        payload
      );

    return data;
  };

export const getTaskById =
  async (
    taskId: string
  ) => {
    const { data } =
      await api.get(
        `/student/tasks/${taskId}`
      );

    return data;
  };