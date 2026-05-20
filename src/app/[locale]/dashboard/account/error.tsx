"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("AccountPage");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="p-6 space-y-3">
      <p className="text-sm text-destructive">
        {t("errorPrefix")}: {error.message}
      </p>
      <Button onClick={() => reset()}>{t("retry")}</Button>
    </div>
  );
}
