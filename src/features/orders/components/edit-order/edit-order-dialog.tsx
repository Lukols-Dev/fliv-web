"use client";

import { useCallback } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import EditOrderForm from "./edit-order-form";
import type { OrderDetailsDto } from "../../types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  initial: OrderDetailsDto;
};

export default function EditOrderDialog({
  open,
  onOpenChange,
  orderId,
  initial,
}: Props) {
  const t = useTranslations("CreateOrderDialog");

  const handleSaved = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl max-h-[90vh] p-0 overflow-hidden flex flex-col"
        showCloseButton={false}
      >
        <div className="relative flex flex-col overflow-y-auto flex-1">
          <div className="absolute right-4 top-4 z-10">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => onOpenChange(false)}
              aria-label={t("buttons.close")}
              className="h-10 w-10 rounded-xl"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="p-6 pb-4">
            <DialogTitle className="text-2xl font-semibold tracking-tight">
              {t("editTitle")}
            </DialogTitle>
          </div>

          <div className="px-6 pb-6">
            <EditOrderForm
              orderId={orderId}
              initial={initial}
              onSaved={handleSaved}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
