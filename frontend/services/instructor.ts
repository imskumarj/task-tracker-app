import { api } from "./api";

export const getStudents = async () => {
  const { data } = await api.get(
    "/instructor/students"
  );

  return data;
};

export const getInstructorTasks =
  async () => {
    const { data } =
      await api.get(
        "/instructor/tasks"
      );

    return data;
  };

export const createTask =
  async (payload: any) => {
    const { data } =
      await api.post(
        "/instructor/tasks",
        payload
      );

    return data;
  };

export const updateTask =
  async (
    id: string,
    payload: any
  ) => {
    const { data } =
      await api.put(
        `/instructor/tasks/${id}`,
        payload
      );

    return data;
  };

export const deleteTask =
  async (id: string) => {
    const { data } =
      await api.delete(
        `/instructor/tasks/${id}`
      );

    return data;
  };

export const getInstructorResources =
  async () => {
    const { data } =
      await api.get(
        "/instructor/resources"
      );

    return data;
  };

export const createResource =
  async (payload: any) => {
    const { data } =
      await api.post(
        "/instructor/resources",
        payload
      );

    return data;
  };

export const deleteResource =
  async (id: string) => {
    const { data } =
      await api.delete(
        `/instructor/resources/${id}`
      );

    return data;
  };

export const getSubmissions =
  async () => {
    const { data } =
      await api.get(
        "/instructor/submissions"
      );

    return data;
  };

export const evaluateSubmission =
  async (
    taskId: string,
    payload: any
  ) => {
    const { data } =
      await api.patch(
        `/instructor/tasks/${taskId}/evaluate`,
        payload
      );

    return data;
  };

export const getInstructorProfile =
  async () => {
    const { data } =
      await api.get(
        "/instructor/me"
      );

    return data;
  };