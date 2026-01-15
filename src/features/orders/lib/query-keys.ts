export const ordersQueryKeys = {
  all: ["orders"] as const,
  list: (params: { status?: string; page: number; limit: number }) =>
    [...ordersQueryKeys.all, "dispatcher-list", params] as const,
};
