import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOrder } from "../services";
import { ordersQueryKeys } from "../lib/query-keys";
import type {
  CreateTransportOrderPayload,
  CreateTransportOrderResult,
} from "../types";

export function useCreateOrderMutation() {
  const qc = useQueryClient();

  return useMutation<
    CreateTransportOrderResult,
    Error,
    CreateTransportOrderPayload
  >({
    mutationFn: async (payload) => {
      const res = await createOrder(payload);
      if (!res?.id) throw new Error("Create order failed");
      return res;
    },

    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ordersQueryKeys.all });
    },
  });
}
