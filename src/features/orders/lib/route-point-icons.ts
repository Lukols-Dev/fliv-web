import type { TransportOrderRoutePointType } from "../types";

export const ROUTE_POINT_ICON_PATHS: Record<
  TransportOrderRoutePointType,
  string
> = {
  LOADING: "/map-icons/route-points/loading.svg",
  UNLOADING: "/map-icons/route-points/unloading.svg",
  FUEL: "/map-icons/route-points/fuel.svg",
  PARKING: "/map-icons/route-points/parking.svg",
  SERVICE: "/map-icons/route-points/service.svg",
  OTHER: "/map-icons/route-points/other.svg",
};
