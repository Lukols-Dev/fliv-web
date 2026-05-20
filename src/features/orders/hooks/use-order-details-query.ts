import { useQuery } from "@tanstack/react-query";
import { orderDetailsQueryOptions } from "../queries/order-details.query";
import type { OrderStatus } from "../types";

const ACTIVE_STATUSES: OrderStatus[] = [
  "IN_PROGRESS",
  "LOADING",
  "UNLOADING",
  "PAUSED",
];

export function useOrderDetailsQuery(params: {
  id: string;
  enabled?: boolean;
  status?: OrderStatus;
}) {
  const isActive = params.status ? ACTIVE_STATUSES.includes(params.status) : false;

  return useQuery({
    ...orderDetailsQueryOptions({ id: params.id }),
    enabled: params.enabled !== false && !!params.id,
    refetchInterval: isActive ? 20_000 : false,
    staleTime: isActive ? 0 : 30_000,
  });
}
