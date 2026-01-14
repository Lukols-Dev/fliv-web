import { apiFetchPath } from "@/config/http/api-client";
import { notificationEndpoints } from "./lib/endpoints";
import type { NotificationDto } from "./types";

type ListNotificationsOptions = {
  signal?: AbortSignal;
  headers?: HeadersInit;
};

export function listNotifications(options: ListNotificationsOptions = {}) {
  const { signal, headers } = options;

  return apiFetchPath<NotificationDto[]>(notificationEndpoints.list, {
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
