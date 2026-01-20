import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteNotification } from "../services";
import { notificationQueryKeys } from "../lib/query-keys";
import type { NotificationsPageResult } from "../types";

export function useDeleteNotificationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteNotification(id);
      if (!res.success) throw new Error("Delete notification failed");
      return res;
    },

    onMutate: async (id) => {
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
          const hadItem = old.items.some((n) => n.id === id);
          if (!hadItem) return old;

          return {
            ...old,
            items: old.items.filter((n) => n.id !== id),
            totalItems: Math.max(0, old.totalItems - 1),
          };
        }
      );

      return { previous };
    },

    onError: (_err, _id, ctx) => {
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
