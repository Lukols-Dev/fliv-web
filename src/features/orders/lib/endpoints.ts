import { apiPaths, joinPath } from "@/config/http/paths";

export const ordersEndpoints = {
  create: joinPath(apiPaths.v1, "/dispatcher/transport-orders"),
  list: joinPath(apiPaths.v1, "/dispatcher/transport-orders"),
  getById: (id: string) =>
    joinPath(apiPaths.v1, `/dispatcher/transport-orders/${id}`),
  deleteById: (id: string) =>
    joinPath(apiPaths.v1, `/dispatcher/transport-orders/${id}`),
} as const;
