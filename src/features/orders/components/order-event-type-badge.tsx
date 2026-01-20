"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import type { OrderEventType } from "../types";

type Props = {
    type: OrderEventType;
    className?: string;
    size?: "sm" | "md" | "lg";
};

const EVENT_UI: Record<OrderEventType, { className: string; translationKey: OrderEventType }> = {
    STATUS_CHANGED: {
        className: "border border-[#EBE5D4]/60 bg-transparent text-[#6B6B6B]",
        translationKey: "STATUS_CHANGED",
    },

    INCIDENT_DETOUR: {
        className: "border border-[#709470] bg-transparent text-[#709470]",
        translationKey: "INCIDENT_DETOUR",
    },
    INCIDENT_DELAY: {
        className: "border border-[#709470] bg-transparent text-[#709470]",
        translationKey: "INCIDENT_DELAY",
    },
    INCIDENT_ACCIDENT: {
        className: "border border-[#709470] bg-transparent text-[#709470]",
        translationKey: "INCIDENT_ACCIDENT",
    },

    ROUTE_PAUSED: {
        className: "border border-[#EBE5D4]/60 bg-transparent text-[#6B6B6B]",
        translationKey: "ROUTE_PAUSED",
    },
    ROUTE_RESUMED: {
        className: "border border-[#709470]/40 bg-[#709470]/15 text-[#709470]",
        translationKey: "ROUTE_RESUMED",
    },
    ROUTE_FINISHED: {
        className: "border border-[#709470]/40 bg-[#709470]/15 text-[#709470]",
        translationKey: "ROUTE_FINISHED",
    },

    PROBLEM_REPORTED: {
        className: "border border-destructive/40 bg-destructive/15 text-destructive",
        translationKey: "PROBLEM_REPORTED",
    },

    ORDER_ASSIGNED: {
        className: "border border-[#709470]/40 bg-[#709470]/15 text-[#709470]",
        translationKey: "ORDER_ASSIGNED",
    },
    ORDER_COMPLETED: {
        className: "border border-[#709470]/40 bg-[#709470]/15 text-[#709470]",
        translationKey: "ORDER_COMPLETED",
    },
};

export default function OrderEventTypeBadge({ type, className, size = "sm" }: Props) {
    const t = useTranslations("OrderEventType");

    if (type === "STATUS_CHANGED" || type === "ORDER_ASSIGNED" || type === "PROBLEM_REPORTED") return null;
    const ui = EVENT_UI[type];


    return (
        <Badge
            variant="outline"
            className={cn(
                "whitespace-nowrap font-medium",
                ui.className,
                size === "lg"
                    ? "px-4 py-2 text-sm"
                    : size === "md"
                        ? "px-2.5 py-1 text-xs"
                        : "px-2.5 py-1 text-xs",
                className
            )}
        >
            {t(ui.translationKey)}
        </Badge>
    );
}
