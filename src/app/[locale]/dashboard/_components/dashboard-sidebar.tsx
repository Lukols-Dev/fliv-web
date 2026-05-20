"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { usePathname, Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Icons } from "@/components/icons";
import {
  dashboardNav,
  DashboardNavItem,
  isNavItemActive,
} from "../_config/nav";
import { cn } from "@/lib/utils";
import { hasAnyRole, Role } from "@/features/auth/lib/roles";
import { useMemo } from "react";

type Props = {
  userRoles?: readonly string[];
};

export function AppSidebar({ userRoles }: Props) {
  const pathname = usePathname();
  const t = useTranslations("DashboardNav");

  const items = useMemo(() => {
    return dashboardNav.main.filter((item) => {
      if (!item.roles) return true;
      return hasAnyRole(userRoles, item.roles as readonly Role[]);
    });
  }, [userRoles]);

  return (
    <Sidebar
      variant="sidebar"
      collapsible="none"
      className="h-screen border-r bg-white"
    >
      <SidebarHeader className="gap-2 px-3 py-3 mx-auto">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Icons.logo size={130} />
          {/* TODO: Add safety margin look to figma */}
        </Link>
      </SidebarHeader>

      <Separator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("groups.main")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item: DashboardNavItem) => {
                const Icon = item.icon;
                const active = isNavItemActive(pathname, item);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      className={cn(
                        "transition-colors",
                        "data-[active=true]:bg-[#F2542F] data-[active=true]:text-white",
                        "data-[active=true]:hover:bg-[#F2542F]",
                        "data-[active=true]:[&>a>svg]:text-white"
                      )}
                    >
                      <Link
                        href={item.href}
                        className="flex items-center gap-2"
                      >
                        <Icon className="h-4 w-4" />
                        <span className="truncate">
                          {t(`items.${item.key}`)}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
