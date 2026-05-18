"use client";

import * as React from "react";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
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
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { MapPin, MoreVertical, Truck, Eye, X, ChevronDown, CheckCircle2, Navigation, Circle } from "lucide-react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import OrderStatusBadge from "./order-status-badge";
import type { OrderDetailsDto, OrderListItem, OrderStatus } from "../types";
import { useTranslations, useLocale } from "next-intl";
import { Icons } from "@/components/icons";
import { useDeleteOrderMutation } from "../hooks/use-delete-order-mutation";
import { useOrderDetailsQuery } from "../hooks/use-order-details-query";
import { useDeleteOrderDocumentMutation } from "../hooks/use-delete-order-document-mutation";
import { useUploadOrderDocumentMutation } from "../hooks/use-upload-order-document-mutation";
import { useOrderApproachRouteQuery } from "../hooks/use-order-approach-route-query";
import { useOrderLocationQuery } from "../hooks/use-order-location-query";
import { Spinner } from "@/components/ui/spinner";
import { formatDatePL, formatTimeHM, formatTimeHMS } from "@/lib/format";
import { initials } from "@/lib/utils";
import { DriverActionButtons } from "./driver-action-buttons";
import { OrderDocumentUploadDialog } from "./order-document-upload";
import Image from "next/image";
import { Plus } from "lucide-react";
import EditOrderDialog from "./edit-order/edit-order-dialog";
import { EditRouteDialog } from "./edit-route-dialog";
import { TrackingHistoryList } from "./tracking-history-list";
import { HereStaticMap } from "./here-static-map";

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

  const orderId = selected?.id ?? "";
  const deleteDocument = useDeleteOrderDocumentMutation(orderId);
  const uploadDocument = useUploadOrderDocumentMutation();

  const [selectedImageUrl, setSelectedImageUrl] = React.useState<string | null>(
    null
  );

  const [editOpen, setEditOpen] = React.useState(false);
  const [routeEditOpen, setRouteEditOpen] = React.useState(false);
  const prefersReducedMotion = useReducedMotion();

  const {
    data: orderDetails,
    isPending,
    isError,
  } = useOrderDetailsQuery({
    id: orderId ?? "",
    enabled: open && !!orderId,
    status: (selected?.status ?? "PENDING") as OrderStatus,
  });
  const driverLocationQuery = useOrderLocationQuery({
    id: orderId,
    enabled: open && !!orderId,
  });
  const { data: driverLocation } = driverLocationQuery;
  const { data: approachRoute } = useOrderApproachRouteQuery({
    id: orderId,
    enabled: open && !!orderId,
  });
  const details: OrderDetailsDto | undefined = orderDetails as
    | OrderDetailsDto
    | undefined;
  const mapDriverLocation = driverLocation ?? approachRoute?.location ?? null;
  const routeMapLayoutId = orderId
    ? `order-route-map-${orderId}`
    : undefined;
  const sharedRouteMapLayoutId = prefersReducedMotion
    ? undefined
    : routeMapLayoutId;
  const routeMapTransition = prefersReducedMotion
    ? { duration: 0.01 }
    : { type: "spring" as const, stiffness: 300, damping: 35, mass: 0.9 };
  const routeEditorInitialMapData = React.useMemo(
    () =>
      details
        ? {
            routePoints: details.routePoints,
            polyline: details.routePlan?.polyline,
            approachPolyline: approachRoute?.route.polyline,
            driverLocation: mapDriverLocation,
          }
        : undefined,
    [
      approachRoute?.route.polyline,
      details,
      mapDriverLocation,
    ]
  );

  const orderNumber = orderDetails?.ztNumber ?? selected?.number ?? "#ZL-—";
  const orderStatus = (orderDetails?.status ??
    selected?.status ??
    "PENDING") as OrderStatus;

  const driverName = orderDetails
    ? `${orderDetails.driverFirstName ?? ""} ${orderDetails.driverLastName ?? ""
      }`.trim() || "—"
    : "—";
  const driverPhone = orderDetails?.driverPhone ?? null;
  const driverInitials = driverName !== "—" ? initials(driverName) : "—";

  const fromCountry = orderDetails?.fromCountry ?? "—";
  const fromAddress = orderDetails?.fromAddress ?? null;
  const toCountry = orderDetails?.toCountry ?? "—";
  const toAddress = orderDetails?.toAddress ?? null;

  const loadingDate = React.useMemo(() => {
    return orderDetails?.loadingDate
      ? new Date(orderDetails.loadingDate)
      : null;
  }, [orderDetails?.loadingDate]);

  const loadingTime = orderDetails?.loadingTime ?? null;

  // Format loading time: use loadingTime if available, otherwise extract time from loadingDate
  const formattedLoadingTime = React.useMemo(() => {
    if (loadingTime) {
      return loadingTime; // Already in HH:mm format
    }
    if (loadingDate) {
      return formatTimeHM(loadingDate, locale);
    }
    return "—";
  }, [loadingTime, loadingDate, locale]);

  const stats = [
    {
      label: t("stats.traveledDistance"),
      value: formatDistanceKm(mapDriverLocation?.traveledDistanceMeters ?? 0, locale),
    },
    {
      label: t("stats.distance"),
      value: orderDetails?.routePlan
        ? formatDistance(orderDetails.routePlan.distanceMeters, locale)
        : "—",
    },
    {
      label: t("stats.startTime"),
      value: formattedLoadingTime,
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
        const d = new Date(ev.createdAt);

        return {
          status: ev.newStatus!,
          eventType: ev.type,
          time: formatTimeHMS(d, locale),
          date: formatDatePL(d, locale),

          description: ev.newStatus === "PROBLEM" ? ev.description : null,
        };
      });
  }, [orderDetails?.events, locale]);


  const handleDelete = React.useCallback(async () => {
    if (!orderId || del.isPending) return;

    await del.mutateAsync(orderId);

    onOpenChange(false);
    onDelete?.();
  }, [orderId, del, onOpenChange, onDelete]);

  const handleDeleteDocument = React.useCallback(
    async (orderDocumentId: string) => {
      if (deleteDocument.isPending) return;
      await deleteDocument.mutateAsync(orderDocumentId);
    },
    [deleteDocument]
  );

  const handleViewDocument = React.useCallback((url: string) => {
    setSelectedImageUrl(url);
  }, []);

  const handleUploadDocument = React.useCallback(
    async (draft: { file: File; title: string }) => {
      if (!orderId || uploadDocument.isPending) return;
      await uploadDocument.mutateAsync({
        orderId,
        file: draft.file,
        title: draft.title,
      });
    },
    [orderId, uploadDocument]
  );

  const isImageDocument = React.useCallback(
    (doc: { mimeType: string; url: string }): boolean => {
      return doc.mimeType.startsWith("image/");
    },
    []
  );

  return (
    <LayoutGroup id={`order-route-editor-${orderId || "empty"}`}>
      {details ? (
        <EditOrderDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          orderId={orderId}
          initial={details}
        />
      ) : null}
      {details ? (
        <EditRouteDialog
          open={routeEditOpen}
          onOpenChange={setRouteEditOpen}
          orderId={orderId}
          mapLayoutId={sharedRouteMapLayoutId}
          initialMapData={routeEditorInitialMapData}
        />
      ) : null}

      <Dialog
        open={!!selectedImageUrl}
        onOpenChange={(open) => !open && setSelectedImageUrl(null)}
      >
        <DialogContent
          className="max-w-none! w-screen! h-screen! p-0 border-0! bg-black/95 translate-x-0! translate-y-0! top-0! left-0! rounded-none"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">
            {t("documents.actions.view")}
          </DialogTitle>
          {selectedImageUrl && (
            <div className="relative w-full h-full flex items-center justify-center">
              <Button
                variant="outline"
                size="icon"
                className="absolute top-4 right-4 z-10 h-10 w-10 rounded-md bg-black/50  text-white border border-white/40 cursor-pointer"
                onClick={() => setSelectedImageUrl(null)}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </Button>
              <Image
                src={selectedImageUrl}
                alt="Document preview"
                width={1920}
                height={1080}
                className="max-h-screen w-auto h-auto object-contain"
                unoptimized
                priority
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

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
                        <DropdownMenuItem
                          onClick={() => {
                            onEdit?.();
                            setEditOpen(true);
                          }}
                        >
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
                                emailAddress={null}
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
                            <Button
                              size="sm"
                              className="h-8 cursor-pointer"
                              onClick={() => setRouteEditOpen(true)}
                            >
                              <Icons.pencil className="mr-2 h-4 w-4" />
                              {t("route.edit")}
                            </Button>
                          </div>

                          {/* Map preview */}
                          <Card className="mt-3 py-0 overflow-hidden border shadow-none p">
                            <motion.div
                              layoutId={sharedRouteMapLayoutId}
                              transition={routeMapTransition}
                              className="relative aspect-4/3 w-full overflow-hidden bg-muted"
                              style={{ borderRadius: 8 }}
                            >
                              <HereStaticMap
                                routePoints={orderDetails?.routePoints ?? []}
                                polyline={orderDetails?.routePlan?.polyline}
                                approachPolyline={approachRoute?.route.polyline}
                                driverLocation={mapDriverLocation}
                                isUpdating={driverLocationQuery.isFetching}
                                isDriverLocationRefreshing={
                                  driverLocationQuery.isFetching
                                }
                                onDriverLocationRefresh={() => {
                                  void driverLocationQuery.refetch();
                                }}
                                showUiControls={false}
                              />
                            </motion.div>
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
                                <p className="text-sm font-semibold">
                                  {s.value}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Route points progress */}
                        <RoutePointsProgress
                          routePoints={orderDetails?.routePoints ?? []}
                          t={t}
                          locale={locale}
                        />

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
                                orderStatus === "COMPLETED" &&
                                "bg-green-500/20",
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
                                orderStatus === "COMPLETED" &&
                                "bg-green-500/20",
                                orderStatus === "PROBLEM" && "bg-destructive/20"
                              )}
                            >
                              <MapPin
                                className={cn(
                                  "h-4 w-4 transition-colors",
                                  orderStatus === "UNLOADING" &&
                                  "text-[#709470]",
                                  (orderStatus === "PENDING" ||
                                    orderStatus === "PAUSED" ||
                                    orderStatus === "LOADING" ||
                                    orderStatus === "ACCEPTED" ||
                                    orderStatus === "IN_PROGRESS") &&
                                  "text-[#EBE5D4]",
                                  orderStatus === "COMPLETED" &&
                                  "text-green-600",
                                  orderStatus === "PROBLEM" &&
                                  "text-destructive"
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
                          <TrackingHistoryList history={history} emptyText={t("tracking.empty")} />
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
                        {t("documents.error")}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {/* TODO:add translate */}
                        <div className="flex items-center justify-between my-2">
                          <h2 className="truncate text-lg font-semibold">
                            {t("documents.title")}
                          </h2>
                          {orderId && (
                            <OrderDocumentUploadDialog
                              trigger={
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="flex items-center gap-2 h-8"
                                  disabled={uploadDocument.isPending}
                                >
                                  {uploadDocument.isPending ? (
                                    <Spinner className="h-4 w-4" />
                                  ) : (
                                    <Plus className="h-4 w-4" />
                                  )}
                                  {t("documents.add")}
                                </Button>
                              }
                              onAdd={handleUploadDocument}
                            />
                          )}
                        </div>
                        {orderDetails && orderDetails.documents.length > 0 ? (
                          <div className="space-y-2">
                            {orderDetails.documents.map((doc) => {
                              const isImage = isImageDocument(doc);

                              return (
                                <Card
                                  key={doc.id}
                                  className="border shadow-none p-4"
                                >
                                  <div className="flex items-center gap-3">
                                    {isImage ? (
                                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border">
                                        <Image
                                          src={doc.url}
                                          alt={
                                            doc.title || doc.originalFilename
                                          }
                                          fill
                                          className="object-cover"
                                          unoptimized
                                        />
                                      </div>
                                    ) : (
                                      <Icons.file className="h-6 w-6 shrink-0 text-[#709470]" />
                                    )}
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-normal truncate">
                                        {doc.title || doc.originalFilename}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {formatDatePL(
                                          new Date(doc.createdAt),
                                          locale
                                        )}
                                      </p>
                                    </div>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 cursor-pointer"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <MoreVertical className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleViewDocument(doc.url);
                                          }}
                                          className="cursor-pointer"
                                        >
                                          <Eye className="mr-2 h-4 w-4" />
                                          {t("documents.actions.view")}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteDocument(doc.id);
                                          }}
                                          disabled={deleteDocument.isPending}
                                          className="text-destructive focus:text-destructive cursor-pointer"
                                        >
                                          {deleteDocument.isPending ? (
                                            <Spinner className="mr-2 h-4 w-4" />
                                          ) : (
                                            <Icons.trash className="mr-2 h-4 w-4 text-destructive focus:text-destructive" />
                                          )}
                                          {t("documents.actions.delete")}
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </Card>
                              );
                            })}
                          </div>
                        ) : (
                          <Card className="border shadow-none">
                            <div className="p-4 text-sm text-muted-foreground">
                              {t("documents.empty")}
                            </div>
                          </Card>
                        )}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </SheetHeader>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </LayoutGroup>
  );
}

