export const createGoogleMapsSearchUrl = (restaurantName: string): string => {
  if (!restaurantName) return '';
  
  const encodedName = restaurantName.trim().replace(/\s+/g, '+');
  return `https://www.google.com/maps/search/${encodedName}`;
};