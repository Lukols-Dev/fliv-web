import { apiPaths, joinPath } from "@/config/http/paths";

export const notificationEndpoints = {
  list: joinPath(apiPaths.v1, "/notifications"),
  deleteById: (id: string) => joinPath(apiPaths.v1, `/notifications/${id}`),
  clearAll: joinPath(apiPaths.v1, "/notifications"),
} as const;
