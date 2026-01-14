import { queryOptions } from "@tanstack/react-query";
import { notificationQueryKeys } from "../lib/query-keys";
import { listNotifications } from "../services";
import type { Notification } from "../types";
import { ApiError } from "@/config/http/api-client";
import { mapNotificationDto } from "../mappers/map-notyfication";

type Params = { headers?: HeadersInit };

export function notificationsQueryOptions(params: Params = {}) {
  return queryOptions({
    queryKey: notificationQueryKeys.list(),
    queryFn: async ({ signal }): Promise<Notification[]> => {
      const dtos = await listNotifications({ signal, headers: params.headers });
      return dtos.map(mapNotificationDto);
    },
    staleTime: 15_000,
    gcTime: 5 * 60_000,
    retry: (count, error) => {
      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403)
      ) {
        return false;
      }
      return count < 2;
    },
  });
}
