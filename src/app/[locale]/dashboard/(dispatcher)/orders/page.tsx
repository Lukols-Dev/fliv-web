import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import OrdersPageHeader from "@/features/orders/components/orders-page-header";
import OrdersPageClient from "./page.client";

import { dispatcherOrdersQueryOptions } from "@/features/orders/queries/dispatcher-orders.query";
import { getQueryClient } from "@/providers/react-query/get-query-client";

function parsePositiveInt(v: string | undefined, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string; limit?: string }>;
}) {
  const t = await getTranslations("OrdersPage");

  const params = await searchParams;
  const page = parsePositiveInt(params.page, 1);
  const limit = parsePositiveInt(params.limit, 12);
  const status = params.status;

  const cookieStore = await cookies();
  const headers = { Cookie: cookieStore.toString() };

  const qc = getQueryClient();
  await qc.prefetchQuery(
    dispatcherOrdersQueryOptions({ page, limit, status, headers })
  );

  return (
    <>
      <OrdersPageHeader title={t("title")} />

      <HydrationBoundary state={dehydrate(qc)}>
        <OrdersPageClient
        />
      </HydrationBoundary>
    </>
  );
}
