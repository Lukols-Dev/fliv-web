"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import CreateOrderDialog from "./create-order-dialog";

export default function CreateOrderButton() {
  const t = useTranslations("CreateOrderDialog");

  return (
    <CreateOrderDialog
      trigger={
        <Button className="inline-flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {t("trigger")}
        </Button>
      }
    />
  );
}
