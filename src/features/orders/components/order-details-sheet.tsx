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
import {
  MapPin,
  Phone,
  MessageSquare,
  MoreVertical,
  Truck,
} from "lucide-react";
import OrderStatusBadge from "./order-status-badge";
import type { OrderListItem, OrderStatus } from "../types";
import { useTranslations } from "next-intl";
import { Icons } from "@/components/icons";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selected: OrderListItem | null;
  onEdit?: () => void;
  onDelete?: () => void;
};

type TrackingEvent = {
  status: OrderStatus;
  time: string; // "10:25:34"
  date: string; // "11.10.2025"
};

export default function OrderDetailsSheet({
  open,
  onOpenChange,
  selected,
  onEdit,
  onDelete,
}: Props) {
  const t = useTranslations("OrdersDetails");

  const orderNumber = selected?.number ?? "#ZL-—";
  const orderStatus = selected?.status ?? "PENDING";

  // MOCKI – później podepniesz prawdziwe dane z API
  const driver = { name: "Jan Nowak", role: t("driver.role"), initials: "JN" };
  const from = {
    city: "Piaseczno",
    country: "Polska",
    addressLine: "Jana Pawła II 66, 05-500",
  };
  const to = {
    city: "Wiedeń",
    country: "Austria",
    addressLine: "Elisabethstraße 1010, Operngasse 3",
  };

  const stats = [
    { label: t("stats.currentDistance"), value: "10 km" },
    { label: t("stats.distance"), value: "123 km" },
    { label: t("stats.startTime"), value: "15:25" },
    { label: t("stats.startDate"), value: "13.09.2025" },
  ] as const;

  const history: TrackingEvent[] = [
    { status: "PENDING", time: "10:25:34", date: "11.10.2025" },
    { status: "ACCEPTED", time: "10:25:34", date: "11.10.2025" },
    { status: "LOADING", time: "11:10:25", date: "11.10.2025" },
  ];

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
                        onClick={onDelete}
                        className="text-destructive focus:text-destructive"
                      >
                        <Icons.trash className="mr-2 h-4 w-4 text-destructive" />
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
                  {/* Driver box */}
                  <Card className="border border-[#EBE5D4] bg-[#EBE5D4]/18 shadow-none">
                    <div className="flex items-center justify-between gap-3 px-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>{driver.initials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            {driver.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {driver.role}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <IconActionButton
                          label={t("driver.call")}
                          icon={<Phone className="h-4 w-4 text-[#709470]" />}
                          onAction={() => {}}
                          className="bg-transparent border border-[#EBE5D4]"
                        />
                        <IconActionButton
                          label={t("driver.message")}
                          icon={
                            <MessageSquare className="h-4 w-4 text-[#709470]" />
                          }
                          onAction={() => {}}
                          className="bg-transparent border border-[#EBE5D4]"
                        />
                      </div>
                    </div>
                  </Card>

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
                      <div className="relative aspect-[4/3] w-full bg-muted">
                        <div className="absolute inset-0 grid place-items-center text-xs text-muted-foreground">
                          {t("route.mapPlaceholder")}
                        </div>
                      </div>
                    </Card>

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
                          <p className="font-medium">
                            {from.city}, {from.country}
                          </p>
                          <p className="text-muted-foreground">
                            {from.addressLine}
                          </p>
                        </div>

                        <div className="min-w-0 text-right">
                          <p className="font-medium">
                            {to.city}, {to.country}
                          </p>
                          <p className="text-muted-foreground">
                            {to.addressLine}
                          </p>
                        </div>
                      </div>
                    </div>

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

                  <Separator className="my-5" />

                  {/* Tracking history */}
                  <div>
                    <h3 className="text-base font-semibold">
                      {t("tracking.title")}
                    </h3>

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
                  </div>
                </TabsContent>

                {/* DOCUMENTS TAB */}
                <TabsContent value="documents" className="mt-3">
                  <Card className="border shadow-none">
                    <div className="p-4 text-sm text-muted-foreground">
                      {t("documents.empty")}
                    </div>
                  </Card>
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

function IconActionButton({
  icon,
  className,
  label,
  onAction,
}: {
  icon: React.ReactNode;
  label: string;
  className?: string;
  onAction: () => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className={cn("h-9 w-9 cursor-pointer", className)}
      aria-label={label}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onAction();
      }}
    >
      {icon}
    </Button>
  );
}
