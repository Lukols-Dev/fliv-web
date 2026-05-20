"use client";

import { useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { AccountUser } from "../types";
import {
  createUpdateAccountSchema,
  type UpdateAccountValues,
} from "./validation-schema";

type Props = {
  user: AccountUser;
  isEditing: boolean;
  onCancelEditing: () => void;
  onSave: (values: UpdateAccountValues) => Promise<void> | void;
};

//TODO:add more in app for all forms
function getDefaults(user: AccountUser): UpdateAccountValues {
  return {
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    phone: user.phone ?? "",
  };
}

export function AccountProfileForm({
  user,
  isEditing,
  onCancelEditing,
  onSave,
}: Props) {
  const t = useTranslations("AccountForm");

  const schema = useMemo(
    () =>
      createUpdateAccountSchema({
        required: t("validation.required"),
      }),
    [t]
  );

  const form = useForm<UpdateAccountValues>({
    mode: "onSubmit",
    resolver: zodResolver(schema),
    defaultValues: getDefaults(user),
  });

  const { register, handleSubmit, formState, reset } = form;
  const { errors, isSubmitting } = formState;

  useEffect(() => {
    if (!isEditing) {
      reset(getDefaults(user));
    }
  }, [isEditing, reset, user]);

  const submit = async (values: UpdateAccountValues) => {
    await onSave(values);
    onCancelEditing();
  };

  return (
    <form
      className="space-y-4 max-w-md"
      noValidate
      onSubmit={handleSubmit(submit)}
    >
      <div className="grid gap-2">
        <Label htmlFor="firstName">{t("fields.firstName")}</Label>
        <Input
          id="firstName"
          disabled={!isEditing}
          placeholder={t("placeholders.firstName")}
          aria-invalid={!!errors.firstName}
          {...register("firstName")}
        />
        {errors.firstName?.message && (
          <p className="text-destructive text-xs">{errors.firstName.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="lastName">{t("fields.lastName")}</Label>
        <Input
          id="lastName"
          disabled={!isEditing}
          placeholder={t("placeholders.lastName")}
          aria-invalid={!!errors.lastName}
          {...register("lastName")}
        />
        {errors.lastName?.message && (
          <p className="text-destructive text-xs">{errors.lastName.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">{t("fields.email")}</Label>
        <div className="relative">
          <Input
            id="email"
            type="email"
            value={user.email ?? ""}
            disabled
            className="cursor-not-allowed pr-9"
          />
          <Lock className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="password">{t("fields.password")}</Label>
        <div className="relative">
          <Input
            id="password"
            type="password"
            value="********"
            disabled
            className="cursor-not-allowed pr-9"
          />
          <Lock className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="phone">{t("fields.phone")}</Label>
        <Input
          id="phone"
          disabled={!isEditing}
          placeholder={t("placeholders.phone")}
          aria-invalid={!!errors.phone}
          {...register("phone")}
        />
        {errors.phone?.message && (
          <p className="text-destructive text-xs">{errors.phone.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full bg-[#F2542F] hover:bg-[#F2542F]/90"
        disabled={!isEditing || isSubmitting}
      >
        {isSubmitting ? t("buttons.saving") : t("buttons.save")}
      </Button>
    </form>
  );
}
