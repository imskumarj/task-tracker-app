import { api } from "./api";

export interface StudentProfile {
  suid: string;
  name: string;
  clg: string;
  sem: string;
  phone: string;
  email: string;
  status: "pending" | "approved";
}

export interface StudentProfileResponse {
  success: boolean;
  student: StudentProfile;
}

export const getStudentProfile =
  async (): Promise<StudentProfileResponse> => {
    const { data } = await api.get(
      "/student/me"
    );

    return data;
  };