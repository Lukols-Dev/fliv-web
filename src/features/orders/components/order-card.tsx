import { Card } from "@/components/ui/card";

type Props = {
  onClick: () => void;
};

export default function OrderCard({ onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left outline-none"
      aria-label="Open order details"
    >
      <Card className="h-[220px] rounded-xl border shadow-none transition-colors hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
    </button>
  );
}
