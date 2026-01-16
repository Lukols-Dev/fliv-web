import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { authEndpoints } from "./endpoints";
import { ApiError, apiFetchPath } from "@/config/http/api-client";

type SessionPayload = {
  user: {
    id: string;
    email: string;
    name: string;
    firstName: string;
    lastName: string;
    roles?: string[];
    avatarUrl?: string | null;
  };
} | null;

const REQUEST_TIMEOUT_MS = 3000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Session timeout")), ms)
    ),
  ]);
}

export const fetchSession = async (): Promise<SessionPayload> => {
  const h = await headers();
  const cookie = h.get("cookie") ?? "";

  try {
    const session = await withTimeout(
      apiFetchPath<SessionPayload>(authEndpoints.session, {
        method: "GET",
        headers: { cookie },
        cache: "no-store",
      }),
      REQUEST_TIMEOUT_MS
    );

    return session ?? null;
  } catch (e) {
    if (e instanceof ApiError) console.log("get-session", e.status, e.payload);
    else console.log("get-session error", e);

    return null;
  }
};

export const redirectIfAuthenticated = async (okUrl = "/dashboard") => {
  const session = await fetchSession();
  if (session) redirect(okUrl);
};

export const requireUserOrRedirect = async (returnTo = "/dashboard") => {
  const session = await fetchSession();

  if (!session) {
    const q = encodeURIComponent(returnTo);
    redirect(`/sign-in?redirect=${q}`);
  }
  return session;
};
