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

type Props = {
  item: NotificationListItem;
};

export function NotificationRow({ item }: Props) {
  const t = useTranslations("Notifications.row");

  const onDelete = () => {
    // TODO: call API + optimistic update
    console.log("delete notification", item.id);
  };

  return (
    <Card
      className={cn(
        "flex items-center justify-between gap-4 rounded-xl border bg-background px-5 py-4 shadow-none",
        item.isUnread && "ring-1 ring-[#F2542F]/15"
      )}
    >
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex size-9 items-center justify-center rounded-full border-2 border-[#6E8B6F]">
          <Info className="h-4 w-4 text-[#6E8B6F]" />
        </div>

        <p className="truncate text-sm font-medium text-foreground">
          {item.title}
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
