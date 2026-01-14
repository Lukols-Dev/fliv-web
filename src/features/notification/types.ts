export type NotificationType = string;

export type NotificationDto = {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  createdAt: string; // ISO
  readAt: string | null; // ISO | null
};

export type Notification = NotificationDto;

export type NotificationItem = {
  id: string;
  title: string;
  dateLabel: string; // np. "11.10.2025 - 10:10"
  isUnread?: boolean;
};

export type NotificationListItem = {
  id: string;
  title: string;
  time: string; // "10:25:34"
  date: string; // "11.10.2025"
  isUnread?: boolean;
};
