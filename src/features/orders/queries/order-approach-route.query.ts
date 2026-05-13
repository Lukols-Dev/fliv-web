import { queryOptions } from "@tanstack/react-query";
import { ApiError } from "@/config/http/api-client";
import { ordersQueryKeys } from "../lib/query-keys";
import { getOrderApproachRoute } from "../services";
import type { DriverApproachRouteDto } from "../types";

type Params = {
  id: string;
};

export function orderApproachRouteQueryOptions(params: Params) {
  return queryOptions({
    queryKey: ordersQueryKeys.approachRoute(params.id),

    queryFn: async ({ signal }): Promise<DriverApproachRouteDto | null> => {
      return getOrderApproachRoute(params.id, { signal });
    },

    enabled: !!params.id,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchInterval: 30_000,

    retry: (count, error) => {
      if (
        error instanceof ApiError &&
        (error.status === 400 ||
          error.status === 401 ||
          error.status === 403 ||
          error.status === 404)
      ) {
        return false;
      }
      return count < 2;
    },
  });
}
