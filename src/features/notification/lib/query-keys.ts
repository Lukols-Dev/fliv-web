export const notificationQueryKeys = {
  all: ["notifications"] as const,
  list: (params?: { page?: number; limit?: number }) =>
    [...notificationQueryKeys.all, "list", params] as const,
} as const;
