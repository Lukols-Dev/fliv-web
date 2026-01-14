import { apiFetchPath } from "@/config/http/api-client";
import { accountEndpoints } from "./lib/endpoints";

export interface CurrentUserResult {
  id: string;
  email: string;
  roles: string[];
  isActive: boolean;

  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
}

export type UpdateProfilePayload = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  // consents?: {...} // jeśli masz w DTO
};

type GetCurrentUserOptions = {
  signal?: AbortSignal;
  headers?: HeadersInit;
};

export function getCurrentUser(options: GetCurrentUserOptions = {}) {
  const { signal, headers } = options;

  return apiFetchPath<CurrentUserResult>(accountEndpoints.me, {
    method: "GET",
    signal,
    withCredentials: true,
    headers,
  });
}

type UpdateProfileOptions = {
  signal?: AbortSignal;
};

export function updateCurrentUserProfile(
  payload: UpdateProfilePayload,
  options: UpdateProfileOptions = {}
) {
  return apiFetchPath<{ success: boolean }>(accountEndpoints.profile, {
    method: "PATCH",
    body: JSON.stringify(payload),
    signal: options.signal,
    withCredentials: true,
  });
}
