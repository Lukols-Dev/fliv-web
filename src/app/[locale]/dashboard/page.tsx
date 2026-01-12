"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/features/auth/lib/auth";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();
  console.log("session", session);
  console.log("isPending", isPending);

  const onSignOut = async () => {
    await authClient.signOut();
    router.replace("/");
    router.refresh();
  };

  return (
    <section className="relative z-1 flex h-full flex-col gap-y-6 px-4 py-6 pb-48">
      <h1 className="text-3xl font-bold text-black">
        User Dashboard tylko zalogowanie
      </h1>
      <Button
        variant="ghost"
        onClick={onSignOut}
        className="w-full justify-start gap-4 focus-visible:border-transparent focus-visible:ring-0"
      >
        Log out
      </Button>
    </section>
  );
}
