import { useQuery } from "@tanstack/react-query";
import { getOrderRoute } from "../services";
import { ordersQueryKeys } from "../lib/query-keys";

export function useOrderRouteQuery({
  id,
  enabled = true,
}: {
  id: string;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ordersQueryKeys.route(id),
    enabled: enabled && !!id,
    queryFn: ({ signal }) => getOrderRoute(id, { signal }),
  });
}
