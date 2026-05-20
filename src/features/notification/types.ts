export type NotificationType = string;

export type NotificationDto = {
  id: string;
  userId: string;
  type: NotificationType;
  data: Record<string, unknown>;
  createdAt: string; // ISO
  readAt: string | null; // ISO | null
};

export type Notification = NotificationDto;

export type NotificationItem = {
  id: string;
  type: NotificationType;
  data: Record<string, unknown>;
  dateLabel: string; // np. "11.10.2025 - 10:10"
  isUnread?: boolean;
};

export type NotificationListItem = {
  id: string;
  type: NotificationType;
  data: Record<string, unknown>;
  time: string; // "10:25:34"
  date: string; // "11.10.2025"
  isUnread?: boolean;
};

export type NotificationsPageResult = {
  items: NotificationListItem[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
};

export type NotificationsPageDto = {
  items: NotificationDto[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
};
