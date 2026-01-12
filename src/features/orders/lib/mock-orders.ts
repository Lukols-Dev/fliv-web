import type { OrderListItem, OrderStatus } from "../types";

const STATUSES: readonly OrderStatus[] = [
  "in_progress",
  "waiting",
  "done",
  "issue",
] as const;

export function mockOrders(count = 12): OrderListItem[] {
  return Array.from({ length: count }).map((_, i) => {
    const n = 221235325 + i;
    return {
      id: String(n),
      number: `#ZL-${n}`,
      status: STATUSES[i % STATUSES.length],
    };
  });
}
