import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createPartnerPoi,
  deletePartnerPoi,
  updatePartnerPoi,
} from "../services";
import { ordersQueryKeys } from "../lib/query-keys";
import type {
  CreatePartnerPoiPayload,
  UpdatePartnerPoiPayload,
} from "../types";

export function useCreatePartnerPoiMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePartnerPoiPayload) => createPartnerPoi(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ordersQueryKeys.all });
    },
  });
}

export function useUpdatePartnerPoiMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdatePartnerPoiPayload;
    }) => updatePartnerPoi(id, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ordersQueryKeys.all });
    },
  });
}

export function useDeletePartnerPoiMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePartnerPoi(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ordersQueryKeys.all });
    },
  });
}
