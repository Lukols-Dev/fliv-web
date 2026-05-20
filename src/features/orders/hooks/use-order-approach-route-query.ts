"use client";

import { useQuery } from "@tanstack/react-query";
import { orderApproachRouteQueryOptions } from "../queries/order-approach-route.query";

export function useOrderApproachRouteQuery(params: {
  id: string;
  enabled?: boolean;
}) {
  return useQuery({
    ...orderApproachRouteQueryOptions({ id: params.id }),
    enabled: params.enabled !== false && !!params.id,
  });
}
