"use client";

import type { ReactNode } from "react";
import { useCallback, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import CreateOrderForm from "./create-order-form";

type Props = {
  trigger: ReactNode;
};

export default function CreateOrderDialog({ trigger }: Props) {
  const t = useTranslations("CreateOrderDialog");
  const [open, setOpen] = useState(false);

  const handleCreated = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

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
              onClick={() => setOpen(false)}
              aria-label={t("buttons.close")}
              className="h-10 w-10 rounded-xl"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="p-6 pb-4">
            <DialogTitle className="text-2xl font-semibold tracking-tight">
              {t("title")}
            </DialogTitle>
          </div>

          <div className="px-6 pb-6">
            <CreateOrderForm onCreated={handleCreated} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
