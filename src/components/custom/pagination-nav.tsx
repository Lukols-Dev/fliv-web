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

function clampPage(page: number, totalPages: number) {
  if (!Number.isFinite(page) || page < 1) return 1;
  if (!Number.isFinite(totalPages) || totalPages < 1) return 1;
  return Math.min(page, totalPages);
}

// Zwraca np: [1, "ellipsis", 4, 5, 6, "ellipsis", 20]
function buildPageTokens(page: number, totalPages: number): PageToken[] {
  if (totalPages <= 1) return [1];

  const tokens: PageToken[] = [];
  const siblings = 1; // ile stron po bokach bieżącej
  const left = Math.max(2, page - siblings);
  const right = Math.min(totalPages - 1, page + siblings);

  // zawsze 1
  tokens.push(1);

  // lewy "..." jeśli jest luka
  if (left > 2) tokens.push("ellipsis");

  // środek
  for (let p = left; p <= right; p++) tokens.push(p);

  // prawy "..." jeśli jest luka
  if (right < totalPages - 1) tokens.push("ellipsis");

  // zawsze ostatnia
  tokens.push(totalPages);

  return tokens;
}

type Props = {
  page: number;
  totalPages: number;
  getHref: (page: number) => string;
  className?: string;
};

export function PaginationNav({ page, totalPages, getHref, className }: Props) {
  const t = useTranslations("Pagination");

  const safeTotalPages =
    Number.isFinite(totalPages) && totalPages > 0 ? totalPages : 1;

  const safePage = clampPage(page, safeTotalPages);

  const prevDisabled = safePage <= 1;
  const nextDisabled = safePage >= safeTotalPages;

  const tokens = React.useMemo(
    () => buildPageTokens(safePage, safeTotalPages),
    [safePage, safeTotalPages]
  );

  const prevHref = getHref(Math.max(1, safePage - 1));
  const nextHref = getHref(Math.min(safeTotalPages, safePage + 1));

  return (
    <Pagination className={cn("mt-8", className)}>
      <PaginationContent>
        <PaginationItem>
          <PaginationLink
            href={prevHref}
            aria-label={t("prev")}
            aria-disabled={prevDisabled}
            tabIndex={prevDisabled ? -1 : 0}
            size="default"
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
            href={nextHref}
            aria-label={t("next")}
            aria-disabled={nextDisabled}
            tabIndex={nextDisabled ? -1 : 0}
            size="default"
            className={cn(nextDisabled && "pointer-events-none opacity-50")}
          >
            {t("next")}
            <ChevronRight className="ml-1 h-4 w-4" />
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
