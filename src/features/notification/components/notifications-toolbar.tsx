"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

type Props = {
  title: string;
  clearAllLabel: string;
};

export function NotificationsToolbar({ title, clearAllLabel }: Props) {
  const onClearAll = () => {
    // TODO: podłącz do API + optimistic update
    // na razie demo:
    console.log("clear all notifications");
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>

      <Button
        type="button"
        onClick={onClearAll}
        className="bg-[#F2542F] hover:bg-[#F2542F]/90"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        {clearAllLabel}
      </Button>
    </div>
  );
}
