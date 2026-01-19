"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";

type PageToken = number | "ellipsis";

function buildPageTokens(page: number, hasNext: boolean): PageToken[] {
  const tokens: PageToken[] = [1];

  if (page === 1) {
    // On page 1, show: 1, 2 (if hasNext)
    if (hasNext) {
      tokens.push(2);
    }
  } else if (page === 2) {
    // On page 2, show: 1, 2, 3 (if hasNext)
    tokens.push(2);
    if (hasNext) {
      tokens.push(3);
    }
  } else {
    // On page 3+, show: 1, ..., page-1, page, page+1 (if hasNext)
    if (page > 3) {
      tokens.push("ellipsis");
    }
    tokens.push(page - 1);
    tokens.push(page);
    if (hasNext) {
      tokens.push(page + 1);
    }
  }

  return tokens;
}

type Props = {
  page: number;
  hasNext: boolean;
  getHref: (page: number) => string;
  className?: string;
};

export function PaginationNav({ page, hasNext, getHref, className }: Props) {
  const t = useTranslations("Pagination");

  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const prevDisabled = safePage <= 1;
  const nextDisabled = !hasNext;

  const tokens = React.useMemo(
    () => buildPageTokens(safePage, hasNext),
    [safePage, hasNext]
  );

  return (
    <Pagination className={cn("mt-8", className)}>
      <PaginationContent>
        <PaginationItem>
          <PaginationLink
            href={getHref(Math.max(1, safePage - 1))}
            aria-label={t("prev")}
            aria-disabled={prevDisabled}
            size="default"
            tabIndex={prevDisabled ? -1 : 0}
            className={cn(prevDisabled && "pointer-events-none opacity-50")}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            {t("prev")}
          </PaginationLink>

        </PaginationItem>

        {tokens.map((tok, idx) =>
          tok === "ellipsis" ? (
            <PaginationItem key={`e-${idx}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={tok}>
              <PaginationLink href={getHref(tok)} isActive={tok === safePage}>
                {tok}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationLink
            href={getHref(safePage + 1)}
            aria-label={t("next")}
            aria-disabled={nextDisabled}
            tabIndex={nextDisabled ? -1 : 0}
            className={cn(nextDisabled && "pointer-events-none opacity-50")}
            size="default"
          >
            {t("next")}
            <ChevronRight className="ml-1 h-4 w-4" />
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
