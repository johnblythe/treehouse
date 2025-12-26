// Avatar options (emojis)
export const AVATARS = [
  "😀", "😎", "🤓", "😊", "🥳",
  "🦊", "🐱", "🐶", "🦄", "🐼",
  "🌟", "🚀", "🎮", "⚽", "🎨",
  "🌈", "🔥", "💎", "🎸", "🍕"
];

// Color options with Tailwind classes
export const MEMBER_COLORS = [
  { name: "red", bg: "bg-red-500", text: "text-red-500", light: "bg-red-100" },
  { name: "orange", bg: "bg-orange-500", text: "text-orange-500", light: "bg-orange-100" },
  { name: "yellow", bg: "bg-yellow-500", text: "text-yellow-500", light: "bg-yellow-100" },
  { name: "green", bg: "bg-green-500", text: "text-green-500", light: "bg-green-100" },
  { name: "blue", bg: "bg-blue-500", text: "text-blue-500", light: "bg-blue-100" },
  { name: "purple", bg: "bg-purple-500", text: "text-purple-500", light: "bg-purple-100" },
  { name: "pink", bg: "bg-pink-500", text: "text-pink-500", light: "bg-pink-100" },
  { name: "teal", bg: "bg-teal-500", text: "text-teal-500", light: "bg-teal-100" },
];

// Get color config by name
export function getColorConfig(colorName: string) {
  return MEMBER_COLORS.find(c => c.name === colorName) || MEMBER_COLORS[0];
}
