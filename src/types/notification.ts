export type NotificationType = 
  | 'event_reminder'
  | 'event_cancelled'
  | 'new_event'
  | 'announcement'
  | 'feedback_received'
  | 'account_status';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  eventId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationPreferences {
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  eventReminders: boolean;
  newEvents: boolean;
  announcements: boolean;
}
