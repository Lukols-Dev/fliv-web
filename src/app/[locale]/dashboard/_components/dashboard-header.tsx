"use client";

import { cn } from "@/lib/utils";
import { UserNav } from "./user-nav";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { NotificationPopover } from "@/features/notification/components/notification-popover";

type Props = {
  user: { id: string; email: string; name: string; role?: string };
};

export function SiteHeader({ user }: Props) {
  return (
    <header
      className={cn(
        "bg-background sticky top-0 z-30 flex h-[58px] shrink-0 items-center gap-2 border-b px-4 py-3"
      )}
    >
      <div className="ml-auto flex items-center gap-2">
        <NotificationPopover />
        <UserNav user={user} />
      </div>
    </header>
  );
}
