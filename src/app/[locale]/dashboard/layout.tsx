import type { ReactNode } from "react";
import { requireUserOrRedirect } from "@/features/auth/lib/session";
import DashboardShell from "./_components/dashboard-shell";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const session = await requireUserOrRedirect("/dashboard");

  return <DashboardShell user={session.user}>{children}</DashboardShell>;
}
