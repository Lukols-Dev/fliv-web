"use client";

import * as React from "react";
import { useLocale } from "next-intl";
import type {
  Notification,
  NotificationItem,
  NotificationListItem,
} from "../types";
import { formatDatePL, formatTimeHM, formatTimeHMS } from "@/lib/format";

export function useNotificationPopoverItems(
  notifications: Notification[] | undefined
) {
  const locale = useLocale();

  return React.useMemo<NotificationItem[]>(() => {
    if (!notifications?.length) return [];

    return notifications.map((n) => {
      const d = new Date(n.createdAt);
      return {
        id: n.id,
        type: n.type,
        data: n.data ?? {},
        dateLabel: `${formatDatePL(d, locale)} - ${formatTimeHM(d, locale)}`,
        isUnread: !n.readAt,
      };
    });
  }, [notifications, locale]);
}

export function useNotificationListItems(
  notifications: Notification[] | undefined
) {
  const locale = useLocale();

  return React.useMemo<NotificationListItem[]>(() => {
    if (!notifications?.length) return [];

    return notifications.map((n) => {
      const d = new Date(n.createdAt);
      return {
        id: n.id,
        type: n.type,
        data: n.data ?? {},
        time: formatTimeHMS(d, locale),
        date: formatDatePL(d, locale),
        isUnread: !n.readAt,
      };
    });
  }, [notifications, locale]);
}
