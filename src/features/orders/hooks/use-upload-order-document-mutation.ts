import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadOrderDocument } from "../services";
import { ordersQueryKeys } from "../lib/query-keys";

type UploadOrderDocumentInput = {
  orderId: string;
  file: File;
  title: string;
};

export function useUploadOrderDocumentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UploadOrderDocumentInput) => {
      return uploadOrderDocument(input.orderId, input.file, input.title);
    },
    onSuccess: (_, variables) => {
      // Invalidate order details query to refetch documents
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.detail(variables.orderId),
      });
      // Also invalidate list query in case documents count is shown
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.all,
      });
    },
  });
}
