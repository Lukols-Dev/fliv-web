export const ordersQueryKeys = {
  all: ["orders"] as const,
  list: (params: { status?: string; page: number; limit: number }) =>
    [...ordersQueryKeys.all, "dispatcher-list", params] as const,
  detail: (id: string) => [...ordersQueryKeys.all, "detail", id] as const,
  route: (id: string) => [...ordersQueryKeys.all, "route", id] as const,
  partnerPois: (params: {
    bbox: { north: number; south: number; east: number; west: number };
    isActive?: boolean;
  }) => [...ordersQueryKeys.all, "partner-pois", params] as const,
};
