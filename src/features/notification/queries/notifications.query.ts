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
    queryKey: notificationQueryKeys.list({ page, limit }),
    queryFn: async ({ signal }): Promise<NotificationsPageResult> => {
      const dtos = await listNotifications({
        page,
        limit: limit + 1,
        signal,
        headers: params.headers,
      });

      const hasNext = dtos.length > limit;
      const sliced = dtos.slice(0, limit);

      return {
        items: sliced.map((dto) =>
          mapNotificationDtoToListItem(dto, params.locale)
        ),
        page,
        limit,
        hasNext,
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
