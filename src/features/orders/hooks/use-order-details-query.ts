import { useQuery } from "@tanstack/react-query";
import { orderDetailsQueryOptions } from "../queries/order-details.query";

export function useOrderDetailsQuery(params: {
  id: string;
  enabled?: boolean;
}) {
  return useQuery({
    ...orderDetailsQueryOptions({ id: params.id }),
    enabled: params.enabled !== false && !!params.id,
  });
}
