"use client";

import { Inbox } from "lucide-react";
import { useTranslations } from "next-intl";

export function OrdersEmpty() {
  const t = useTranslations("OrdersPage.empty");

  return (
    <div className="px-6 py-10">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl border bg-muted/30">
          <Inbox className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-lg font-semibold">{t("title")}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("description")}
        </p>
      </div>
    </div>
  );
}
