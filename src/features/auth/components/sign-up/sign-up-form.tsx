"use client";

import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createSignUpSchema,
  type SignUpValues,
} from "@/features/auth/components/sign-up/validation-schema";

import { useTranslations } from "next-intl";
import { authClient } from "../../lib/auth";

export const SignUpForm = () => {
  const router = useRouter();
  const t = useTranslations("SignUpForm");
  const [formError, setFormError] = useState<string | null>(null);

  const emailInvalid = t("validation.emailInvalid");
  const passwordRequired = t("validation.passwordRequired");
  const firstNameRequired = t("validation.firstNameRequired");
  const lastNameRequired = t("validation.lastNameRequired");
  const acceptTermsRequired = t("validation.acceptTermsRequired");

  const schema = useMemo(
    () =>
      createSignUpSchema({
        emailInvalid,
        passwordRequired,
        firstNameRequired,
        lastNameRequired,
        acceptTermsRequired,
      }),
    [
      emailInvalid,
      passwordRequired,
      firstNameRequired,
      lastNameRequired,
      acceptTermsRequired,
    ]
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
  } = useForm<SignUpValues>({
    mode: "onSubmit",
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      acceptTerms: false,
    },
  });

  const onSubmit = async (formValues: SignUpValues) => {
    const { email, password, firstName, lastName, acceptTerms } = formValues;

    setFormError(null);

    try {
      const { error } = await authClient.signUp.email({
        email,
        password,
        name: `${firstName} ${lastName}`,
        firstName,
        lastName,
        isAgreedToTerms: acceptTerms,
        isAgreedToPrivacyPolicy: acceptTerms,
      });

      if (error) {
        setFormError(error.message || t("errors.generic"));
        return;
      }
      router.replace("/");
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
        <Label htmlFor="firstName">{t("fields.firstNameLabel")}</Label>
        <Input
          id="firstName"
          placeholder={t("fields.firstNamePlaceholder")}
          type="text"
          aria-invalid={!!errors.firstName}
          {...register("firstName")}
        />
        {errors.firstName?.message && (
          <p className="text-destructive text-xs">{errors.firstName.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="lastName">{t("fields.lastNameLabel")}</Label>
        <Input
          id="lastName"
          placeholder={t("fields.lastNamePlaceholder")}
          type="text"
          aria-invalid={!!errors.lastName}
          {...register("lastName")}
        />
        {errors.lastName?.message && (
          <p className="text-destructive text-xs">{errors.lastName.message}</p>
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

      <div className="flex items-start gap-2">
        <Controller
          name="acceptTerms"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="acceptTerms"
              checked={field.value}
              onCheckedChange={field.onChange}
              aria-invalid={!!errors.acceptTerms}
            />
          )}
        />
        <div className="grid gap-1.5 leading-none">
          <Label
            htmlFor="acceptTerms"
            className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t("fields.acceptTermsLabel")}
          </Label>
          {errors.acceptTerms?.message && (
            <p className="text-destructive text-xs">
              {errors.acceptTerms.message}
            </p>
          )}
        </div>
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
