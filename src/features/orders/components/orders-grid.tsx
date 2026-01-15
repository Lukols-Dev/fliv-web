import { useLocale } from "next-intl";
import type { OrderListItem } from "../types";
import OrderCard from "./order-card";
import { initials } from "@/lib/utils";

type Props = {
  items: OrderListItem[];
  onOpenDetails: (id: string) => void;
  selectedId?: string | null;
};

export default function OrdersGrid({
  items,
  onOpenDetails,
  selectedId,
}: Props) {
  const locale = useLocale();

  return (
    <section
      aria-label="Orders grid"
      className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
    >
      {items.map((item) => {
        const createdAt = item.loadingDate
          ? new Intl.DateTimeFormat(locale, {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            }).format(new Date(item.loadingDate))
          : "-";

        const driverName = item.driverName?.trim() || "-";

        return (
          <OrderCard
            key={item.id}
            onClick={() => onOpenDetails(item.id)}
            isActive={item.id === selectedId}
            orderNumber={item.number}
            createdAt={createdAt}
            status={item.status}
            from={{
              city: "—",
              country: "—",
              addressLine: "—",
            }}
            to={{
              city: "—",
              country: "—",
              addressLine: "—",
            }}
            driver={{
              name: driverName,
              roleLabel: "Driver",
              initials: initials(driverName),
            }}
          />
        );
      })}
    </section>
  );
}
