import type { Cuisine, DietaryPreference, Location, Persona } from "../data/restaurants";

export function generateSentence(
  persona: Persona | undefined,
  cuisine: Cuisine | undefined,
  dietary: DietaryPreference | undefined,
  location: Location | undefined
): string {
  const personaText = persona || '______';
  const cuisineText = cuisine || '______';
  const dietaryText = dietary && dietary !== 'none' ? dietary : '';
  const locationText = location || '______';
  
  // Add spaces and connecting words
  const dietaryWithSpace = dietaryText ? `${dietaryText} ` : '';
  
  return `${personaText} eats ${cuisineText} ${dietaryWithSpace}food in ${locationText}`;
}

// Get appropriate CSS class based on selected value type
export function getColorClass(type: 'persona' | 'cuisine' | 'dietary' | 'location', value: string | undefined): string {
  if (!value) return 'text-gray-400'; // Default for empty values
  
  switch (type) {
    case 'persona':
      switch (value) {
        case 'drerrie': return 'text-drerrie';
        case 'tourist': return 'text-tourist';
        case 'foodie': return 'text-foodie';
        default: return 'text-gray-400';
      }
    case 'cuisine':
      switch (value) {
        case 'turkish': return 'text-turkish';
        case 'indonesian': return 'text-indonesian';
        case 'korean': return 'text-korean';
        case 'japanese': return 'text-japanese';
        default: return 'text-gray-400';
      }
    case 'dietary':
      switch (value) {
        case 'halal': return 'text-halal';
        case 'vegetarian': return 'text-vegetarian';
        default: return 'text-gray-400';
      }
    case 'location':
      return 'text-primary';
    default:
      return 'text-gray-400';
  }
} 