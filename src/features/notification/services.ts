import { apiFetchPath } from "@/config/http/api-client";
import { notificationEndpoints } from "./lib/endpoints";
import type { NotificationDto } from "./types";

type ListNotificationsOptions = {
  page?: number;
  limit?: number;
  signal?: AbortSignal;
  headers?: HeadersInit;
};

function withQuery(
  path: string,
  query: Record<string, string | number | undefined>
) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined) continue;
    sp.set(k, String(v));
  }
  const qs = sp.toString();
  return qs ? `${path}?${qs}` : path;
}

export function listNotifications(options: ListNotificationsOptions = {}) {
  const { page, limit, signal, headers } = options;

  const path = withQuery(notificationEndpoints.list, {
    page,
    limit,
  });

  return apiFetchPath<NotificationDto[]>(path, {
    method: "GET",
    signal,
    withCredentials: true,
    headers,
  });
}

type DeleteNotificationOptions = {
  signal?: AbortSignal;
};

export function deleteNotification(
  id: string,
  options: DeleteNotificationOptions = {}
) {
  return apiFetchPath<{ success: boolean }>(
    notificationEndpoints.deleteById(id),
    {
      method: "DELETE",
      signal: options.signal,
      withCredentials: true,
    }
  );
}

type ClearAllNotificationsOptions = {
  signal?: AbortSignal;
};

export function clearAllNotifications(
  options: ClearAllNotificationsOptions = {}
) {
  return apiFetchPath<{ success: boolean }>(notificationEndpoints.clearAll, {
    method: "DELETE",
    signal: options.signal,
    withCredentials: true,
  });
}
