import * as React from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { MapPin, Phone, MessageSquare, Truck } from "lucide-react";
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
          "bg-white h-auto rounded-xl border shadow-none transition-all duration-200",
          "hover:shadow-lg hover:shadow-[#F2542F]/15 hover:-translate-y-1",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          isActive
            ? "border-[#F2542F]/60 shadow-lg shadow-[#F2542F]/20"
            : "border-border"
        )}
      >
        {/* Top */}
        <div className="flex items-start justify-between gap-3 px-4 pt-4">
          <div className="min-w-0">
            <p className="text-xs text-[#709470]">{t("orderNumberLabel")}</p>
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
              status === "PROBLEM" &&
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
            <span
              className={cn(
                "inline-flex h-6 w-6 items-center justify-center rounded-full transition-colors",
                (status === "IN_PROGRESS" ||
                  status === "LOADING" ||
                  status === "UNLOADING") &&
                  "bg-[#709470]/20",

                (status === "PENDING" ||
                  status === "PAUSED" ||
                  status === "ACCEPTED") &&
                  "bg-[#EBE5D4]/40",
                status === "COMPLETED" && "bg-green-500/20",
                status === "PROBLEM" && "bg-destructive/20"
              )}
            >
              <span
                className={cn(
                  "h-3 w-3 transition-colors rounded-full",
                  (status === "IN_PROGRESS" ||
                    status === "LOADING" ||
                    status === "UNLOADING") &&
                    "bg-[#709470]",
                  (status === "PENDING" ||
                    status === "PAUSED" ||
                    status === "ACCEPTED") &&
                    "bg-[#EBE5D4]",
                  status === "COMPLETED" && "bg-green-500",
                  status === "PROBLEM" && "bg-destructive"
                )}
              />
            </span>

            <div
              className={cn(
                "mx-2 h-[2px] flex-1 transition-colors",
                (status === "IN_PROGRESS" || status === "UNLOADING") &&
                  "bg-[#709470]/20",
                (status === "PENDING" ||
                  status === "PAUSED" ||
                  status === "LOADING" ||
                  status === "ACCEPTED") &&
                  "bg-[#EBE5D4]",
                status === "COMPLETED" && "bg-green-500",
                status === "PROBLEM" && "bg-destructive/20"
              )}
            />

            <span
              className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                (status === "IN_PROGRESS" || status === "UNLOADING") &&
                  "text-[#709470]",
                (status === "PENDING" ||
                  status === "PAUSED" ||
                  status === "LOADING" ||
                  status === "ACCEPTED") &&
                  "text-[#EBE5D4]",
                status === "COMPLETED" && "text-green-600",
                status === "PROBLEM" && "text-destructive"
              )}
            >
              <Truck className="h-6 w-6" />
            </span>

            <div
              className={cn(
                "mx-2 h-[2px] flex-1 transition-colors",
                (status === "IN_PROGRESS" || status === "UNLOADING") &&
                  "bg-[#709470]/20",
                (status === "PENDING" ||
                  status === "PAUSED" ||
                  status === "LOADING" ||
                  status === "ACCEPTED" ||
                  status === "IN_PROGRESS") &&
                  "bg-[#EBE5D4]",
                status === "COMPLETED" && "bg-green-500",
                status === "PROBLEM" && "bg-destructive/20"
              )}
            />

            <span
              className={cn(
                "inline-flex h-6 w-6 items-center justify-center rounded-full transition-colors",
                (status === "IN_PROGRESS" || status === "UNLOADING") &&
                  "bg-[#709470]/20",
                (status === "PENDING" ||
                  status === "PAUSED" ||
                  status === "LOADING" ||
                  status === "ACCEPTED" ||
                  status === "IN_PROGRESS") &&
                  "bg-[#EBE5D4]/40",
                status === "COMPLETED" && "bg-green-500/20",
                status === "PROBLEM" && "bg-destructive/20"
              )}
            >
              <MapPin
                className={cn(
                  "h-4 w-4 transition-colors",
                  status === "UNLOADING" && "text-[#709470]",
                  (status === "PENDING" ||
                    status === "PAUSED" ||
                    status === "LOADING" ||
                    status === "ACCEPTED" ||
                    status === "IN_PROGRESS") &&
                    "text-[#EBE5D4]",
                  status === "COMPLETED" && "text-green-600",
                  status === "PROBLEM" && "text-destructive"
                )}
              />
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

        <div className="px-4 pt-3">
          <Separator />
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
              <p className="text-xs text-[#709470]">{driver.roleLabel}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <IconActionButton
              icon={<Phone className="h-4 w-4 text-[#709470]" />}
              label={t("actions.callDriver")}
              onAction={onCallDriver}
            />
            <IconActionButton
              icon={<MessageSquare className="h-4 w-4 text-[#709470]" />}
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
