import { Locale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";

type LandingPageProps = {
  params: Promise<{ locale: Locale }>;
};

export default function LandingPage({ params }: LandingPageProps) {
  const { locale } = use(params);

  // Enable static rendering
  setRequestLocale(locale);

  return (
    <div>

    </div>
  );
}
