import { useQuery } from "@tanstack/react-query";
import { listPartnerPois } from "../services";
import { ordersQueryKeys } from "../lib/query-keys";
import type { PartnerPoiBbox } from "../types";

export function usePartnerPoisQuery({
  bbox,
  enabled = true,
  isActive,
}: {
  bbox: PartnerPoiBbox | null;
  enabled?: boolean;
  isActive?: boolean;
}) {
  return useQuery({
    queryKey: ordersQueryKeys.partnerPois({
      bbox: bbox ?? { north: 0, south: 0, east: 0, west: 0 },
      isActive,
    }),
    enabled: enabled && !!bbox,
    queryFn: ({ signal }) =>
      listPartnerPois({
        bbox: bbox as PartnerPoiBbox,
        isActive,
        signal,
      }),
  });
}
