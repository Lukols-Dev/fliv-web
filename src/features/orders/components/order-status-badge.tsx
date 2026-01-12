import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "../types";

type Props = {
  status: OrderStatus;
  className?: string;
  size?: "sm" | "md";
  labels?: Partial<Record<OrderStatus, string>>;
};

type Variant = "default" | "secondary" | "destructive" | "outline";

const STATUS_UI: Record<
  OrderStatus,
  { variant: Variant; defaultLabel: string }
> = {
  in_progress: { variant: "default", defaultLabel: "W trakcie" },
  waiting: { variant: "secondary", defaultLabel: "Oczekuje" },
  done: { variant: "outline", defaultLabel: "Zakończone" },
  issue: { variant: "destructive", defaultLabel: "Problem" },
};

export default function OrderStatusBadge({
  status,
  className,
  size = "sm",
  labels,
}: Props) {
  const ui = STATUS_UI[status];
  const label = labels?.[status] ?? ui.defaultLabel;

  return (
    <Badge
      variant={ui.variant}
      className={cn(
        "whitespace-nowrap",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        className
      )}
    >
      {label}
    </Badge>
  );
}
