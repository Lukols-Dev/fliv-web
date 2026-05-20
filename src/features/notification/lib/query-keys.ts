export const notificationQueryKeys = {
  all: ["notifications"] as const,
  list: (params: { page: number; limit: number; locale: string }) =>
    [...notificationQueryKeys.all, "list", params] as const,
} as const;
