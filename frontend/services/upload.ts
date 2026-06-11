import { api } from "./api";

export const uploadFile = async (
  file: File
): Promise<string> => {
  const formData =
    new FormData();

  formData.append(
    "file",
    file
  );

  const { data } =
    await api.post(
      "/files/upload",
      formData,
    );

  return data.url;
};