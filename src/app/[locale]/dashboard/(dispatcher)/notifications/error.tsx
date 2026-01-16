"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="p-6 space-y-3">
      <p className="text-sm text-destructive">Błąd: {error.message}</p>
      <Button onClick={() => reset()}>Spróbuj ponownie</Button>
    </div>
  );
}
