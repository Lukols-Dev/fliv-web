"use client";

import * as React from "react";
import type { OrderListItem } from "../types";
import OrdersGrid from "./orders-grid";
import OrderDetailsSheet from "./order-details-sheet";

type Props = {
  items: OrderListItem[];
  i18n: {
    detailsTitle: string;
    detailsSubtitle: string;
    close: string;
  };
};

export default function OrdersView({ items, i18n }: Props) {
  const [open, setOpen] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const selected = React.useMemo(
    () => items.find((x) => x.id === selectedId) ?? null,
    [items, selectedId]
  );

  const onOpenDetails = React.useCallback((id: string) => {
    setSelectedId(id);
    setOpen(true);
  }, []);

  const onOpenChange = React.useCallback((next: boolean) => {
    setOpen(next);
    if (!next) setSelectedId(null);
  }, []);

  return (
    <>
      <OrdersGrid
        items={items}
        onOpenDetails={onOpenDetails}
        selectedId={selectedId}
      />

      <OrderDetailsSheet
        open={open}
        onOpenChange={onOpenChange}
        selected={selected}
        i18n={{
          title: i18n.detailsTitle,
          subtitle: i18n.detailsSubtitle,
          close: i18n.close,
        }}
      />
    </>
  );
}
