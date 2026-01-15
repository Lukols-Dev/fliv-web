import { apiPaths, joinPath } from "@/config/http/paths";

export const ordersEndpoints = {
  create: joinPath(apiPaths.v1, "/dispatcher/transport-orders"),
  list: joinPath(apiPaths.v1, "/dispatcher/transport-orders"),
  getById: (id: string) =>
    joinPath(apiPaths.v1, `/dispatcher/transport-orders/${id}`),
  deleteById: (id: string) =>
    joinPath(apiPaths.v1, `/dispatcher/transport-orders/${id}`),
  deleteDocument: (orderDocumentId: string) =>
    joinPath(
      apiPaths.v1,
      `/dispatcher/transport-orders/documents/${orderDocumentId}`
    ),
} as const;
