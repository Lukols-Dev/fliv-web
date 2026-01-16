import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadCurrentUserAvatar, type UploadAvatarResult } from "../services";
import { accountQueryKeys } from "../lib/query-keys";

type UploadAvatarInput = {
  file: File;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

export function useUploadAvatarMutation() {
  const qc = useQueryClient();

  return useMutation<UploadAvatarResult, Error, UploadAvatarInput>({
    mutationFn: ({ file }) => uploadCurrentUserAvatar(file),

    onSuccess: async (data) => {
      qc.setQueryData(accountQueryKeys.me(), (old: unknown) => {
        if (!isRecord(old)) return old;
        return { ...old, avatarUrl: data.avatarUrl };
      });

      await qc.invalidateQueries({ queryKey: accountQueryKeys.me() });
    },
  });
}
