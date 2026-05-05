import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  calculateOrderRoute,
  geocodeRoutePoint,
  saveOrderRoute,
} from "../services";
import { ordersQueryKeys } from "../lib/query-keys";
import type {
  CalculateTransportOrderRoutePayload,
  SaveTransportOrderRoutePayload,
} from "../types";

export function useRouteGeocodeMutation() {
  return useMutation({
    mutationFn: async (query: string) => {
      const response = await geocodeRoutePoint(query);
      return response.items;
    },
  });
}

export function useCalculateRouteMutation(orderId: string) {
  return useMutation({
    mutationFn: (payload: CalculateTransportOrderRoutePayload) =>
      calculateOrderRoute(orderId, payload),
  });
}

export function useSaveRouteMutation(orderId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: SaveTransportOrderRoutePayload) =>
      saveOrderRoute(orderId, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ordersQueryKeys.route(orderId) });
      await qc.invalidateQueries({ queryKey: ordersQueryKeys.detail(orderId) });
      await qc.invalidateQueries({ queryKey: ordersQueryKeys.all });
    },
  });
}
