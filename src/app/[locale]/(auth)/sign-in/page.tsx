import { SignInForm } from "@/features/auth/components/sign-in/sign-in-form";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function SignInPage() {
  const t = useTranslations("SignInPage");

  return (
    <>
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground text-sm">{t("description")}</p>
      </div>

      <SignInForm />

      <p className="text-muted-foreground text-center text-sm">
        {t("footerText")}{" "}
        <Link
          href="/sign-up"
          className="hover:text-primary underline underline-offset-4"
        >
          {t("footerCta")}
        </Link>
      </p>
    </>
  );
}
