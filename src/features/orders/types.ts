export type OrderStatus = "in_progress" | "waiting" | "done" | "issue";

export type OrderListItem = {
  id: string;
  number: string; // np. "#ZL-221235325"
  status: OrderStatus;
};
