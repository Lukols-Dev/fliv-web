import { apiPaths, joinPath } from "@/config/http/paths";

export const notificationEndpoints = {
  list: joinPath(apiPaths.v1, "/notifications"),
} as const;
