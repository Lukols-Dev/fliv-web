"use client";

import { useState, useTransition } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter, usePathname } from "@/i18n/navigation";
import { authClient } from "@/features/auth/lib/auth";
import { Icons } from "@/components/icons";
import { cn, initials } from "@/lib/utils";
import { Languages, Check } from "lucide-react";
import { routing, type Locale } from "@/i18n/routing";
import { useRoleTranslations } from "@/lib/roles";

type Props = {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles?: string[];
  };
};

export function UserNav({ user }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const t = useTranslations("LocaleSwitcher");
  const tUserNav = useTranslations("UserNav");
  const { translateRoles } = useRoleTranslations();
  const locale = useLocale() as Locale;
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const onSignOut = async () => {
    const { error } = await authClient.signOut();
    startTransition(() => {
      router.replace("/sign-in");
      router.refresh();
    });
    if (error) {
      // TODO: Toast error
      // console.error(error);
    }
  };

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
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-9 px-2 cursor-pointer hover:bg-transparent hover:text-inherit focus-visible:ring-0 focus-visible:border-0 active:ring-0 active:border-0"
          disabled={isPending}
        >
          <Avatar className="h-10 w-10">
            <AvatarFallback>
              {initials(user.firstName + " " + user.lastName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start">
            <p className="hidden text-sm font-bold md:inline">
              {user.firstName + " " + user.lastName}
            </p>
            <p className="text-muted-foreground text-xs leading-none">
              {translateRoles(user.roles)}
            </p>
          </div>
          <Icons.chevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="space-y-1">
          <p className="text-sm font-medium leading-none">{user.email}</p>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => router.push("/dashboard/account")}
          className="cursor-pointer"
        >
          <Icons.settings className="text-balck" /> {tUserNav("settings")}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer">
            <Languages className="h-4 w-4" />
            <span>{t("label")}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {routing.locales.map((cur) => (
              <DropdownMenuItem
                key={cur}
                onClick={() => switchLanguage(cur)}
                disabled={isPending || cur === locale}
                className="flex items-center justify-between gap-3 cursor-pointer"
              >
                <span>{t(`locale.${cur}` as const)}</span>
                {cur === locale ? <Check className="h-4 w-4" /> : null}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={onSignOut}
          className="text-destructive focus:text-destructive cursor-pointer"
        >
          <Icons.logOut className="text-destructive" /> {tUserNav("signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
