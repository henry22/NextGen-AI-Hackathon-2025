export interface Reward {
  id: string;
  name: string;
  description: string;
  cost: number;
  image: string;
  partner: string;
}

export const rewardsStore: Reward[] = [
  {
    id: "jbhifi-20",
    name: "JB Hi-Fi Gift Card",
    description: "AU$20 JB Hi-Fi voucher for tech, games, and music",
    cost: 200,
    image: "🎮",
    partner: "JB Hi-Fi",
  },
  {
    id: "woolworths-25",
    name: "Woolworths Gift Card",
    description: "AU$25 Woolworths voucher for groceries and snacks",
    cost: 250,
    image: "🛒",
    partner: "Woolworths",
  },
  {
    id: "spotify-premium",
    name: "Spotify Premium",
    description: "3 months of Spotify Premium subscription",
    cost: 300,
    image: "🎵",
    partner: "Spotify",
  },
  {
    id: "event-cinemas",
    name: "Event Cinemas Tickets",
    description: "2 movie tickets for the latest films",
    cost: 400,
    image: "🎬",
    partner: "Event Cinemas",
  },
  {
    id: "guzman-gomez",
    name: "Guzman y Gomez Meal",
    description: "Free burrito or bowl at GYG",
    cost: 150,
    image: "🌯",
    partner: "Guzman y Gomez",
  },
  {
    id: "cotton-on-30",
    name: "Cotton On Voucher",
    description: "AU$30 Cotton On gift card for trendy fashion",
    cost: 350,
    image: "👕",
    partner: "Cotton On",
  },
  {
    id: "boost-juice",
    name: "Boost Juice Cards",
    description: "5 free smoothies at Boost Juice",
    cost: 180,
    image: "🥤",
    partner: "Boost Juice",
  },
  {
    id: "rebel-sport-40",
    name: "Rebel Sport Voucher",
    description: "AU$40 Rebel Sport gift card for sportswear",
    cost: 450,
    image: "⚽",
    partner: "Rebel Sport",
  },
];
