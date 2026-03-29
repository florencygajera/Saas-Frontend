import { AxiosError } from "axios";

type ApiErrorPayload = {
  detail?: string;
  message?: string;
};

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (error instanceof AxiosError) {
    const payload = error.response?.data as ApiErrorPayload | undefined;
    return payload?.detail || payload?.message || error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}

