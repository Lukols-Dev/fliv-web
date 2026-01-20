import type { NotificationDto, NotificationListItem } from "../types";
import { formatDatePL, formatTimeHMS } from "@/lib/format";

export function mapNotificationDtoToListItem(
  dto: NotificationDto,
  locale: string
): NotificationListItem {
  const d = new Date(dto.createdAt);
  return {
    id: dto.id,
    type: dto.type,
    data: dto.data ?? {},
    time: formatTimeHMS(d, locale),
    date: formatDatePL(d, locale),
    isUnread: !dto.readAt,
  };
}
