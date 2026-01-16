import type { ReactNode } from "react";
import { requireRoleOrRedirect } from "@/features/auth/lib/session";

export default async function DispatcherLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireRoleOrRedirect(["DISPATCHER"], "/dashboard", "/dashboard");
  return children;
}