function formatDistance(distanceMeters: number, locale: string): string {
  if (distanceMeters < 1000) {
    return `${Math.round(distanceMeters)} m`;
  }

  return `${new Intl.NumberFormat(locale, {
    maximumFractionDigits: distanceMeters >= 100_000 ? 0 : 1,
  }).format(distanceMeters / 1000)} km`;
}

function formatDistanceKm(distanceMeters: number, locale: string): string {
  return `${new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: distanceMeters >= 100_000 ? 0 : 1,
  }).format(distanceMeters / 1000)} km`;
}

function RoutePointsProgress({
  routePoints,
  t,
  locale,
}: {
  routePoints: { sequence: number; label: string | null; address: string | null; arrivedAt?: string | null }[];
  t: ReturnType<typeof useTranslations<"OrdersDetails">>;
  locale: string;
}) {
  const [open, setOpen] = React.useState(false);

  if (routePoints.length === 0) return null;

  const sorted = [...routePoints].sort((a, b) => a.sequence - b.sequence);
  const confirmedCount = sorted.filter((p) => p.arrivedAt != null).length;
  const nextIndex = confirmedCount < sorted.length ? confirmedCount : null;

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="mt-5">
      <CollapsibleTrigger asChild>
        <button className="flex w-full items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-4 py-3 text-left transition-colors hover:bg-muted/50">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">{t("route.points.title")}</span>
            <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">
              {confirmedCount} / {sorted.length}
              <span className="font-normal text-green-600">{t("route.points.confirmed")}</span>
            </span>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="mt-1 rounded-lg border border-border/60 bg-white px-4 py-3">
          {sorted.map((point, i) => {
            const isDone = i < confirmedCount;
            const isNext = i === nextIndex;
            const isLast = i === sorted.length - 1;
            const label = point.address ?? point.label ?? `Punkt ${point.sequence}`;

            return (
              <div key={point.sequence} className="flex gap-3">
                {/* dot + connector */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                      isDone && "border-0 bg-green-500",
                      isNext && "border-[1.5px] border-orange-400 bg-orange-50",
                      !isDone && !isNext && "border-[1.5px] border-gray-300 bg-gray-100"
                    )}
                  >
                    {isDone && <CheckCircle2 className="h-3 w-3 text-white" strokeWidth={3} />}
                    {isNext && <Navigation className="h-3 w-3 text-orange-400" />}
                  </div>
                  {!isLast && (
                    <div
                      className={cn(
                        "mt-0.5 w-0.5 flex-1",
                        isDone ? "bg-green-400" : "bg-gray-200"
                      )}
                      style={{ minHeight: 20 }}
                    />
                  )}
                </div>

                {/* text */}
                <div className={cn("min-w-0 pb-3", isLast && "pb-0")}>
                  {isNext && (
                    <p className="mb-0.5 text-[10px] font-semibold text-orange-500">
                      {t("route.points.next")}
                    </p>
                  )}
                  <p
                    className={cn(
                      "text-[13px] leading-snug",
                      isDone
                        ? "text-gray-400 line-through decoration-gray-400"
                        : isNext
                        ? "font-semibold text-gray-900"
                        : "text-gray-800"
                    )}
                  >
                    {label}
                  </p>
                  {isDone && point.arrivedAt && (
                    <p className="mt-0.5 text-[10px] text-green-600">
                      {t("route.points.arrivedAt")}{" "}
                      {new Intl.DateTimeFormat(locale, {
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(new Date(point.arrivedAt))}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
