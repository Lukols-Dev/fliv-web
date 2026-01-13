import CreateOrderButton from "./create-order/create-order-dialog-btn";

type Props = {
  title: string;
};

export default function OrdersPageHeader({ title }: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      </div>

      <CreateOrderButton />
    </div>
  );
}
