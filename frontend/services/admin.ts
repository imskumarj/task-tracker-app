import { api } from "./api";

export const getStudents =
  async () => {
    const response =
      await api.get(
        "/admin/students"
      );

    return response.data;
  };

export const getInstructors =
  async () => {
    const response =
      await api.get(
        "/admin/instructors"
      );

    return response.data;
  };

export const approveStudent =
  async (id: string) => {
    const response =
      await api.patch(
        `/admin/students/${id}/approve`
      );

    return response.data;
  };

export const approveInstructor =
  async (id: string) => {
    const response =
      await api.patch(
        `/admin/instructors/${id}/approve`
      );

    return response.data;
  };

export const deleteStudent =
  async (id: string) => {
    const response =
      await api.delete(
        `/admin/students/${id}`
      );

    return response.data;
  };

export const deleteInstructor =
  async (id: string) => {
    const response =
      await api.delete(
        `/admin/instructors/${id}`
      );

    return response.data;
  };