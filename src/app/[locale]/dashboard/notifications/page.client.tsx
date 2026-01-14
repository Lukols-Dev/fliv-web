"use client";

import { NotificationsList } from "@/features/notification/components/notifications-list";
import { NotificationsToolbar } from "@/features/notification/components/notifications-toolbar";
import { useTranslations } from "next-intl";
import { useNotificationsQuery } from "@/features/notification/hooks/use-notifications-query";
import { useNotificationListItems } from "@/features/notification/hooks/use-notification-items";

export default function NotificationsPageClient() {
  const t = useTranslations("Notifications");

  const { data, isPending, isError, error, refetch } = useNotificationsQuery();
  const items = useNotificationListItems(data);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-2">
        <div className="max-w-4xl flex flex-col gap-4 py-6 md:gap-6 md:py-8">
          <div className="px-4 lg:px-6">
            <NotificationsToolbar
              title={t("title")}
              clearAllLabel={t("clearAll")}
            />
          </div>

          <div className="px-4 lg:px-6">
            {isPending ? (
              <div className="text-sm text-muted-foreground">
                {t("loading")}
              </div>
            ) : isError ? (
              <div className="rounded-xl border bg-background p-4 space-y-3">
                <p className="text-sm text-destructive">
                  {t("loadError")}
                  {error ? `: ${(error as Error).message}` : ""}
                </p>
                <button className="text-sm underline" onClick={() => refetch()}>
                  {t("retry")}
                </button>
              </div>
            ) : (
              <NotificationsList items={items} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
