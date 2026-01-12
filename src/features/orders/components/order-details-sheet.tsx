"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import type { OrderListItem } from "../types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selected: OrderListItem | null;
  i18n: {
    title: string;
    subtitle: string;
    close: string;
  };
};

export default function OrderDetailsSheet({
  open,
  onOpenChange,
  selected,
  i18n,
}: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="truncate">
            {i18n.title}
            {selected ? ` ${selected.number}` : ""}
          </SheetTitle>
          <SheetDescription>{i18n.subtitle}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 flex flex-col gap-4">
          <Card className="h-[180px] rounded-xl border shadow-none" />
          <Card className="h-[320px] rounded-xl border shadow-none" />
          <Card className="h-[220px] rounded-xl border shadow-none" />

          <div className="pt-2">
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              {i18n.close}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
