import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, FileText } from "lucide-react";
import type { routing } from "@/i18n/routing";

type RoutePath = keyof (typeof routing)["pathnames"];

export type DashboardNavItem = {
  key: string;
  href: RoutePath;
  icon: LucideIcon;
};

export const dashboardNav = {
  main: [
    {
      key: "dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      key: "orders",
      href: "/dashboard/orders",
      icon: FileText,
    },
  ],
} as const satisfies {
  main: readonly DashboardNavItem[];
};
