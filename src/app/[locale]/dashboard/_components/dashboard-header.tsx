"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { usePathname } from "@/i18n/navigation";
import { UserNav } from "./user-nav";

type Props = {
  user: { id: string; email: string; role?: string };
};

function toTitle(segment: string) {
  return segment.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

export function SiteHeader({ user }: Props) {
  const pathname = usePathname();

  const parts = pathname.split("/").filter(Boolean);
  const tail = parts.slice(0);

  return (
    <header
      className={cn(
        "bg-background sticky top-0 z-30 flex h-[50px] shrink-0 items-center gap-2 border-b px-4 py-3"
      )}
    >
      <Breadcrumb>
        <BreadcrumbList>
          {tail.map((p, idx) => {
            const isLast = idx === tail.length - 1;
            const label = idx === 0 ? "Dashboard" : toTitle(p);

            return (
              <BreadcrumbItem key={`${p}-${idx}`}>
                {idx > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <span className="hidden md:inline text-muted-foreground">
                    {label}
                  </span>
                )}
              </BreadcrumbItem>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-2">
        <Separator orientation="vertical" className="h-5" />
        <UserNav user={user} />
      </div>
    </header>
  );
}
