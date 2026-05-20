import { SignUpForm } from "@/features/auth/components/sign-up/sign-up-form";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function SignUpPage() {
  const t = useTranslations("SignUpPage");

  return (
    <>
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground text-sm">{t("description")}</p>
      </div>

      <SignUpForm />

      <p className="text-muted-foreground text-center text-sm">
        {t("footerText")}{" "}
        <Link
          href="/sign-in"
          className="hover:text-primary underline underline-offset-4"
        >
          {t("footerCta")}
        </Link>
      </p>
    </>
  );
}
