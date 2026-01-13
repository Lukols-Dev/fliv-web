"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "@/i18n/navigation";
import { authClient } from "@/features/auth/lib/auth";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

type Props = {
  user: { id: string; email: string; name: string; role?: string };
};

function initials(email: string) {
  return email.slice(0, 2).toUpperCase();
}

export function UserNav({ user }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const onSignOut = async () => {
    const { error } = await authClient.signOut();
    startTransition(() => {
      router.replace("/sign-in");
      router.refresh();
    });
    if (error) {
      // TODO: Toast error
      // console.error(error);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-9 px-2 cursor-pointer hover:bg-transparent hover:text-inherit focus-visible:ring-0 focus-visible:border-0 active:ring-0 active:border-0"
          disabled={isPending}
        >
          <Avatar className="h-10 w-10">
            <AvatarFallback>{initials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start">
            <p className="hidden text-sm font-bold md:inline">{user.name}</p>
            <p className="text-muted-foreground text-xs leading-none">
              {user.role ?? "Test role"}
            </p>
          </div>
          <Icons.chevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="space-y-1">
          <p className="text-sm font-medium leading-none">{user.email}</p>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => router.push("/dashboard/account")}>
          Ustawienia
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={onSignOut} className="text-destructive">
          Wyloguj
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
