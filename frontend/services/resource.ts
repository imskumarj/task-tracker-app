import { api } from "./api";

export interface ResourceInstructor {
  iuid: string;
  name: string;
}

export interface StudentResource {
  ruid: string;

  title: string;

  description?: string;

  document_url?: string;

  created_at: string;

  instructor: ResourceInstructor;
}

export interface StudentResourcesResponse {
  success: boolean;
  resources: StudentResource[];
}

export const getStudentResources =
  async (): Promise<StudentResourcesResponse> => {
    const { data } = await api.get(
      "/resources/student"
    );

    return data;
  };

export const getResourceById =
  async (ruid: string) => {
    const { data } = await api.get(
      `/resources/${ruid}`
    );

    return data;
  };