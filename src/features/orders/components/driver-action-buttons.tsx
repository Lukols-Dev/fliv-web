"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Phone, MessageSquare } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type Props = {
  emailAddress: string | null;
  phoneNumber: string | null;
  className?: string;
  buttonClassName?: string;
};

export function DriverActionButtons({ emailAddress, phoneNumber }: Props) {
  const t = useTranslations("OrdersDetails.driver");

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild disabled={!phoneNumber}>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={cn(
              "h-9 w-9 rounded-lg border-muted-foreground/20 cursor-pointer",
              !phoneNumber && "cursor-not-allowed"
            )}
            aria-label={t("call")}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Phone className="h-4 w-4 text-[#709470]" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-2"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <p className="text-sm">{phoneNumber}</p>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild disabled={!emailAddress}>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={cn(
              "h-9 w-9 rounded-lg border-muted-foreground/20 cursor-pointer",
              !emailAddress && "cursor-not-allowed"
            )}
            aria-label={t("message")}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <MessageSquare className="h-4 w-4 text-[#709470]" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-2"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <p className="text-sm">{t("message")}</p>
        </PopoverContent>
      </Popover>
    </div>
  );
}
