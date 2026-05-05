import { apiFetchPath } from "@/config/http/api-client";
import { ordersEndpoints } from "./lib/endpoints";
import type {
  CalculateTransportOrderRoutePayload,
  CalculateTransportOrderRouteResult,
  CreateTransportOrderPayload,
  CreateTransportOrderResult,
  OrderDetailsDto,
  OrderDocumentDto,
  OrdersPageDto,
  RouteGeocodeResult,
  SaveTransportOrderRoutePayload,
  SaveTransportOrderRouteResult,
  TransportOrderRouteDto,
  UpdateTransportOrderPayload,
  UpdateTransportOrderResult,
} from "./types";

type ListDispatcherOrdersParams = {
  status?: string;
  page?: number;
  limit?: number;
  signal?: AbortSignal;
  headers?: HeadersInit;
};

function withQuery(
  path: string,
  query: Record<string, string | number | undefined>
) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined) continue;
    sp.set(k, String(v));
  }
  const qs = sp.toString();
  return qs ? `${path}?${qs}` : path;
}

export function listDispatcherOrders(params: ListDispatcherOrdersParams = {}) {
  const path = withQuery(ordersEndpoints.list, {
    status: params.status,
    page: params.page,
    limit: params.limit,
  });

  return apiFetchPath<OrdersPageDto>(path, {
    method: "GET",
    signal: params.signal,
    withCredentials: true,
    headers: params.headers,
  });
}

export function deleteOrder(
  id: string,
  options: { signal?: AbortSignal } = {}
) {
  return apiFetchPath<{ success: boolean }>(ordersEndpoints.deleteById(id), {
    method: "DELETE",
    signal: options.signal,
    withCredentials: true,
  });
}

export function createOrder(
  payload: CreateTransportOrderPayload,
  options: { signal?: AbortSignal } = {}
) {
  return apiFetchPath<CreateTransportOrderResult>(ordersEndpoints.create, {
    method: "POST",
    body: JSON.stringify(payload),
    signal: options.signal,
    withCredentials: true,
  });
}

export function getOrderById(
  id: string,
  options: { signal?: AbortSignal; headers?: HeadersInit } = {}
) {
  return apiFetchPath<OrderDetailsDto>(ordersEndpoints.getById(id), {
    method: "GET",
    signal: options.signal,
    withCredentials: true,
    headers: options.headers,
  });
}

export function uploadOrderDocument(
  orderId: string,
  file: File,
  title: string,
  options: { signal?: AbortSignal } = {}
) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", title);

  return apiFetchPath<OrderDocumentDto>(
    ordersEndpoints.uploadDocument(orderId),
    {
      method: "POST",
      body: formData,
      signal: options.signal,
      withCredentials: true,
      headers: {}, // Let browser set Content-Type with boundary for FormData
    }
  );
}

export function deleteOrderDocument(
  orderDocumentId: string,
  options: { signal?: AbortSignal } = {}
) {
  return apiFetchPath<{ success: boolean }>(
    ordersEndpoints.deleteDocument(orderDocumentId),
    {
      method: "DELETE",
      signal: options.signal,
      withCredentials: true,
    }
  );
}

export function updateOrder(
  orderId: string,
  payload: UpdateTransportOrderPayload,
  options: { signal?: AbortSignal } = {}
) {
  return apiFetchPath<UpdateTransportOrderResult>(
    ordersEndpoints.updateById(orderId),
    {
      method: "PATCH",
      body: JSON.stringify(payload),
      signal: options.signal,
      withCredentials: true,
    }
  );
}

export function getOrderRoute(
  orderId: string,
  options: { signal?: AbortSignal } = {}
) {
  return apiFetchPath<TransportOrderRouteDto>(ordersEndpoints.routeById(orderId), {
    method: "GET",
    signal: options.signal,
    withCredentials: true,
  });
}

export function geocodeRoutePoint(
  query: string,
  options: { signal?: AbortSignal } = {}
) {
  const path = withQuery(ordersEndpoints.routeGeocode, { q: query });

  return apiFetchPath<{ items: RouteGeocodeResult[] }>(path, {
    method: "GET",
    signal: options.signal,
    withCredentials: true,
  });
}

export function calculateOrderRoute(
  orderId: string,
  payload: CalculateTransportOrderRoutePayload,
  options: { signal?: AbortSignal } = {}
) {
  return apiFetchPath<CalculateTransportOrderRouteResult>(
    ordersEndpoints.routeCalculateById(orderId),
    {
      method: "POST",
      body: JSON.stringify(payload),
      signal: options.signal,
      withCredentials: true,
    }
  );
}

export function saveOrderRoute(
  orderId: string,
  payload: SaveTransportOrderRoutePayload,
  options: { signal?: AbortSignal } = {}
) {
  return apiFetchPath<SaveTransportOrderRouteResult>(
    ordersEndpoints.routeById(orderId),
    {
      method: "PATCH",
      body: JSON.stringify(payload),
      signal: options.signal,
      withCredentials: true,
    }
  );
}
