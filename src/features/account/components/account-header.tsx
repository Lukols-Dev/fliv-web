import type { ReactNode } from "react";

type Props = {
  title: string;
  actions?: ReactNode;
};

export function AccountHeader({ title, actions }: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>

      {actions ? (
        <div className="flex items-center gap-3">{actions}</div>
      ) : null}
    </div>
  );
}
