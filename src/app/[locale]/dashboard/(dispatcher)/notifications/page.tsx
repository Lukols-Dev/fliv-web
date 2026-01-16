import { QueryClient, dehydrate } from "@tanstack/react-query";
import { HydrationBoundary } from "@tanstack/react-query";
import { cookies } from "next/headers";
import { notificationsQueryOptions } from "@/features/notification/queries/notifications.query";
import NotificationsPageClient from "./page.client";
import { ApiError } from "@/config/http/api-client";
import { redirect } from "next/navigation";

export default async function NotificationsPage() {
  const queryClient = new QueryClient();

  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  try {
    await queryClient.prefetchQuery(
      notificationsQueryOptions({
        headers: { cookie: cookieHeader },
      })
    );
  } catch (e) {
    if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
      redirect("/sign-in");
    }
    throw e;
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotificationsPageClient />
    </HydrationBoundary>
  );
}
