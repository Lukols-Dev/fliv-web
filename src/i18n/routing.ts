import { defineRouting } from "next-intl/routing";

export type Locale = (typeof routing.locales)[number];

export const routing = defineRouting({
  locales: ["en", "pl"],
  defaultLocale: "en",
  localePrefix: "as-needed",
  pathnames: {
    "/": "/",
    "/sign-in": {
      en: "/sign-in",
      pl: "/logowanie",
    },
    "/sign-up": {
      en: "/sign-up",
      pl: "/rejestracja",
    },
    "/dashboard": {
      en: "/dashboard",
      pl: "/panel",
    },
    "/dashboard/orders": {
      en: "/dashboard/orders",
      pl: "/panel/zlecenia",
    },
    "/dashboard/account": {
      en: "/dashboard/account",
      pl: "/panel/konto",
    },
  },
});
