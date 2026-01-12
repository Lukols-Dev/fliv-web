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
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {items.map((item) => (
        <OrderCard
          key={item.id}
          onClick={() => onOpenDetails(item.id)}
          isActive={selectedId === item.id}
        />
      ))}
    </section>
  );
}
