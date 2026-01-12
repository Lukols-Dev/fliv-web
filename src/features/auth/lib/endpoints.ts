import { apiPaths, joinPath } from "@/config/http/paths";

export const authEndpoints = {
  session: joinPath(apiPaths.auth, "/get-session"),
} as const;
