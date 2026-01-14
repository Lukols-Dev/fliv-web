import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import AccountPageClient from "./page.client";
import { currentUserQueryOptions } from "@/features/account/queries/current-user.query";
import { cookies } from "next/headers";
import { ApiError } from "@/config/http/api-client";
import { redirect } from "next/navigation";

export default async function AccountPage() {
  const queryClient = new QueryClient();
  const cookieHeader = (await cookies()).toString();

  try {
    await queryClient.prefetchQuery(
      currentUserQueryOptions({
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
      <AccountPageClient />
    </HydrationBoundary>
  );
}
