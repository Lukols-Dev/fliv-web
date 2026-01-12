import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Plus } from "lucide-react";

type Props = {
  title: string;
  ctaLabel: string;
  ctaHref: string;
};

export default function OrdersPageHeader({ title, ctaLabel, ctaHref }: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      </div>

      <Button asChild>
        <div className="inline-flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {ctaLabel}
        </div>
      </Button>
    </div>
  );
}
