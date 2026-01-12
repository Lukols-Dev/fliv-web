"use client";

import { useTransition } from "react";
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

type Props = {
  user: { id: string; email: string; role?: string };
};

function initials(email: string) {
  return email.slice(0, 2).toUpperCase();
}

export function UserNav({ user }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-9 px-2" disabled={isPending}>
          <Avatar className="h-7 w-7">
            <AvatarFallback>{initials(user.email)}</AvatarFallback>
          </Avatar>
          <span className="ml-2 hidden text-sm md:inline">{user.email}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="space-y-1">
          <p className="text-sm font-medium leading-none">{user.email}</p>
          <p className="text-muted-foreground text-xs leading-none">
            {user.role ?? "User"}
          </p>
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
