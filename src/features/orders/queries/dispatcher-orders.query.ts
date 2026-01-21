import { queryOptions, keepPreviousData } from "@tanstack/react-query";
import { ApiError } from "@/config/http/api-client";
import { ordersQueryKeys } from "../lib/query-keys";
import { listDispatcherOrders } from "../services";
import { mapDispatcherOrderToListItem } from "../mappers/map-dispatcher-order";
import type { OrdersPageResult } from "../types";

type Params = {
  page: number;
  limit: number;
  status?: string;
  headers?: HeadersInit;
};

export function dispatcherOrdersQueryOptions(params: Params) {
  const page = params.page > 0 ? params.page : 1;
  const limit = params.limit > 0 ? params.limit : 10;

  return queryOptions({
    queryKey: ordersQueryKeys.list({ status: params.status, page, limit }),

    queryFn: async ({ signal }): Promise<OrdersPageResult> => {
      const res = await listDispatcherOrders({
        status: params.status,
        page,
        limit,
        signal,
        headers: params.headers,
      });

      return {
        items: res.items.map(mapDispatcherOrderToListItem),
        page: res.page,
        limit: res.limit,
        totalItems: res.totalItems,
        totalPages: res.totalPages,
        hasNext: res.hasNext,
        status: params.status,
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
