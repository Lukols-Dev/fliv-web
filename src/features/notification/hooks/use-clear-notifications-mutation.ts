import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clearAllNotifications } from "../services";
import { notificationQueryKeys } from "../lib/query-keys";
import type { Notification } from "../types";

export function useClearNotificationsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await clearAllNotifications();
      if (!res.success) throw new Error("Clear notifications failed");
      return res;
    },

    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: notificationQueryKeys.list(),
      });

      const previous = queryClient.getQueryData<Notification[]>(
        notificationQueryKeys.list()
      );

      queryClient.setQueryData<Notification[]>(
        notificationQueryKeys.list(),
        []
      );

      return { previous };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(notificationQueryKeys.list(), ctx.previous);
      }
    },

    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.list(),
      });
    },
  });
}
