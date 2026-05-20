"use client";

import type { AccountUser } from "../types";
import { Card } from "@/components/ui/card";
import { AccountProfileForm } from "./account-form";
import { UpdateAccountValues } from "./validation-schema";
import { initials } from "@/lib/utils";
import { useRoleTranslations } from "@/lib/roles";
import { useCallback, useEffect, useState } from "react";
import { useUploadAvatarMutation } from "../hooks/use-upload-avatar-mutation";
import { AccountAvatarUploader } from "./account-avatar-uploader";

type Props = {
  user: AccountUser;
  isEditing: boolean;
  onCancelEditing: () => void;
  onSave: (values: UpdateAccountValues) => Promise<void> | void;
};

export function AccountProfileCard({
  user,
  isEditing,
  onCancelEditing,
  onSave,
}: Props) {
  const { translateRoles } = useRoleTranslations();
  const fullName = user.firstName + " " + user.lastName;
  const translatedRoles = translateRoles(user.roles);

  const uploadAvatarMut = useUploadAvatarMutation();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    user.avatarUrl ?? null
  );

  useEffect(() => {
    setAvatarUrl(user.avatarUrl ?? null);
  }, [user.avatarUrl]);

  const handleUploadAvatar = useCallback(
    async (file: File) => {
      const res = await uploadAvatarMut.mutateAsync({ file });
      setAvatarUrl(res.avatarUrl);
      return res.avatarUrl;
    },
    [uploadAvatarMut]
  );

  return (
    <Card className="rounded-2xl border bg-white p-0">
      <div className="p-6">
        <div className="flex items-center gap-4">
          <AccountAvatarUploader
            fullName={fullName}
            initials={initials(fullName)}
            avatarUrl={avatarUrl}
            disabled={!isEditing}
            onUpload={handleUploadAvatar}
          />

          <div className="min-w-0">
            <p className="truncate text-xl font-semibold">{fullName}</p>
            {user.roles && user.roles.length > 0 ? (
              <p className="text-sm text-muted-foreground">{translatedRoles}</p>
            ) : null}
          </div>
        </div>

        <div className="pt-6">
          <AccountProfileForm
            user={user}
            isEditing={isEditing}
            onCancelEditing={onCancelEditing}
            onSave={onSave}
          />
        </div>
      </div>
    </Card>
  );
}
