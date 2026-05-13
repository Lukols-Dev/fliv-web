import { queryOptions } from "@tanstack/react-query";
import { ApiError } from "@/config/http/api-client";
import { ordersQueryKeys } from "../lib/query-keys";
import { getOrderLastKnownLocation } from "../services";
import type { DriverLiveLocationDto } from "../types";

type Params = {
  id: string;
};

export function orderLocationQueryOptions(params: Params) {
  return queryOptions({
    queryKey: ordersQueryKeys.location(params.id),

    queryFn: async ({ signal }): Promise<DriverLiveLocationDto | null> => {
      return getOrderLastKnownLocation(params.id, { signal });
    },

    enabled: !!params.id,
    staleTime: 10_000,
    gcTime: 5 * 60_000,
    refetchInterval: 10_000,

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
