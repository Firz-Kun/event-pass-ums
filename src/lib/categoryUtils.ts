// Category utility functions for events

export type EventCategory = 
  | 'academic' 
  | 'sports' 
  | 'cultural' 
  | 'workshop' 
  | 'seminar' 
  | 'competition'
  | 'social'
  | 'career';

export function getCategoryLabel(category: EventCategory): string {
  const labels: Record<EventCategory, string> = {
    academic: 'Academic',
    sports: 'Sports',
    cultural: 'Cultural',
    workshop: 'Workshop',
    seminar: 'Seminar',
    competition: 'Competition',
    social: 'Social',
    career: 'Career',
  };
  
  return labels[category] || category;
}

export function getCategoryColor(category: EventCategory): string {
  const colors: Record<EventCategory, string> = {
    academic: 'bg-blue-100 text-blue-800 border-blue-200',
    sports: 'bg-green-100 text-green-800 border-green-200',
    cultural: 'bg-purple-100 text-purple-800 border-purple-200',
    workshop: 'bg-orange-100 text-orange-800 border-orange-200',
    seminar: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    competition: 'bg-red-100 text-red-800 border-red-200',
    social: 'bg-pink-100 text-pink-800 border-pink-200',
    career: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  };
  
  return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
}

// You can add more category-related utilities here as needed
export const eventCategories: EventCategory[] = [
  'academic',
  'sports',
  'cultural',
  'workshop',
  'seminar',
  'competition',
  'social',
  'career',
];