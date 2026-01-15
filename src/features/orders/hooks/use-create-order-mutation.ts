import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOrder, uploadOrderDocument } from "../services";
import { ordersQueryKeys } from "../lib/query-keys";
import type {
  CreateTransportOrderPayload,
  CreateTransportOrderResult,
  OrderDocumentDto,
} from "../types";

export type OrderDocumentDraft = {
  title: string;
  file: File;
  clientId?: string;
};

export type CreateOrderInput = {
  payload: CreateTransportOrderPayload;
  documents?: OrderDocumentDraft[];
};

export type CreateOrderOutput = {
  order: CreateTransportOrderResult;
  uploaded: OrderDocumentDto[];
  failed: Array<{ document: OrderDocumentDraft; error: unknown }>;
};

export function useCreateOrderMutation() {
  const qc = useQueryClient();

  return useMutation<CreateOrderOutput, Error, CreateOrderInput>({
    mutationFn: async ({ payload, documents }) => {
      const order = await createOrder(payload);
      if (!order?.id) throw new Error("Create order failed");

      const docs = documents ?? [];
      if (docs.length === 0) {
        return { order, uploaded: [], failed: [] };
      }

      const uploaded: OrderDocumentDto[] = [];
      const failed: Array<{ document: OrderDocumentDraft; error: unknown }> =
        [];

      for (const doc of docs) {
        try {
          const res = await uploadOrderDocument(order.id, doc.file, doc.title);
          uploaded.push(res);
        } catch (err) {
          failed.push({ document: doc, error: err });
        }
      }

      return { order, uploaded, failed };
    },

    onSuccess: async (result) => {
      await qc.invalidateQueries({ queryKey: ordersQueryKeys.all });
      await qc.invalidateQueries({
        queryKey: ordersQueryKeys.detail(result.order.id),
      });
    },
  });
}
