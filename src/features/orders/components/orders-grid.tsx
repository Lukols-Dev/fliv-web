import type { OrderListItem } from "../types";
import OrderCard from "./order-card";

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
  return (
    <section
      aria-label="Orders grid"
      className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
    >
      {items.map((item: OrderListItem) => (
        <OrderCard
          key={item.id}
          onClick={() => onOpenDetails(item.id)}
          isActive={item.id === selectedId}
          orderNumber={item.number}
          createdAt="10.09.2025"
          status={item.status}
          from={{
            city: "Piaseczno",
            country: "Polska",
            addressLine: "Jana Pawła II 66, 05-500",
          }}
          to={{
            city: "Operngasse 3",
            country: "Austria",
            addressLine: "Elisabethstraße 1010, Wien",
          }}
          driver={{ name: "Jan Nowak", roleLabel: "Driver", initials: "JN" }}
        />
      ))}
    </section>
  );
}
