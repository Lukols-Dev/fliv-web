"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";

import { routing, type Locale } from "@/i18n/routing";
import { usePathname, useRouter } from "@/i18n/navigation";

import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Languages, Check } from "lucide-react";
import clsx from "clsx";

export function LanguageToggle() {
  const t = useTranslations("LocaleSwitcher");
  const locale = useLocale() as Locale;

  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();

  const switchLanguage = (nextLocale: Locale) => {
    if (nextLocale === locale) return;
    startTransition(() => {
      router.replace(
        // @ts-expect-error next-intl route typing
        { pathname, params },
        { locale: nextLocale }
      );
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={isPending}>
        <button
          type="button"
          className={clsx(
            buttonVariants({ size: "icon", variant: "ghost" }),
            isPending && "opacity-60"
          )}
          aria-label={t("label")}
        >
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{t("label")}</span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {routing.locales.map((cur) => (
          <DropdownMenuItem
            key={cur}
            onClick={() => switchLanguage(cur)}
            disabled={isPending || cur === locale}
            className="flex items-center justify-between gap-3"
          >
            <span>{t(`locale.${cur}` as const)}</span>
            {cur === locale ? <Check className="h-4 w-4" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
