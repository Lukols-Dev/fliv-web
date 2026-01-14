"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { AccountUser } from "@/features/account/types";
import { AccountHeader } from "@/features/account/components/account-header";
import { AccountProfileCard } from "@/features/account/components/account-card";
import { DeleteAccountBtn } from "@/features/account/components/delete-account-btn";

export default function AccountPageClient() {
  const t = useTranslations("AccountPage");

  // TODO: docelowo: user z session/server
  const user = useMemo<AccountUser>(
    () => ({
      id: "u_1",
      name: "Jan Kowalski",
      role: t("role.dispatcher"),
      email: "jan.kowalski@gmail.com",
      firstName: "Jan",
      lastName: "Kowalski",
      phone: "",
    }),
    [t]
  );

  const [isEditing, setIsEditing] = useState(false);

  const handleToggleEdit = useCallback(() => {
    setIsEditing((v) => !v);
  }, []);

  const handleSave = useCallback(async (values: unknown) => {
    // TODO: call API
    console.log("save profile", values);
  }, []);

  const handleDelete = useCallback(async () => {
    // TODO: call API (better-auth / endpoint)
    console.log("delete account confirmed");
  }, []);

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
            >
              <Pencil className="mr-2 h-4 w-4" />
              {t("actions.editProfile")}
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
