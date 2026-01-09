import { LanguageToggle } from "@/components/custom/language-toggle";
import { Locale, useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";

export default function LandingPage({ params }: LayoutProps<"/[locale]">) {
  const { locale } = use(params);

  // Enable static rendering
  setRequestLocale(locale as Locale);

  const t = useTranslations("LandingPage");
  return (
    <div>
      <LanguageToggle />
      <h1>{t("title")}</h1>
      <div>
        <p>{t("description")}</p>
      </div>
    </div>
  );
}
