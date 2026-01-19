import type { NotificationDto, NotificationListItem } from "../types";
import { formatDatePL, formatTimeHMS } from "@/lib/format";

export function mapNotificationDtoToListItem(
  dto: NotificationDto,
  locale: string
): NotificationListItem {
  const d = new Date(dto.createdAt);
  return {
    id: dto.id,
    title: dto.message,
    time: formatTimeHMS(d, locale),
    date: formatDatePL(d, locale),
    isUnread: !dto.readAt,
  };
}
