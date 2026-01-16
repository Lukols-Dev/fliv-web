import { apiPaths, joinPath } from "@/config/http/paths";

export const accountEndpoints = {
  me: joinPath(apiPaths.v1, "/users/me"),
  profile: joinPath(apiPaths.v1, "/users/profile"),
  deleteMe: joinPath(apiPaths.v1, "/users/me"),
  avatar: joinPath(apiPaths.v1, "/users/avatar"),
} as const;
