export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  category: EventCategory;
  capacity: number;
  registered: number;
  imageUrl: string;
  organizer: string;
  status: EventStatus;
  qrCode?: string;
}

export type EventCategory = 
  | 'academic'
  | 'sports'
  | 'cultural'
  | 'workshop'
  | 'seminar'
  | 'competition'
  | 'social';

export type EventStatus = 
  | 'upcoming'
  | 'ongoing'
  | 'completed'
  | 'cancelled';

export interface Attendance {
  id: string;
  eventId: string;
  studentId: string;
  studentName: string;
  checkedInAt: string;
}
