import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import type { OrderStatus } from "../types";

type Props = {
  status: OrderStatus;
  className?: string;
  size?: "sm" | "md";
};

const STATUS_UI: Record<
  OrderStatus,
  { className: string; translationKey: string }
> = {
  PENDING: {
    className: "border border-[#EBE5D4]/60 bg-transparent text-[#EBE5D4]",
    translationKey: "PENDING",
  },
  ACCEPTED: {
    className: "border border-[#709470] bg-transparent text-[#709470]",
    translationKey: "ACCEPTED",
  },
  IN_PROGRESS: {
    className: "border border-trasnparent bg-[#709470]/20 text-[#709470]",
    translationKey: "IN_PROGRESS",
  },
  LOADING: {
    className: "border border-trasnparent bg-[#709470]/20 text-[#709470]",
    translationKey: "LOADING",
  },
  UNLOADING: {
    className: "border border-trasnparent bg-[#709470]/20 text-[#709470]",
    translationKey: "UNLOADING",
  },
  PAUSED: {
    className: "border border-[#EBE5D4]/60 bg-[#EBE5D4]/40 text-[#EBE5D4]",
    translationKey: "PAUSED",
  },
  COMPLETED: {
    className: "border border-trasnparent bg-[#709470]/20 text-[#709470]",
    translationKey: "COMPLETED",
  },
  PROBLEM: {
    className:
      "border border-destructive/40 bg-destructive/20 text-destructive",
    translationKey: "PROBLEM",
  },
};

export default function OrderStatusBadge({
  status,
  className,
  size = "sm",
}: Props) {
  const t = useTranslations("OrderStatus");
  const ui = STATUS_UI[status];
  const label = t(ui.translationKey);

  return (
    <Badge
      variant="outline"
      className={cn(
        "whitespace-nowrap font-medium",
        ui.className,
        size === "md" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        className
      )}
    >
      {label}
    </Badge>
  );
}
