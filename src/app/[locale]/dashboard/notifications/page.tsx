import { NotificationsList } from "@/features/notification/components/notifications-list";
import { NotificationsToolbar } from "@/features/notification/components/notifications-toolbar";
import { useTranslations } from "next-intl";

export default function NotificationsPage() {
  const t = useTranslations("Notifications");

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-6 md:gap-6 md:py-8">
          <div className="px-4 lg:px-6">
            <NotificationsToolbar
              title={t("title")}
              clearAllLabel={t("clearAll")}
            />
          </div>

          <div className="px-4 lg:px-6">
            <NotificationsList items={[]} />
          </div>
        </div>
      </div>
    </div>
  );
}
