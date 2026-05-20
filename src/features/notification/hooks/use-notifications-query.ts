import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { notificationsQueryOptions } from "../queries/notifications.query";

type Params = {
  page: number;
  limit: number;
  headers?: HeadersInit;
};

export function useNotificationsQuery(params: Params) {
  const locale = useLocale();
  return useQuery(
    notificationsQueryOptions({
      ...params,
      locale,
    })
  );
}
