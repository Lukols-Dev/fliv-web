import * as React from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { MapPin, Phone, MessageSquare, Truck, Circle } from "lucide-react";
import { useTranslations } from "next-intl";
import OrderStatusBadge from "./order-status-badge";
import type { OrderStatus } from "../types";

type Props = {
  onClick: () => void;
  isActive?: boolean;

  orderNumber: string;
  createdAt: string;
  status: OrderStatus;

  from: { city: string; country: string; addressLine: string };
  to: { city: string; country: string; addressLine: string };

  driver: { name: string; roleLabel: string; initials?: string };

  onCallDriver?: () => void;
  onMessageDriver?: () => void;
};

export default function OrderCard({
  onClick,
  isActive = false,
  orderNumber,
  createdAt,
  status,
  from,
  to,
  driver,
  onCallDriver,
  onMessageDriver,
}: Props) {
  const t = useTranslations("OrderCard");

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={onKeyDown}
      aria-label={`${t("openDetails")} ${orderNumber}`}
      className="cursor-pointer outline-none"
    >
      <Card
        className={cn(
          "h-auto rounded-xl border bg-card shadow-none transition-all duration-200",
          "hover:bg-muted/20 hover:shadow-lg hover:shadow-[#F2542F]/15 hover:-translate-y-1",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          isActive
            ? "border-[#F2542F]/60 shadow-lg shadow-[#F2542F]/20"
            : "border-border"
        )}
      >
        {/* Top */}
        <div className="flex items-start justify-between gap-3 px-4 pt-4">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">
              {t("orderNumberLabel")}
            </p>
            <p className="truncate text-lg font-semibold leading-6">
              {orderNumber}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {t("createdAt")} {createdAt}
            </p>
          </div>

          <OrderStatusBadge
            status={status}
            className={cn(
              status === "issue" &&
                "bg-destructive/15 text-destructive border-0"
            )}
          />
        </div>

        <div className="px-4 pt-3">
          <Separator />
        </div>

        {/* Route line */}
        <div className="px-4 pt-3">
          <div className="relative flex items-center justify-between">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted">
              <Circle className="h-3 w-3 text-muted-foreground" />
            </span>

            <div className="mx-2 h-[2px] flex-1 bg-muted" />

            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#F2542F]/10 text-[#F2542F]">
              <Truck className="h-4 w-4" />
            </span>

            <div className="mx-2 h-[2px] flex-1 bg-muted" />

            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted">
              <MapPin className="h-3 w-3 text-muted-foreground" />
            </span>
          </div>

          {/* addresses */}
          <div className="mt-3 grid grid-cols-2 gap-3 text-[11px] leading-snug">
            <div className="min-w-0">
              <p className="font-medium">
                {from.city}, {from.country}
              </p>
              <p className="text-muted-foreground">{from.addressLine}</p>
            </div>

            <div className="min-w-0 text-right">
              <p className="font-medium">
                {to.city}, {to.country}
              </p>
              <p className="text-muted-foreground">{to.addressLine}</p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-3 flex items-center justify-between gap-3 px-4 pb-4">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback>
                {(driver.initials ?? driver.name.slice(0, 2)).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-5">
                {driver.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {driver.roleLabel}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <IconActionButton
              icon={<Phone className="h-4 w-4" />}
              label={t("actions.callDriver")}
              onAction={onCallDriver}
            />
            <IconActionButton
              icon={<MessageSquare className="h-4 w-4" />}
              label={t("actions.messageDriver")}
              onAction={onMessageDriver}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

function IconActionButton({
  icon,
  label,
  onAction,
}: {
  icon: React.ReactNode;
  label: string;
  onAction?: () => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="h-9 w-9 rounded-lg border-muted-foreground/20"
      aria-label={label}
      onClick={(e) => {
        // nie otwieramy sheeta klikając w akcje
        e.preventDefault();
        e.stopPropagation();
        onAction?.();
      }}
    >
      {icon}
    </Button>
  );
}
