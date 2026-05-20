import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateOrder } from "../services";
import { ordersQueryKeys } from "../lib/query-keys";
import type {
  UpdateTransportOrderPayload,
  UpdateTransportOrderResult,
} from "../types";

type UpdateOrderInput = {
  orderId: string;
  payload: UpdateTransportOrderPayload;
};

export function useUpdateOrderMutation() {
  const qc = useQueryClient();

  return useMutation<UpdateTransportOrderResult, Error, UpdateOrderInput>({
    mutationFn: async ({ orderId, payload }) => {
      const res = await updateOrder(orderId, payload);
      if (!res?.id) throw new Error("Update order failed");
      return res;
    },
    onSuccess: async (res) => {
      await qc.invalidateQueries({ queryKey: ordersQueryKeys.all });
      await qc.invalidateQueries({ queryKey: ordersQueryKeys.detail(res.id) });
    },
  });
}
