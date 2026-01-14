import { useQuery } from "@tanstack/react-query";
import { notificationsQueryOptions } from "../queries/notifications.query";

export function useNotificationsQuery() {
  return useQuery(notificationsQueryOptions());
}
