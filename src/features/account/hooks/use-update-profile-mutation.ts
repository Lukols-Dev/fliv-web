import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateCurrentUserProfile,
  type UpdateProfilePayload,
} from "../services";
import { accountQueryKeys } from "../lib/query-keys";
import type { AccountUser } from "../types";

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      const res = await updateCurrentUserProfile(payload);
      if (!res.success) throw new Error("Update profile failed");
      return res;
    },

    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: accountQueryKeys.me() });

      const previous = queryClient.getQueryData<AccountUser>(
        accountQueryKeys.me()
      );

      if (previous) {
        queryClient.setQueryData<AccountUser>(accountQueryKeys.me(), {
          ...previous,
          firstName: payload.firstName ?? previous.firstName,
          lastName: payload.lastName ?? previous.lastName,
          phone: payload.phone ?? previous.phone,
        });
      }

      return { previous };
    },

    onError: (_err, _payload, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(accountQueryKeys.me(), ctx.previous);
      }
    },

    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: accountQueryKeys.me() });
    },
  });
}
