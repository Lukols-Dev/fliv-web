"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { MapPin, MoreVertical, Truck } from "lucide-react";
import OrderStatusBadge from "./order-status-badge";
import type { OrderListItem, OrderStatus } from "../types";
import { useTranslations, useLocale } from "next-intl";
import { Icons } from "@/components/icons";
import { useDeleteOrderMutation } from "../hooks/use-delete-order-mutation";
import { useOrderDetailsQuery } from "../hooks/use-order-details-query";
import { Spinner } from "@/components/ui/spinner";
import { formatDatePL, formatTimeHM, formatTimeHMS } from "@/lib/format";
import { initials } from "@/lib/utils";
import { DriverActionButtons } from "./driver-action-buttons";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selected: OrderListItem | null;
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function OrderDetailsSheet({
  open,
  onOpenChange,
  selected,
  onEdit,
  onDelete,
}: Props) {
  const t = useTranslations("OrdersDetails");
  const locale = useLocale();
  const del = useDeleteOrderMutation();

  const orderId = selected?.id;
  const {
    data: orderDetails,
    isPending,
    isError,
  } = useOrderDetailsQuery({
    id: orderId ?? "",
    enabled: open && !!orderId,
  });

  const orderNumber = orderDetails?.ztNumber ?? selected?.number ?? "#ZL-—";
  const orderStatus = (orderDetails?.status ??
    selected?.status ??
    "PENDING") as OrderStatus;

  const driverName = orderDetails
    ? `${orderDetails.driverFirstName ?? ""} ${
        orderDetails.driverLastName ?? ""
      }`.trim() || "—"
    : "—";
  const driverPhone = orderDetails?.driverPhone ?? null;
  const driverInitials = driverName !== "—" ? initials(driverName) : "—";

  const fromCountry = orderDetails?.fromCountry ?? "—";
  const fromAddress = orderDetails?.fromAddress ?? null;
  const toCountry = orderDetails?.toCountry ?? "—";
  const toAddress = orderDetails?.toAddress ?? null;

  const loadingDate = orderDetails?.loadingDate
    ? new Date(orderDetails.loadingDate)
    : null;
  const stats = [
    { label: t("stats.currentDistance"), value: "—" },
    { label: t("stats.distance"), value: "—" },
    {
      label: t("stats.startTime"),
      value: loadingDate ? formatTimeHM(loadingDate, locale) : "—",
    },
    {
      label: t("stats.startDate"),
      value: loadingDate ? formatDatePL(loadingDate, locale) : "—",
    },
  ] as const;

  const history = React.useMemo(() => {
    if (!orderDetails?.events) return [];
    return orderDetails.events
      .filter((ev) => ev.newStatus)
      .map((ev) => {
        const date = new Date(ev.createdAt);
        return {
          status: ev.newStatus!,
          time: formatTimeHMS(date, locale),
          date: formatDatePL(date, locale),
        };
      });
  }, [orderDetails?.events, locale]);

  const handleDelete = React.useCallback(async () => {
    if (!orderId || del.isPending) return;

    await del.mutateAsync(orderId);

    onOpenChange(false);
    onDelete?.();
  }, [orderId, del, onOpenChange, onDelete]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md md:max-w-lg p-0"
        hideClose
      >
        <div className="flex h-full flex-col overflow-y-auto">
          {/* Header */}
          <div className="px-0 pt-2 pb-3">
            <SheetHeader className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex items-center gap-2">
                  <SheetTitle className="truncate text-lg font-semibold">
                    {orderNumber}
                  </SheetTitle>
                  <OrderStatusBadge status={orderStatus} />
                </div>

                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 cursor-pointer"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={onEdit}>
                        <Icons.pencil className="mr-2 h-4 w-4" />
                        {t("actions.edit")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleDelete}
                        disabled={!orderId || del.isPending}
                        className="text-destructive focus:text-destructive"
                      >
                        {del.isPending ? (
                          <Spinner />
                        ) : (
                          <Icons.trash className="mr-2 h-4 w-4 text-destructive" />
                        )}
                        {t("actions.delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <Tabs defaultValue="info" className="w-full">
                <TabsList className="h-8">
                  <TabsTrigger value="info" className="text-xs">
                    {t("tabs.info")}
                  </TabsTrigger>
                  <TabsTrigger value="documents" className="text-xs">
                    {t("tabs.documents")}
                  </TabsTrigger>
                </TabsList>

                {/* INFO TAB */}
                <TabsContent value="info" className="mt-3">
                  {isPending ? (
                    <div className="flex items-center justify-center py-8">
                      <Spinner />
                    </div>
                  ) : isError ? (
                    <div className="py-8 text-center text-sm text-destructive">
                      Failed to load order details
                    </div>
                  ) : (
                    <>
                      {/* Driver box */}
                      {orderDetails && (
                        <Card className="border border-[#EBE5D4] bg-[#EBE5D4]/18 shadow-none">
                          <div className="flex items-center justify-between gap-3 px-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <Avatar className="h-12 w-12">
                                <AvatarFallback>
                                  {driverInitials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold">
                                  {driverName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {t("driver.role")}
                                </p>
                              </div>
                            </div>

                            <DriverActionButtons
                              phoneNumber={driverPhone}
                              buttonClassName="bg-transparent border border-[#EBE5D4]"
                            />
                          </div>
                        </Card>
                      )}

                      {/* Route section */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-semibold">
                            {t("route.title")}
                          </h3>
                          <Button size="sm" className="h-8 cursor-pointer">
                            <Icons.pencil className="mr-2 h-4 w-4" />
                            {t("route.edit")}
                          </Button>
                        </div>

                        {/* Map placeholder */}
                        <Card className="mt-3 overflow-hidden border shadow-none">
                          <div className="relative aspect-4/3 w-full bg-muted">
                            <div className="absolute inset-0 grid place-items-center text-xs text-muted-foreground">
                              {t("route.mapPlaceholder")}
                            </div>
                          </div>
                        </Card>

                        {/* Stats */}
                        <div className="mt-6 grid grid-cols-4 gap-2">
                          {stats.map((s, idx) => (
                            <div
                              key={s.label}
                              className={cn(
                                "px-1",
                                idx !== 0 && "border-l border-border/60 pl-3"
                              )}
                            >
                              <p className="text-[11px] text-muted-foreground">
                                {s.label}
                              </p>
                              <p className="text-sm font-semibold">{s.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Route line */}
                      <div className="mt-6">
                        <div className="relative flex items-center justify-between">
                          <span
                            className={cn(
                              "inline-flex h-6 w-6 items-center justify-center rounded-full transition-colors",
                              (orderStatus === "IN_PROGRESS" ||
                                orderStatus === "LOADING" ||
                                orderStatus === "UNLOADING") &&
                                "bg-[#709470]/20",
                              (orderStatus === "PENDING" ||
                                orderStatus === "PAUSED" ||
                                orderStatus === "ACCEPTED") &&
                                "bg-[#EBE5D4]/40",
                              orderStatus === "COMPLETED" && "bg-green-500/20",
                              orderStatus === "PROBLEM" && "bg-destructive/20"
                            )}
                          >
                            <span
                              className={cn(
                                "h-3 w-3 transition-colors rounded-full",
                                (orderStatus === "IN_PROGRESS" ||
                                  orderStatus === "LOADING" ||
                                  orderStatus === "UNLOADING") &&
                                  "bg-[#709470]",
                                (orderStatus === "PENDING" ||
                                  orderStatus === "PAUSED" ||
                                  orderStatus === "ACCEPTED") &&
                                  "bg-[#EBE5D4]",
                                orderStatus === "COMPLETED" && "bg-green-500",
                                orderStatus === "PROBLEM" && "bg-destructive"
                              )}
                            />
                          </span>

                          <div
                            className={cn(
                              "mx-2 h-[2px] flex-1 transition-colors",
                              (orderStatus === "IN_PROGRESS" ||
                                orderStatus === "UNLOADING") &&
                                "bg-[#709470]/20",
                              (orderStatus === "PENDING" ||
                                orderStatus === "PAUSED" ||
                                orderStatus === "LOADING" ||
                                orderStatus === "ACCEPTED") &&
                                "bg-[#EBE5D4]",
                              orderStatus === "COMPLETED" && "bg-green-500",
                              orderStatus === "PROBLEM" && "bg-destructive/20"
                            )}
                          />

                          <span
                            className={cn(
                              "inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                              (orderStatus === "IN_PROGRESS" ||
                                orderStatus === "UNLOADING") &&
                                "text-[#709470]",
                              (orderStatus === "PENDING" ||
                                orderStatus === "PAUSED" ||
                                orderStatus === "LOADING" ||
                                orderStatus === "ACCEPTED") &&
                                "text-[#EBE5D4]",
                              orderStatus === "COMPLETED" && "text-green-600",
                              orderStatus === "PROBLEM" && "text-destructive"
                            )}
                          >
                            <Truck className="h-6 w-6" />
                          </span>

                          <div
                            className={cn(
                              "mx-2 h-[2px] flex-1 transition-colors",
                              (orderStatus === "IN_PROGRESS" ||
                                orderStatus === "UNLOADING") &&
                                "bg-[#709470]/20",
                              (orderStatus === "PENDING" ||
                                orderStatus === "PAUSED" ||
                                orderStatus === "LOADING" ||
                                orderStatus === "ACCEPTED" ||
                                orderStatus === "IN_PROGRESS") &&
                                "bg-[#EBE5D4]",
                              orderStatus === "COMPLETED" && "bg-green-500",
                              orderStatus === "PROBLEM" && "bg-destructive/20"
                            )}
                          />

                          <span
                            className={cn(
                              "inline-flex h-6 w-6 items-center justify-center rounded-full transition-colors",
                              (orderStatus === "IN_PROGRESS" ||
                                orderStatus === "UNLOADING") &&
                                "bg-[#709470]/20",
                              (orderStatus === "PENDING" ||
                                orderStatus === "PAUSED" ||
                                orderStatus === "LOADING" ||
                                orderStatus === "ACCEPTED" ||
                                orderStatus === "IN_PROGRESS") &&
                                "bg-[#EBE5D4]/40",
                              orderStatus === "COMPLETED" && "bg-green-500/20",
                              orderStatus === "PROBLEM" && "bg-destructive/20"
                            )}
                          >
                            <MapPin
                              className={cn(
                                "h-4 w-4 transition-colors",
                                orderStatus === "UNLOADING" && "text-[#709470]",
                                (orderStatus === "PENDING" ||
                                  orderStatus === "PAUSED" ||
                                  orderStatus === "LOADING" ||
                                  orderStatus === "ACCEPTED" ||
                                  orderStatus === "IN_PROGRESS") &&
                                  "text-[#EBE5D4]",
                                orderStatus === "COMPLETED" && "text-green-600",
                                orderStatus === "PROBLEM" && "text-destructive"
                              )}
                            />
                          </span>
                        </div>

                        {/* addresses */}
                        <div className="mt-3 grid grid-cols-2 gap-3 text-[11px] leading-snug">
                          <div className="min-w-0">
                            <p className="font-medium">{fromCountry}</p>
                            <p className="text-muted-foreground">
                              {fromAddress || "—"}
                            </p>
                          </div>

                          <div className="min-w-0 text-right">
                            <p className="font-medium">{toCountry}</p>
                            <p className="text-muted-foreground">
                              {toAddress || "—"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <Separator className="my-5" />

                      {/* Tracking history */}
                      <div>
                        <h3 className="text-base font-semibold">
                          {t("tracking.title")}
                        </h3>

                        {history.length > 0 ? (
                          <div className="mt-3 space-y-2">
                            {history.map((ev, i) => (
                              <div
                                key={`${ev.status}-${i}`}
                                className="flex items-center justify-between"
                              >
                                <OrderStatusBadge status={ev.status} />
                                <div className="text-right text-[11px] text-muted-foreground">
                                  <div>{ev.time}</div>
                                  <div>{ev.date}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <Card className="mt-3 border shadow-none">
                            <div className="p-4 text-sm text-muted-foreground">
                              {t("tracking.empty")}
                            </div>
                          </Card>
                        )}
                      </div>
                    </>
                  )}
                </TabsContent>

                {/* DOCUMENTS TAB */}
                <TabsContent value="documents" className="mt-3">
                  {isPending ? (
                    <div className="flex items-center justify-center py-8">
                      <Spinner />
                    </div>
                  ) : isError ? (
                    <div className="py-8 text-center text-sm text-destructive">
                      Failed to load documents
                    </div>
                  ) : orderDetails && orderDetails.documents.length > 0 ? (
                    <div className="space-y-2">
                      {orderDetails.documents.map((doc) => (
                        <Card key={doc.id} className="border shadow-none p-4">
                          <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold">
                                {doc.title || doc.originalFilename}
                              </p>
                              {doc.description && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {doc.description}
                                </p>
                              )}
                              <p className="mt-1 text-xs text-muted-foreground">
                                {formatDatePL(new Date(doc.createdAt), locale)}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(doc.url, "_blank")}
                            >
                              View
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="border shadow-none">
                      <div className="p-4 text-sm text-muted-foreground">
                        {t("documents.empty")}
                      </div>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </SheetHeader>
          </div>

          {/* (opcjonalnie) dół / sticky actions później */}
          <div className="mt-auto" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
