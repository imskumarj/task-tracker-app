import { api }
from "@/services/api";

export const uploadTaskDocument =
  async (
    file: File,
    category:
      | "tasks"
      | "resources"
      | "submissions" =
      "submissions"
  ) => {

    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );

    formData.append(
      "category",
      category
    );

    const { data } =
      await api.post(
        "/files/upload",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

    return data.url;
  };