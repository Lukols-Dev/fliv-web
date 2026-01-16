"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AccountHeader } from "@/features/account/components/account-header";
import { AccountProfileCard } from "@/features/account/components/account-card";
import { DeleteAccountBtn } from "@/features/account/components/delete-account-btn";

import { authClient } from "@/features/auth/lib/auth";
import { useCurrentUserQuery } from "@/features/account/hooks/use-current-user-query";
import { useUpdateProfileMutation } from "@/features/account/hooks/use-update-profile-mutation";
import type { UpdateAccountValues } from "@/features/account/components/validation-schema";

export default function AccountPageClient() {
  const t = useTranslations("AccountPage");

  const {
    data: user,
    isPending,
    isError,
    error,
    refetch,
  } = useCurrentUserQuery();
  const updateProfile = useUpdateProfileMutation();

  const [isEditing, setIsEditing] = useState(false);

  const handleToggleEdit = useCallback(() => {
    setIsEditing((v) => !v);
  }, []);

  const handleSave = useCallback(
    async (values: UpdateAccountValues) => {
      await updateProfile.mutateAsync({
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
      });

      setIsEditing(false);
    },
    [updateProfile]
  );

  const handleDelete = useCallback(async () => {
    const res = await authClient.deleteUser();
    if (res?.error) {
      throw new Error(res.error.message ?? "Delete failed");
    }
  }, []);

  if (isPending && !user) {
    return (
      <div className="rounded-2xl border bg-white p-6">Ładowanie profilu…</div>
    );
  }

  if (isError || !user) {
    return (
      <div className="rounded-2xl border bg-white p-6 space-y-3">
        <p className="text-sm text-destructive">
          Nie udało się pobrać profilu
          {error ? `: ${(error as Error).message}` : "."}
        </p>
        <Button variant="outline" onClick={() => refetch()}>
          Spróbuj ponownie
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AccountHeader
        title={t("title")}
        actions={
          <>
            <Button
              type="button"
              onClick={handleToggleEdit}
              className="bg-[#F2542F] hover:bg-[#F2542F]/90 cursor-pointer"
              disabled={updateProfile.isPending}
            >
              <Pencil className="mr-2 h-4 w-4" />
              {isEditing
                ? t("actions.closeEditProfile")
                : t("actions.editProfile")}
            </Button>

            <DeleteAccountBtn
              onConfirmDelete={handleDelete}
              className="border-[#F2542F] text-[#F2542F] hover:bg-[#F2542F]/10 cursor-pointer"
            />
          </>
        }
      />

      <AccountProfileCard
        user={user}
        isEditing={isEditing}
        onCancelEditing={() => setIsEditing(false)}
        onSave={handleSave}
      />
    </div>
  );
}
