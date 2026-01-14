"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DeleteAccountDialog } from "./delete-account-dialog";

type Props = {
  onConfirmDelete: () => Promise<void> | void;
  className?: string;
};

export function DeleteAccountBtn({ onConfirmDelete, className }: Props) {
  const t = useTranslations("AccountPage.actions");
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className={cn(className)}
        onClick={() => setOpen(true)}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        {t("deleteAccount")}
      </Button>

      <DeleteAccountDialog
        open={open}
        onOpenChange={setOpen}
        onConfirmDelete={onConfirmDelete}
      />
    </>
  );
}
