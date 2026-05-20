import { useQuery } from "@tanstack/react-query";
import { currentUserQueryOptions } from "../queries/current-user.query";

export function useCurrentUserQuery() {
  return useQuery(currentUserQueryOptions());
}
