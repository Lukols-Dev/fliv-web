import type { NotificationListItem } from "../types";
import { NotificationEmpty } from "./notification-empty";
import { NotificationRow } from "./notification-row";

type Props = {
  items: NotificationListItem[];
};

export function NotificationsList({ items }: Props) {
  if (items.length === 0) {
    return <NotificationEmpty />;
  }

  return (
    <div className="w-full max-w-4xl space-y-3">
      {items.map((item) => (
        <NotificationRow key={item.id} item={item} />
      ))}
    </div>
  );
}
