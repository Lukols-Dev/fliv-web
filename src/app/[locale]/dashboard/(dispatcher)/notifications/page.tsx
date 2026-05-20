import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cookies } from "next/headers";
import { notificationsQueryOptions } from "@/features/notification/queries/notifications.query";
import NotificationsPageClient from "./page.client";
import { ApiError } from "@/config/http/api-client";
import { redirect } from "next/navigation";
import { getQueryClient } from "@/providers/react-query/get-query-client";

function parsePositiveInt(v: string | undefined, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export default async function NotificationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; limit?: string }>;
}) {
  const { locale } = await params;
  const paramsSearch = await searchParams;
  const page = parsePositiveInt(paramsSearch.page, 1);
  const limit = parsePositiveInt(paramsSearch.limit, 12);

  const cookieStore = await cookies();
  const headers = { Cookie: cookieStore.toString() };

  const qc = getQueryClient();
  try {
    await qc.prefetchQuery(
      notificationsQueryOptions({
        page,
        limit,
        locale,
        headers,
      })
    );
  } catch (e) {
    if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
      redirect("/sign-in");
    }
    throw e;
  }

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <NotificationsPageClient />
    </HydrationBoundary>
  );
}
