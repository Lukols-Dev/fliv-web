import { queryOptions } from "@tanstack/react-query";
import { accountQueryKeys } from "../lib/query-keys";
import { getCurrentUser } from "../services";
import { mapCurrentUserToAccountUser } from "../mappers/map-current-user";
import { ApiError } from "@/config/http/api-client";

type Params = {
  headers?: HeadersInit;
};

export function currentUserQueryOptions(params: Params = {}) {
  return queryOptions({
    queryKey: accountQueryKeys.me(),
    queryFn: async ({ signal }) => {
      const dto = await getCurrentUser({ signal, headers: params.headers });
      return mapCurrentUserToAccountUser(dto);
    },

    staleTime: 60_000,
    gcTime: 5 * 60_000,

    retry: (count, error) => {
      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403)
      ) {
        return false;
      }
      return count < 2;
    },
  });
}
