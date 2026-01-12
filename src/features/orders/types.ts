export type OrderStatus =
  | "PENDING"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "LOADING"
  | "UNLOADING"
  | "PAUSED"
  | "COMPLETED"
  | "PROBLEM";

export type OrderListItem = {
  id: string;
  number: string; // np. "#ZL-221235325"
  status: OrderStatus;
};
