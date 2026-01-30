export type AnnouncementCategory = 'general' | 'urgent' | 'event' | 'maintenance';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: AnnouncementCategory;
  authorId: string;
  authorName: string;
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
}
