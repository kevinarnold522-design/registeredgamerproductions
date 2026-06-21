// Shared gift catalog used by the gift sending modal and the gift inbox.
// "free" gifts cost nothing, "points" gifts cost earned points,
// "paid" gifts are bought with real money via the payment flow.
export const GIFT_CATALOG = [
  { id: "heart", label: "Heart", emoji: "❤️", type: "free" },
  { id: "star", label: "Star", emoji: "⭐", type: "free" },
  { id: "thumbsup", label: "Thumbs Up", emoji: "👍", type: "free" },
  { id: "fire", label: "Fire", emoji: "🔥", type: "free" },
  { id: "trophy", label: "Trophy", emoji: "🏆", type: "points", points: 50 },
  { id: "medal", label: "Medal", emoji: "🏅", type: "points", points: 30 },
  { id: "rocket", label: "Rocket", emoji: "🚀", type: "points", points: 80 },
  { id: "crown", label: "Crown", emoji: "👑", type: "points", points: 120 },
  { id: "diamond", label: "Diamond", emoji: "💎", type: "paid", price: 199 },
  { id: "moneybag", label: "Money Bag", emoji: "💰", type: "paid", price: 499 },
  { id: "gem_pack", label: "Gem Pack", emoji: "💠", type: "paid", price: 999 },
];

export function getGift(id) {
  return GIFT_CATALOG.find((g) => g.id === id);
}