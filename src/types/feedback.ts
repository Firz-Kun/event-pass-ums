export interface Feedback {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5 stars
  comment: string;
  isAnonymous: boolean;
  createdAt: string;
  isReported: boolean;
  isModerated: boolean;
}

export interface FeedbackStats {
  eventId: string;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}
