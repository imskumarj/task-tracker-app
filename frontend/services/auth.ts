import { api } from "./api";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  role: "student" | "instructor";
  college?: string;
  semester?: string;
}

export const login = async (payload: LoginPayload) => {
  const response = await api.post("/auth/login", payload);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const logout = async () => {
  localStorage.removeItem("loginTime");
  const response = await api.post("/auth/logout");
  return response.data;
};

export const register = async (payload: RegisterPayload) => {
  const response = await api.post("/auth/register", payload);
  return response.data;
};

export const registerSendOtp = async (
  email: string
) => {
  const response = await api.post(
    "/auth/register/send-otp",
    { email }
  );

  return response.data;
};

export const registerVerifyOtp = async (
  email: string,
  otp: string
) => {
  const response = await api.post(
    "/auth/register/verify-otp",
    {
      email,
      otp,
    }
  );

  return response.data;
};

export const forgotPasswordSendOtp =
  async (email: string) => {
    const response =
      await api.post(
        "/auth/forgot-password/send-otp",
        { email }
      );

    return response.data;
  };

export const forgotPasswordReset =
  async (payload: {
    email: string;
    otp: string;
    password: string;
  }) => {
    const response =
      await api.post(
        "/auth/forgot-password/reset",
        payload
      );

    return response.data;
  };