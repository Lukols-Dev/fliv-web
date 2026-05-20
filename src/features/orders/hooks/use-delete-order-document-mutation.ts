import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteOrderDocument } from "../services";
import { ordersQueryKeys } from "../lib/query-keys";

export function useDeleteOrderDocumentMutation(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderDocumentId: string) => {
      const res = await deleteOrderDocument(orderDocumentId);
      if (!res.success) throw new Error("Delete document failed");
      return res;
    },

    onSuccess: () => {
      // Invalidate order details query to refetch with updated documents
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.detail(orderId),
      });
    },
  });
}
