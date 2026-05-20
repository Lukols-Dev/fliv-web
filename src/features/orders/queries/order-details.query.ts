import { queryOptions } from "@tanstack/react-query";
import { ApiError } from "@/config/http/api-client";
import { ordersQueryKeys } from "../lib/query-keys";
import { getOrderById } from "../services";
import type { OrderDetailsDto } from "../types";

type Params = {
  id: string;
  headers?: HeadersInit;
};

export function orderDetailsQueryOptions(params: Params) {
  return queryOptions({
    queryKey: ordersQueryKeys.detail(params.id),

    queryFn: async ({ signal }): Promise<OrderDetailsDto> => {
      return getOrderById(params.id, {
        signal,
        headers: params.headers,
      });
    },

    enabled: !!params.id,

    staleTime: 30_000,
    gcTime: 5 * 60_000,

    retry: (count, error) => {
      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403 || error.status === 404)
      ) {
        return false;
      }
      return count < 2;
    },
  });
}
