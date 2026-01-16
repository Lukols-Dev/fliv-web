"use client";

import { cn } from "@/lib/utils";
import { UserNav } from "./user-nav";
import { NotificationPopover } from "@/features/notification/components/notification-popover";
import { hasAnyRole } from "@/features/auth/lib/roles";

type Props = {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles?: string[];
    avatarUrl?: string | null;
  };
};

export function SiteHeader({ user }: Props) {
  const hasRole = hasAnyRole(user.roles, ["DISPATCHER"]);
  return (
    <header
      className={cn(
        "bg-background sticky top-0 z-30 flex h-[58px] shrink-0 items-center gap-2 border-b px-4 py-3"
      )}
    >
      <div className="ml-auto flex items-center gap-2">
        {hasRole && <NotificationPopover />}
        <UserNav user={user} />
      </div>
    </header>
  );
}
