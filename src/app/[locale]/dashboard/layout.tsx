import type { ReactNode } from "react";
import { requireUserOrRedirect } from "@/features/auth/lib/session";
import DashboardShell from "./_components/dashboard-shell";
import DashboardProviders from "./providers";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const session = await requireUserOrRedirect("/dashboard");
  console.log(session.user);
  return (
    <DashboardProviders>
      <DashboardShell user={session.user}>{children}</DashboardShell>
    </DashboardProviders>
  );
}
