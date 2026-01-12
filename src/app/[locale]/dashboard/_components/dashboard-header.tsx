"use client";

import { cn } from "@/lib/utils";
import { UserNav } from "./user-nav";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";

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
        <Button
          variant="outline"
          size="icon"
          className="cursor-pointer relative"
        >
          <Icons.notification className="h-4 w-4" />
          <span className="absolute -right-1 -top-1 flex size-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#F2542F] opacity-75"></span>
            <span className="relative inline-flex size-3 rounded-full bg-[#F2542F]"></span>
          </span>
        </Button>
        <UserNav user={user} />
      </div>
    </header>
  );
}
