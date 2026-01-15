import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteOrder } from "../services";
import { ordersQueryKeys } from "../lib/query-keys";
import type { OrdersPageResult } from "../types";

export function useDeleteOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteOrder(id);
      if (!res.success) throw new Error("Delete order failed");
      return res;
    },

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ordersQueryKeys.all });

      const previous = queryClient.getQueriesData<OrdersPageResult>({
        queryKey: ordersQueryKeys.all,
      });

      for (const [key, data] of previous) {
        if (!data || !data.items) continue;
        queryClient.setQueryData<OrdersPageResult>(key, {
          ...data,
          items: data.items.filter((x) => x.id !== id),
        });
      }

      return { previous };
    },

    onError: (_err, _id, ctx) => {
      if (!ctx?.previous) return;
      for (const [key, data] of ctx.previous) {
        queryClient.setQueryData(key, data);
      }
    },

    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ordersQueryKeys.all });
    },
  });
}
