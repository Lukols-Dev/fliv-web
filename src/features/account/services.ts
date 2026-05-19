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

export type UploadAvatarResult = {
  avatarUrl: string;
};

export function deleteCurrentUser(options: { signal?: AbortSignal } = {}) {
  return apiFetchPath<{ success: boolean }>(accountEndpoints.deleteMe, {
    method: "DELETE",
    signal: options.signal,
    withCredentials: true,
  });
}

export function uploadCurrentUserAvatar(
  file: File,
  options: { signal?: AbortSignal } = {}
) {
  const formData = new FormData();
  formData.append("file", file);

  return apiFetchPath<UploadAvatarResult>(accountEndpoints.avatar, {
    method: "POST",
    body: formData,
    signal: options.signal,
    withCredentials: true,
    headers: {},
  });
}
