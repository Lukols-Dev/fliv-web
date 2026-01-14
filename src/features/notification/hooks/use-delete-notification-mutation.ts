import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteNotification } from "../services";
import { notificationQueryKeys } from "../lib/query-keys";
import type { Notification } from "../types";

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
        queryKey: notificationQueryKeys.list(),
      });

      const previous = queryClient.getQueryData<Notification[]>(
        notificationQueryKeys.list()
      );

      if (previous) {
        queryClient.setQueryData<Notification[]>(
          notificationQueryKeys.list(),
          previous.filter((n) => n.id !== id)
        );
      }

      return { previous };
    },

    onError: (_err, _id, ctx) => {
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
