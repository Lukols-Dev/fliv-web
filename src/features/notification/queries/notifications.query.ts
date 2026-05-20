import { queryOptions, keepPreviousData } from "@tanstack/react-query";
import { notificationQueryKeys } from "../lib/query-keys";
import { listNotifications } from "../services";
import type { NotificationsPageResult } from "../types";
import { ApiError } from "@/config/http/api-client";
import { mapNotificationDtoToListItem } from "../mappers/map-notification-list-item";

type Params = {
  page: number;
  limit: number;
  locale: string;
  headers?: HeadersInit;
};

export function notificationsQueryOptions(params: Params) {
  const page = params.page > 0 ? params.page : 1;
  const limit = params.limit > 0 ? params.limit : 12;

  return queryOptions({
    queryKey: notificationQueryKeys.list({ page, limit, locale: params.locale }),
    queryFn: async ({ signal }): Promise<NotificationsPageResult> => {
      const res = await listNotifications({
        page,
        limit,
        signal,
        headers: params.headers,
      });

      return {
        page: res.page,
        limit: res.limit,
        totalItems: res.totalItems,
        totalPages: res.totalPages,
        hasNext: res.hasNext,
        items: res.items.map((dto) =>
          mapNotificationDtoToListItem(dto, params.locale)
        ),
      };
    },
    placeholderData: keepPreviousData,
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
