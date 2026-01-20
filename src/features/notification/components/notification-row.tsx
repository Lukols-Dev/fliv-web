"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Trash2, Info } from "lucide-react";
import { useTranslations } from "next-intl";
import type { NotificationListItem } from "../types";
import { useDeleteNotificationMutation } from "../hooks/use-delete-notification-mutation";

type Props = {
  item: NotificationListItem;
};

export function NotificationRow({ item }: Props) {
  const t = useTranslations("Notifications.row");
  const tMsg = useTranslations("Notifications.messages");
  const del = useDeleteNotificationMutation();

  const onDelete = async () => {
    await del.mutateAsync(item.id);
  };


  return (
    <Card
      className={cn(
        "flex flex-row items-center justify-between gap-4 rounded-xl border bg-background px-5 py-4 shadow-none"
      )}
    >
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background">
          <Info className="h-5 w-5 text-[#6E8B6F]" />
        </div>
        <p className="truncate text-sm font-medium text-foreground">
          {tMsg(item.type, { zTNumber: item.data.zTNumber as string })}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right text-xs leading-tight text-muted-foreground">
          <div className="font-medium text-foreground/90">{item.time}</div>
          <div>{item.date}</div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">{t("openMenu")}</span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={onDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              {t("delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}
