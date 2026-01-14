"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createSignInSchema,
  type SignInValues,
} from "@/features/auth/components/sign-in/validation-schema";

import { useTranslations } from "next-intl";
import { authClient } from "../../lib/auth";

export const SignInForm = () => {
  const t = useTranslations("SignInForm");
  const sp = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);

  const safeRedirect = (
    val: string | null | undefined,
    fallback = "/dashboard"
  ) => (val && val.startsWith("/") ? val : fallback);

  const redirectTo = safeRedirect(sp?.get("redirect"));
  const emailInvalid = t("validation.emailInvalid");
  const passwordRequired = t("validation.passwordRequired");

  const schema = useMemo(
    () => createSignInSchema({ emailInvalid, passwordRequired }),
    [emailInvalid, passwordRequired]
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SignInValues>({
    mode: "onSubmit",
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (formValues: SignInValues) => {
    const { email, password } = formValues;
    const payload = { email, password, callbackURL: redirectTo };

    setFormError(null);

    try {
      const { error } = await authClient.signIn.email(payload);

      if (error) {
        if (error.code === "ACCOUNT_NOT_ACTIVE") {
          setFormError(t("errors.accountNotActive"));
          return;
        }
        setFormError(error.message || t("errors.generic"));
        return;
      }

      reset();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t("errors.generic"));
    }
  };

  return (
    <form className="space-y-4" noValidate onSubmit={handleSubmit(onSubmit)}>
      {formError && (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-2">
        <Label htmlFor="email">{t("fields.emailLabel")}</Label>
        <Input
          id="email"
          placeholder={t("fields.emailPlaceholder")}
          type="email"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        {errors.email?.message && (
          <p className="text-destructive text-xs">{errors.email.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="password">{t("fields.passwordLabel")}</Label>
        <Input
          id="password"
          type="password"
          placeholder={t("fields.passwordPlaceholder")}
          aria-invalid={!!errors.password}
          {...register("password")}
        />

        {errors.password?.message && (
          <p className="text-destructive text-xs">{errors.password.message}</p>
        )}
      </div>

      <Button
        className="w-full"
        type="submit"
        variant="default"
        disabled={isSubmitting}
      >
        {isSubmitting ? t("buttons.submitting") : t("buttons.submit")}
      </Button>
    </form>
  );
};
