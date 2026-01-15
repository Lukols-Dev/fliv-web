import { apiFetchPath } from "@/config/http/api-client";
import { ordersEndpoints } from "./lib/endpoints";
import type { DispatcherOrderDto } from "./types";

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

  return apiFetchPath<DispatcherOrderDto[]>(path, {
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
