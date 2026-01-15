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
  const limit = params.limit > 0 ? params.limit : 12;

  return queryOptions({
    queryKey: ordersQueryKeys.list({ status: params.status, page, limit }),

    queryFn: async ({ signal }): Promise<OrdersPageResult> => {
      const dtos = await listDispatcherOrders({
        status: params.status,
        page,
        limit: limit + 1,
        signal,
        headers: params.headers,
      });

      const hasNext = dtos.length > limit;
      const sliced = dtos.slice(0, limit);

      return {
        items: sliced.map(mapDispatcherOrderToListItem),
        page,
        limit,
        hasNext,
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
