import { apiPaths, joinPath } from "@/config/http/paths";

export const ordersEndpoints = {
  create: joinPath(apiPaths.v1, "/dispatcher/transport-orders"),
  list: joinPath(apiPaths.v1, "/dispatcher/transport-orders"),
  getById: (id: string) =>
    joinPath(apiPaths.v1, `/dispatcher/transport-orders/${id}`),
  deleteById: (id: string) =>
    joinPath(apiPaths.v1, `/dispatcher/transport-orders/${id}`),
  updateById: (id: string) =>
    joinPath(apiPaths.v1, `/dispatcher/transport-orders/${id}`),
  routeById: (id: string) =>
    joinPath(apiPaths.v1, `/dispatcher/transport-orders/${id}/route`),
  locationById: (id: string) =>
    joinPath(apiPaths.v1, `/dispatcher/transport-orders/${id}/location`),
  approachRouteById: (id: string) =>
    joinPath(
      apiPaths.v1,
      `/dispatcher/transport-orders/${id}/approach-route`
    ),
  routeCalculateById: (id: string) =>
    joinPath(apiPaths.v1, `/dispatcher/transport-orders/${id}/route/calculate`),
  routeGeocode: joinPath(
    apiPaths.v1,
    "/dispatcher/transport-orders/route/geocode"
  ),
  uploadDocument: (orderId: string) =>
    joinPath(apiPaths.v1, `/dispatcher/transport-orders/${orderId}/documents`),
  deleteDocument: (orderDocumentId: string) =>
    joinPath(
      apiPaths.v1,
      `/dispatcher/transport-orders/documents/${orderDocumentId}`
    ),
  partnerPois: joinPath(apiPaths.v1, "/dispatcher/partner-pois"),
  partnerPoiById: (id: string) =>
    joinPath(apiPaths.v1, `/dispatcher/partner-pois/${id}`),
} as const;
