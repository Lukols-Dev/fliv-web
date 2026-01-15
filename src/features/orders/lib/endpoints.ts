import { apiPaths, joinPath } from "@/config/http/paths";

export const ordersEndpoints = {
  list: joinPath(apiPaths.v1, "/dispatcher/transport-orders"),
  deleteById: (id: string) =>
    joinPath(apiPaths.v1, `/dispatcher/transport-orders/${id}`),
} as const;
