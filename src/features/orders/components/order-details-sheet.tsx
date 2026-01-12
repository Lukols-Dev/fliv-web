"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
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
  Pencil,
  Trash2,
} from "lucide-react";
import OrderStatusBadge from "./order-status-badge";
import type { OrderListItem, OrderStatus } from "../types";
import { useTranslations } from "next-intl";

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
    city: "Piaseczno, Polska",
    address: "Jana Pawła II 66, 05-500",
  };
  const to = {
    city: "Operngasse 3, Wiedeń",
    address: "Elisabethstraße 1010, Wien, Austria",
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
      <SheetContent side="right" className="w-full sm:max-w-md md:max-w-lg p-0">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="px-4 pt-4 pb-3">
            <SheetHeader className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <SheetTitle className="truncate text-lg font-semibold">
                    {orderNumber}
                  </SheetTitle>
                  <SheetDescription className="text-xs">
                    {t("header.subtitle")}
                  </SheetDescription>
                </div>

                <div className="flex items-center gap-2">
                  <OrderStatusBadge status={orderStatus} />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={onEdit}>
                        <Pencil className="mr-2 h-4 w-4" />
                        {t("actions.edit")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={onDelete}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
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
                  <Card className="border shadow-none">
                    <div className="flex items-center justify-between gap-3 p-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar className="h-10 w-10">
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
                          icon={<Phone className="h-4 w-4" />}
                          onAction={() => {}}
                        />
                        <IconActionButton
                          label={t("driver.message")}
                          icon={<MessageSquare className="h-4 w-4" />}
                          onAction={() => {}}
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
                      <Button size="sm" className="h-8">
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

                    {/* Stats */}
                    <div className="mt-3 grid grid-cols-4 gap-2">
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

                    {/* Addresses row */}
                    <div className="mt-4">
                      <div className="grid grid-cols-2 gap-3 text-[11px] leading-snug">
                        <div className="min-w-0">
                          <div className="flex items-start gap-2">
                            <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted">
                              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                            </span>
                            <div className="min-w-0">
                              <p className="font-medium">{from.city}</p>
                              <p className="text-muted-foreground">
                                {from.address}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="min-w-0 text-right">
                          <div className="flex items-start justify-end gap-2">
                            <div className="min-w-0">
                              <p className="font-medium">{to.city}</p>
                              <p className="text-muted-foreground">
                                {to.address}
                              </p>
                            </div>
                            <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted">
                              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                            </span>
                          </div>
                        </div>
                      </div>
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
  label,
  onAction,
}: {
  icon: React.ReactNode;
  label: string;
  onAction: () => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="h-9 w-9"
      aria-label={label}
      onClick={(e) => {
        // ważne: nie zamykamy/nie klikamy “tła” sheeta
        e.preventDefault();
        e.stopPropagation();
        onAction();
      }}
    >
      {icon}
    </Button>
  );
}
