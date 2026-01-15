import { useQuery } from "@tanstack/react-query";
import { dispatcherOrdersQueryOptions } from "../queries/dispatcher-orders.query";

export function useDispatcherOrdersQuery(params: {
  page: number;
  limit: number;
  status?: string;
}) {
  return useQuery(dispatcherOrdersQueryOptions(params));
}
