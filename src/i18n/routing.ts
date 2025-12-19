import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export type Locale = (typeof routing.locales)[number];
export type Pathnames = keyof typeof routing.pathnames;

export const routing = defineRouting({
  locales: ["en", "pl"],
  defaultLocale: "pl",
  pathnames: {
    "/": "/",
    "/blog": {
      en: "/blog",
      pl: "/blog",
    },
    "/about": {
      en: "/about",
      pl: "/o-nas",
    },
    "/career": {
      en: "/career",
      pl: "/kariera",
    },
    "/contact": {
      en: "/contact",
      pl: "/kontakt",
    },
    "/posts": {
      en: "/posts",
      pl: "/posty",
    },
    "/terms": {
      en: "/terms",
      pl: "/regulamin",
    },
    "/privacy-policy": {
      en: "/privacy-policy",
      pl: "/polityka-prywatnosci",
    },
  },
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
