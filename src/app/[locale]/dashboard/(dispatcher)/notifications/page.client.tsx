"use client";

import { PaginationNav } from "@/components/custom/pagination-nav";
import { NotificationsList } from "@/features/notification/components/notifications-list";
import { NotificationsToolbar } from "@/features/notification/components/notifications-toolbar";
import { useTranslations } from "next-intl";
import { useNotificationsQuery } from "@/features/notification/hooks/use-notifications-query";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { buildHrefFromSearchParams } from "@/lib/build-href";

function parsePositiveInt(v: string | null, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export default function NotificationsPageClient() {
  const t = useTranslations("Notifications");
  const sp = useSearchParams();
  const pathname = usePathname();

  const page = parsePositiveInt(sp.get("page"), 1);
  const limit = parsePositiveInt(sp.get("limit"), 10);

  const { data, isPending, isError, error, refetch } = useNotificationsQuery({
    page,
    limit,
  });

  const getHref = useCallback(
    (p: number) => buildHrefFromSearchParams(pathname, sp, { page: p }),
    [pathname, sp]
  );

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 0;


  if (isPending && !data) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col gap-2">
          <div className="max-w-4xl flex flex-col gap-4 py-6 md:gap-6 md:py-8">
            <div className="px-4 lg:px-6">
              <div className="text-sm text-muted-foreground">
                {t("loading")}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col gap-2">
          <div className="max-w-4xl flex flex-col gap-4 py-6 md:gap-6 md:py-8">
            <div className="px-4 lg:px-6">
              <div className="rounded-xl border bg-background p-4 space-y-3">
                <p className="text-sm text-destructive">
                  {t("loadError")}
                  {error ? `: ${(error as Error).message}` : ""}
                </p>
                <button className="text-sm underline" onClick={() => refetch()}>
                  {t("retry")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-2">
        <div className="max-w-4xl flex flex-col gap-4 py-6 md:gap-6 md:py-8">
          <div className="px-4 lg:px-6">
            <NotificationsToolbar
              title={t("title")}
              clearAllLabel={t("clearAll")}
              hasItems={items.length > 0}
            />
          </div>

          <div className="px-4 lg:px-6">
            {items.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                {t("empty.title")}
              </div>
            ) : (
              <>
                <NotificationsList items={items} />
                {(totalPages > 1) && (
                  <PaginationNav
                    page={page}
                    totalPages={totalPages}
                    getHref={getHref}
                  />)}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
