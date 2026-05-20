import type { LucideIcon } from "lucide-react";
import { FileText } from "lucide-react";
import type { routing } from "@/i18n/routing";
import { Role } from "@/features/auth/lib/roles";

type RoutePath = keyof (typeof routing)["pathnames"];

export type NavMatch = "exact" | "prefix";

export type DashboardNavItem = {
  key: string;
  href: RoutePath;
  icon: LucideIcon;
  match?: NavMatch;
  roles?: readonly Role[];
};

export const dashboardNav = {
  main: [
    // {
    //   key: "dashboard",
    //   href: "/dashboard",
    //   icon: LayoutDashboard,
    //   match: "exact",
    //   roles: ["DISPATCHER", "DRIVER"],
    // },
    {
      key: "orders",
      href: "/dashboard/orders",
      icon: FileText,
      match: "prefix",
      roles: ["DISPATCHER"],
    },
  ],
} as const satisfies {
  main: readonly DashboardNavItem[];
};

export function isNavItemActive(pathname: string, item: DashboardNavItem) {
  const match = item.match ?? "prefix";
  if (match === "exact") return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
