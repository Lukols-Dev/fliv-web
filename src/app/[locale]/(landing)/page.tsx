import { Locale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";

export default function LandingPage({ params }: LayoutProps<"/[locale]">) {
  const { locale } = use(params);

  // Enable static rendering
  setRequestLocale(locale as Locale);

  return (
    <div>

    </div>
  );
}
