import { isAxiosError } from 'axios';

export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (isAxiosError(error)) {
    return error.response?.data?.error?.message ?? fallback;
  }
  return fallback;
}
