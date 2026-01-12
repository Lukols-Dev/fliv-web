"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
import { dashboardNav, DashboardNavItem } from "../config/nav";

export function AppSidebar() {
  const pathname = usePathname();
  const t = useTranslations("DashboardNav");

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Sidebar variant="sidebar" collapsible="none" className="h-screen border-r">
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
              {dashboardNav.main.map((item: DashboardNavItem) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive(item.href)}>
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
