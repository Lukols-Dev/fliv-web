"use client";

import type { AccountUser } from "../types";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AccountProfileForm } from "./account-form";

type Props = {
  user: AccountUser;
  isEditing: boolean;
  onCancelEditing: () => void;
  onSave: (values: unknown) => Promise<void> | void;
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("");
}

export function AccountProfileCard({
  user,
  isEditing,
  onCancelEditing,
  onSave,
}: Props) {
  return (
    <Card className="rounded-2xl border bg-white p-0">
      <div className="p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            {user.avatarUrl ? (
              <AvatarImage
                src={user.avatarUrl}
                alt={user.firstName + " " + user.lastName}
              />
            ) : null}
            <AvatarFallback className="text-base">
              {initials(user.firstName + " " + user.lastName)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <p className="truncate text-xl font-semibold">
              {user.firstName + " " + user.lastName}
            </p>
            {user.role ? (
              <p className="text-sm text-muted-foreground">{user.role}</p>
            ) : null}
          </div>
        </div>

        <div className="pt-6">
          <AccountProfileForm
            user={user}
            isEditing={isEditing}
            onCancelEditing={onCancelEditing}
            onSave={onSave}
          />
        </div>
      </div>
    </Card>
  );
}
