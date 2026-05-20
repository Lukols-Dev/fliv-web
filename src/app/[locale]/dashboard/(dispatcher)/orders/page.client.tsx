"use client";

import { PaginationNav } from "@/components/custom/pagination-nav";
import OrdersView from "@/features/orders/components/orders-view";
import { OrdersEmpty } from "@/features/orders/components/orders-empty";
import { useDispatcherOrdersQuery } from "@/features/orders/hooks/use-dispatcher-orders-query";
import { buildHrefFromSearchParams } from "@/lib/build-href";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { useTranslations } from "next-intl";

function parsePositiveInt(v: string | null, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export default function OrdersPageClient() {
  const t = useTranslations("OrdersPage");
  const sp = useSearchParams();
  const pathname = usePathname();

  const page = parsePositiveInt(sp.get("page"), 1);
  const limit = parsePositiveInt(sp.get("limit"), 8);
  const status = sp.get("status") ?? undefined;

  const { data, isPending, isError, error } = useDispatcherOrdersQuery({
    page,
    limit,
    status,
  });

  const getHref = useCallback(
    (p: number) => buildHrefFromSearchParams(pathname, sp, { page: p }),
    [pathname, sp]
  );

  if (isPending && !data) {
    return <div className="mt-8 text-sm text-muted-foreground">{t("loading")}</div>;
  }

  if (isError) {
    return (
      <div className="mt-8 rounded-xl border bg-background p-4 space-y-3">
        <p className="text-sm text-destructive">
          {t("error")}
          {error ? `: ${(error as Error).message}` : ""}
        </p>
      </div>
    );
  }

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 0;

  if (items.length === 0) {
    return <OrdersEmpty />;
  }

  return (
    <>
      <OrdersView
        items={items}
      />
      {(totalPages > 1) && (
        <PaginationNav
          page={page}
          totalPages={totalPages}
          getHref={getHref}
        />)}
    </>
  );
}
