"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useClearNotificationsMutation } from "../hooks/use-clear-notifications-mutation";

type Props = {
  title: string;
  clearAllLabel: string;
  hasItems: boolean;
};

export function NotificationsToolbar({
  title,
  clearAllLabel,
  hasItems,
}: Props) {
  const clear = useClearNotificationsMutation();

  const onClearAll = async () => {
    await clear.mutateAsync();
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>

      <Button
        type="button"
        onClick={onClearAll}
        className="bg-[#F2542F] hover:bg-[#F2542F]/90"
        disabled={!hasItems || clear.isPending}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        {clear.isPending ? "..." : clearAllLabel}
      </Button>
    </div>
  );
}
