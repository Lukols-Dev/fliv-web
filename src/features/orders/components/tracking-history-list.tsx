"use client";

import { Card } from "@/components/ui/card";
import OrderStatusBadge from "./order-status-badge";
import { TrackingHistoryRow } from "../types";
import OrderEventTypeBadge from "./order-event-type-badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type Props = {
    history: TrackingHistoryRow[];
    emptyText: string;
};

export function TrackingHistoryList({ history, emptyText }: Props) {
    if (history.length === 0) {
        return (
            <Card className="mt-3 border shadow-none">
                <div className="p-4 text-sm text-muted-foreground">{emptyText}</div>
            </Card>
        );
    }

    return (
        <div className="mt-3 space-y-2">
            {history.map((ev, i) => (
                <div
                    key={`${ev.status}-${i}`}
                    className="flex items-center justify-between gap-3"
                >
                    <div className="flex min-w-0 items-center gap-2">
                        <OrderStatusBadge status={ev.status} />
                        <OrderEventTypeBadge type={ev.eventType} />
                        {ev.status === "PROBLEM" && ev.description ? (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="min-w-0 truncate text-xs text-[#709470]">
                                        {ev.description}
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <span className="text-xs text-black">
                                        {ev.description}
                                    </span>
                                </TooltipContent>
                            </Tooltip>

                        ) : null}
                    </div>

                    <div className="shrink-0 text-right text-[11px] text-muted-foreground">
                        <div>{ev.time}</div>
                        <div>{ev.date}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
