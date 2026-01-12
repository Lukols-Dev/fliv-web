import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Props = {
  onClick: () => void;
  isActive?: boolean;
};

export default function OrderCard({ onClick, isActive = false }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left outline-none cursor-pointer"
      aria-label="Open order details"
    >
      <Card
        className={cn(
          "h-[220px] rounded-xl border transition-all duration-200 hover:border-[#F2542F]/70 hover:bg-muted/30 hover:shadow-lg hover:shadow-[#F2542F]/30 hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          isActive
            ? "border-[#F2542F]/70 shadow-lg shadow-[#F2542F]/30"
            : "border shadow-none"
        )}
      />
    </button>
  );
}
