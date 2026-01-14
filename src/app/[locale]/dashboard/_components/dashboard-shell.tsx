"use client";

import type React from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./dashboard-sidebar";
import { SiteHeader } from "./dashboard-header";

type UserPayload = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles?: string[];
};

type Props = {
  children: React.ReactNode;
  user: UserPayload;
};

export default function DashboardShell({ children, user }: Props) {
  return (
    <SidebarProvider className="min-h-svh w-full">
      <AppSidebar />

      <SidebarInset className="flex h-svh flex-col overflow-hidden">
        <SiteHeader user={user} />

        <main className="flex flex-1 flex-col overflow-y-auto bg-[#EBE5D4]/18">
          <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
