// Helper functions for event categories
// (No mock data - just utility functions)

export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    academic: 'bg-blue-100 text-blue-800',
    sports: 'bg-green-100 text-green-800',
    cultural: 'bg-purple-100 text-purple-800',
    workshop: 'bg-orange-100 text-orange-800',
    seminar: 'bg-teal-100 text-teal-800',
    competition: 'bg-red-100 text-red-800',
    social: 'bg-pink-100 text-pink-800',
  };
  return colors[category] || 'bg-gray-100 text-gray-800';
};

export const getCategoryLabel = (category: string): string => {
  return category.charAt(0).toUpperCase() + category.slice(1);
};