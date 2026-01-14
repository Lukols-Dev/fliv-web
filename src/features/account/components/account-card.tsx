"use client";

import type { AccountUser } from "../types";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AccountProfileForm } from "./account-form";
import { UpdateAccountValues } from "./validation-schema";
import { initials } from "@/lib/utils";
import { useRoleTranslations } from "@/lib/roles";

type Props = {
  user: AccountUser;
  isEditing: boolean;
  onCancelEditing: () => void;
  onSave: (values: UpdateAccountValues) => Promise<void> | void;
};

export function AccountProfileCard({
  user,
  isEditing,
  onCancelEditing,
  onSave,
}: Props) {
  const { translateRoles } = useRoleTranslations();
  const fullName = user.firstName + " " + user.lastName;
  const translatedRoles = translateRoles(user.roles);

  return (
    <Card className="rounded-2xl border bg-white p-0">
      <div className="p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            {user.avatarUrl ? (
              <AvatarImage src={user.avatarUrl} alt={fullName} />
            ) : null}
            <AvatarFallback className="text-base">
              {initials(fullName)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <p className="truncate text-xl font-semibold">{fullName}</p>
            {user.roles && user.roles.length > 0 ? (
              <p className="text-sm text-muted-foreground">{translatedRoles}</p>
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
