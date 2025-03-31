export type Cuisine = 'turkish' | 'indonesian' | 'korean' | 'japanese';
export type DietaryPreference = 'halal' | 'vegetarian' | 'none';
export type Persona = 'drerrie' | 'tourist' | 'foodie';
export type Location = 'Amsterdam Oost' | 'Amsterdam West' | 'Amsterdam Zuid' | 'Amsterdam Noord' | 'Amsterdam Centrum';

export interface Restaurant {
  id: string;
  name: string;
  cuisine: Cuisine;
  dietary: DietaryPreference[];
  location: Location;
  ratingScore: number;
  price: number; // 1-5 scale where 1 is cheapest
  authenticity: number; // 1-5 scale where 5 is most authentic
  atmosphere: number; // 1-5 scale where 5 is best atmosphere
  personaScores: {
    drerrie: number; // 1-5 scale
    tourist: number; // 1-5 scale
    foodie: number; // 1-5 scale
  };
  imageUrl: string;
  description: string;
}

export const restaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Dürümcü',
    cuisine: 'turkish',
    dietary: ['halal'],
    location: 'Amsterdam Oost',
    ratingScore: 4.7,
    price: 2,
    authenticity: 5,
    atmosphere: 3,
    personaScores: {
      drerrie: 5,
      tourist: 3,
      foodie: 4
    },
    imageUrl: 'https://source.unsplash.com/random/900×700/?turkish-food',
    description: 'Authentic Turkish grill serving the best döner and dürüm in Amsterdam Oost. Popular with locals and always busy in evenings.'
  },
  {
    id: '2',
    name: 'Istanbul Döner',
    cuisine: 'turkish',
    dietary: ['halal'],
    location: 'Amsterdam West',
    ratingScore: 4.5,
    price: 1,
    authenticity: 4,
    atmosphere: 3,
    personaScores: {
      drerrie: 5,
      tourist: 2,
      foodie: 3
    },
    imageUrl: 'https://source.unsplash.com/random/900×700/?doner',
    description: 'Late-night spot serving authentic Turkish döner and kebabs. No-frills place with amazing value for money.'
  },
  {
    id: '3',
    name: 'Warung Spang Makandra',
    cuisine: 'indonesian',
    dietary: ['none'],
    location: 'Amsterdam Zuid',
    ratingScore: 4.8,
    price: 3,
    authenticity: 5,
    atmosphere: 4,
    personaScores: {
      drerrie: 4,
      tourist: 3,
      foodie: 5
    },
    imageUrl: 'https://source.unsplash.com/random/900×700/?indonesian-food',
    description: 'One of the most authentic Surinamese-Javanese restaurants in Amsterdam. This small family restaurant serves generous portions.'
  },
  {
    id: '4',
    name: 'SORA',
    cuisine: 'japanese',
    dietary: ['vegetarian'],
    location: 'Amsterdam Centrum',
    ratingScore: 4.6,
    price: 4,
    authenticity: 4,
    atmosphere: 5,
    personaScores: {
      drerrie: 3,
      tourist: 5,
      foodie: 5
    },
    imageUrl: 'https://source.unsplash.com/random/900×700/?sushi',
    description: 'High-end Japanese experience with exceptional omakase menu. Beautiful interior and excellent service.'
  },
  {
    id: '5',
    name: 'Seoul Food',
    cuisine: 'korean',
    dietary: ['none'],
    location: 'Amsterdam Oost',
    ratingScore: 4.5,
    price: 3,
    authenticity: 4,
    atmosphere: 4,
    personaScores: {
      drerrie: 4,
      tourist: 4,
      foodie: 5
    },
    imageUrl: 'https://source.unsplash.com/random/900×700/?korean-bbq',
    description: 'Authentic Korean BBQ where you grill your own meats at the table. Lively atmosphere and great for groups.'
  },
  {
    id: '6',
    name: 'Kantjil & de Tijger',
    cuisine: 'indonesian',
    dietary: ['vegetarian'],
    location: 'Amsterdam Centrum',
    ratingScore: 4.3,
    price: 4,
    authenticity: 3,
    atmosphere: 5,
    personaScores: {
      drerrie: 3,
      tourist: 5,
      foodie: 4
    },
    imageUrl: 'https://source.unsplash.com/random/900×700/?indonesian-rijsttafel',
    description: 'Popular Indonesian restaurant serving traditional rijsttafel. Prime location makes it popular with tourists.'
  },
  {
    id: '7',
    name: 'Takumi Ramen',
    cuisine: 'japanese',
    dietary: ['none'],
    location: 'Amsterdam West',
    ratingScore: 4.7,
    price: 2,
    authenticity: 5,
    atmosphere: 4,
    personaScores: {
      drerrie: 5,
      tourist: 3,
      foodie: 5
    },
    imageUrl: 'https://source.unsplash.com/random/900×700/?ramen',
    description: 'Best ramen in Amsterdam with rich broths and handmade noodles. Be prepared to queue during peak hours.'
  },
  {
    id: '8',
    name: 'Köşk Kebab',
    cuisine: 'turkish',
    dietary: ['halal'],
    location: 'Amsterdam Noord',
    ratingScore: 4.6,
    price: 2,
    authenticity: 5,
    atmosphere: 4,
    personaScores: {
      drerrie: 5,
      tourist: 2,
      foodie: 4
    },
    imageUrl: 'https://source.unsplash.com/random/900×700/?kebab',
    description: 'Family-run Turkish grill with charcoal-cooked meats and fresh bread. Hidden gem in Noord.'
  },
  {
    id: '9',
    name: 'Miss Korea BBQ',
    cuisine: 'korean',
    dietary: ['none'],
    location: 'Amsterdam Centrum',
    ratingScore: 4.5,
    price: 4,
    authenticity: 4,
    atmosphere: 5,
    personaScores: {
      drerrie: 3,
      tourist: 5,
      foodie: 4
    },
    imageUrl: 'https://source.unsplash.com/random/900×700/?korean-food',
    description: 'Upscale Korean BBQ restaurant with premium cuts of meat and private dining spaces.'
  },
  {
    id: '10',
    name: 'Yamazato',
    cuisine: 'japanese',
    dietary: ['none'],
    location: 'Amsterdam Zuid',
    ratingScore: 4.9,
    price: 5,
    authenticity: 5,
    atmosphere: 5,
    personaScores: {
      drerrie: 2,
      tourist: 4,
      foodie: 5
    },
    imageUrl: 'https://source.unsplash.com/random/900×700/?japanese-kaiseki',
    description: 'Michelin-starred Japanese restaurant in Hotel Okura. Traditional kaiseki cuisine with impeccable service.'
  },
  {
    id: '11',
    name: 'Toko B&B',
    cuisine: 'indonesian',
    dietary: ['none'],
    location: 'Amsterdam West',
    ratingScore: 4.6,
    price: 2,
    authenticity: 5,
    atmosphere: 3,
    personaScores: {
      drerrie: 5,
      tourist: 2,
      foodie: 5
    },
    imageUrl: 'https://source.unsplash.com/random/900×700/?indonesian-takeaway',
    description: 'Small takeaway joint with the best Indonesian food in town. Local favorite with amazing satay and rendang.'
  },
  {
    id: '12',
    name: 'Halal Fried Chicken',
    cuisine: 'turkish',
    dietary: ['halal'],
    location: 'Amsterdam Oost',
    ratingScore: 4.3,
    price: 1,
    authenticity: 3,
    atmosphere: 2,
    personaScores: {
      drerrie: 5,
      tourist: 1,
      foodie: 2
    },
    imageUrl: 'https://source.unsplash.com/random/900×700/?fried-chicken',
    description: 'Late-night spot serving crispy halal fried chicken and Turkish pizza. Popular with young locals.'
  }
];

export function getFilteredRestaurants(
  persona?: Persona,
  cuisine?: Cuisine,
  dietary?: DietaryPreference,
  location?: Location
): Restaurant[] {
  let filteredRestaurants = [...restaurants];

  if (cuisine) {
    filteredRestaurants = filteredRestaurants.filter(restaurant => restaurant.cuisine === cuisine);
  }

  if (dietary && dietary !== 'none') {
    filteredRestaurants = filteredRestaurants.filter(restaurant => restaurant.dietary.includes(dietary));
  }

  if (location) {
    filteredRestaurants = filteredRestaurants.filter(restaurant => restaurant.location === location);
  }

  // Apply persona-based scoring
  if (persona) {
    filteredRestaurants.sort((a, b) => {
      // Primary sort by persona score
      const personaScoreDiff = b.personaScores[persona] - a.personaScores[persona];
      if (personaScoreDiff !== 0) return personaScoreDiff;
      
      // Secondary sort by rating
      return b.ratingScore - a.ratingScore;
    });
  } else {
    // Default sort by rating if no persona selected
    filteredRestaurants.sort((a, b) => b.ratingScore - a.ratingScore);
  }

  return filteredRestaurants;
} 