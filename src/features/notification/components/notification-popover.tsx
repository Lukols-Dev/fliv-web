"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Icons } from "@/components/icons";
import { Info, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import type { NotificationItem, NotificationListItem } from "../types";
import { NotificationEmpty } from "./notification-empty";
import { useNotificationsQuery } from "../hooks/use-notifications-query";

function mapListItemToPopoverItem(
  item: NotificationListItem
): NotificationItem {
  return {
    id: item.id,
    title: item.title,
    dateLabel: `${item.date} - ${item.time}`,
    isUnread: item.isUnread,
  };
}

export function NotificationPopover() {
  const t = useTranslations("Notifications.popover");
  const [open, setOpen] = React.useState(false);

  const { data } = useNotificationsQuery({ page: 1, limit: 5 });
  const items = React.useMemo<NotificationItem[]>(() => {
    if (!data?.items?.length) return [];
    return data.items.map(mapListItemToPopoverItem);
  }, [data?.items]);

  const unreadCount = React.useMemo(
    () => items.filter((x) => x.isUnread).length,
    [items]
  );

  const hasItems = items.length > 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative cursor-pointer"
        >
          <Icons.notification className="h-4 w-4" />

          {unreadCount > 0 && (
            <span className="pointer-events-none absolute -right-1 -top-1 flex size-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#F2542F] opacity-75" />
              <span className="relative inline-flex size-3 rounded-full bg-[#F2542F]" />
            </span>
          )}

          <span className="sr-only">{t("openNotifications")}</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={5}
        className={cn(
          "w-[420px] p-0",
          "rounded-lg border bg-background shadow-lg"
        )}
      >
        {/* Header */}
        <div className="px-6 pt-5">
          <h3 className="text-lg font-semibold tracking-tight">{t("title")}</h3>
        </div>

        <div className="px-6 pt-4">
          <Separator />
        </div>

        {/* Body */}
        {hasItems ? (
          <div className="max-h-[520px] overflow-y-auto px-6 py-4">
            {items.map((n) => (
              <NotificationRow key={n.id} item={n} />
            ))}
          </div>
        ) : (
          <NotificationEmpty />
        )}

        {/* Footer */}
        <div className="px-6 pb-5">
          <Link
            href="/dashboard/notifications"
            onClick={() => setOpen(false)}
            className={cn(
              "inline-flex w-full items-center justify-between",
              "text-[#F2542F] hover:text-[#F2542F]/80"
            )}
          >
            <span className="text-sm font-normal">{t("showAll")}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function NotificationRow({ item }: { item: NotificationItem }) {
  return (
    <div className="flex items-start gap-4 hover:bg-accent/50 rounded-lg p-2 cursor-pointer">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background">
        <Info className="h-5 w-5 text-[#6E8B6F]" />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-normal leading-snug text-foreground">
          {item.title}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{item.dateLabel}</p>
      </div>
    </div>
  );
}
