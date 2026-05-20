"use client";

import { useQuery } from "@tanstack/react-query";
import { orderLocationQueryOptions } from "../queries/order-location.query";

export function useOrderLocationQuery(params: {
  id: string;
  enabled?: boolean;
}) {
  return useQuery({
    ...orderLocationQueryOptions({ id: params.id }),
    enabled: params.enabled !== false && !!params.id,
  });
}
