import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clearAllNotifications } from "../services";
import { notificationQueryKeys } from "../lib/query-keys";
import type { NotificationsPageResult } from "../types";

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
        queryKey: notificationQueryKeys.all,
      });

      const previous = queryClient.getQueriesData<NotificationsPageResult>({
        queryKey: notificationQueryKeys.all,
      });

      queryClient.setQueriesData<NotificationsPageResult>(
        { queryKey: notificationQueryKeys.all },
        (old) => {
          if (!old) return old;
          if (old.totalItems === 0 && old.items.length === 0) return old;

          return {
            ...old,
            items: [],
            totalItems: 0,
            totalPages: 1,
            hasNext: false,
          };
        }
      );

      return { previous };
    },

    onError: (_err, _vars, ctx) => {
      if (!ctx?.previous?.length) return;
      for (const [queryKey, data] of ctx.previous) {
        queryClient.setQueryData(queryKey, data);
      }
    },

    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.all,
      });
    },
  });
}
