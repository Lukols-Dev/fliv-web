"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

import {
  deleteAccountSchema,
  type DeleteAccountValues,
} from "./validation-schema";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => Promise<void> | void;
};

const CONFIRM_TOKEN = "DELETE";

export function DeleteAccountDialog({
  open,
  onOpenChange,
  onConfirmDelete,
}: Props) {
  const t = useTranslations("DeleteAccountDialog");

  const schema = useMemo(
    () =>
      deleteAccountSchema({
        required: t("validation.required"),
        mustMatch: t("validation.mustMatch", { token: CONFIRM_TOKEN }),
        token: CONFIRM_TOKEN,
      }),
    [t]
  );

  const form = useForm<DeleteAccountValues>({
    mode: "onChange",
    resolver: zodResolver(schema),
    defaultValues: { confirmation: "" },
  });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  const value = watch("confirmation");
  const canDelete = value.trim() === CONFIRM_TOKEN && !isSubmitting;

  const submit = async () => {
    await onConfirmDelete();
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <DialogContent
        className="sm:max-w-[680px] rounded-lg p-0 overflow-hidden"
        showCloseButton={false}
      >
        <DialogClose asChild>
          <button
            type="button"
            className={cn(
              "absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-md",
              "border bg-background/90 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
            aria-label={t("actions.close")}
          >
            <X className="h-5 w-5 text-[#4E7D5C]" />
          </button>
        </DialogClose>

        <div className="p-8">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold tracking-tight">
              {t("title")}
            </DialogTitle>
            <div className="h-px w-full bg-border" />
          </DialogHeader>

          <div className="mt-6 space-y-6 text-base leading-relaxed">
            <p className="text-foreground">{t("description")}</p>

            <p className="text-foreground">
              {t("confirmText")}{" "}
              <span className="font-semibold">{CONFIRM_TOKEN}</span>
            </p>

            <form
              noValidate
              onSubmit={handleSubmit(submit)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Input
                  placeholder={t("inputPlaceholder")}
                  aria-invalid={!!errors.confirmation}
                  {...register("confirmation")}
                  className=" "
                />
                {errors.confirmation?.message && (
                  <p className="text-destructive text-xs">
                    {errors.confirmation.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className={cn("w-full", "bg-[#F2542F] hover:bg-[#F2542F]/90")}
                disabled={!canDelete}
              >
                {isSubmitting ? t("actions.deleting") : t("actions.delete")}
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
