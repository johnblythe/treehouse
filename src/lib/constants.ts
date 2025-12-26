// Avatar options (emojis)
export const AVATARS = [
  "😀", "😎", "🤓", "😊", "🥳",
  "🦊", "🐱", "🐶", "🦄", "🐼",
  "🌟", "🚀", "🎮", "⚽", "🎨",
  "🌈", "🔥", "💎", "🎸", "🍕"
];

// Color options with richer, more vibrant palette
export const MEMBER_COLORS = [
  { 
    name: "coral", 
    bg: "bg-rose-400", 
    text: "text-rose-600", 
    light: "bg-rose-50",
    border: "border-rose-300",
    gradient: "from-rose-400 to-orange-300"
  },
  { 
    name: "tangerine", 
    bg: "bg-orange-400", 
    text: "text-orange-600", 
    light: "bg-amber-50",
    border: "border-orange-300",
    gradient: "from-orange-400 to-yellow-300"
  },
  { 
    name: "sunshine", 
    bg: "bg-yellow-400", 
    text: "text-yellow-600", 
    light: "bg-yellow-50",
    border: "border-yellow-300",
    gradient: "from-yellow-400 to-lime-300"
  },
  { 
    name: "mint", 
    bg: "bg-emerald-400", 
    text: "text-emerald-600", 
    light: "bg-emerald-50",
    border: "border-emerald-300",
    gradient: "from-emerald-400 to-teal-300"
  },
  { 
    name: "sky", 
    bg: "bg-sky-400", 
    text: "text-sky-600", 
    light: "bg-sky-50",
    border: "border-sky-300",
    gradient: "from-sky-400 to-blue-300"
  },
  { 
    name: "lavender", 
    bg: "bg-violet-400", 
    text: "text-violet-600", 
    light: "bg-violet-50",
    border: "border-violet-300",
    gradient: "from-violet-400 to-purple-300"
  },
  { 
    name: "bubblegum", 
    bg: "bg-pink-400", 
    text: "text-pink-600", 
    light: "bg-pink-50",
    border: "border-pink-300",
    gradient: "from-pink-400 to-rose-300"
  },
  { 
    name: "ocean", 
    bg: "bg-cyan-400", 
    text: "text-cyan-600", 
    light: "bg-cyan-50",
    border: "border-cyan-300",
    gradient: "from-cyan-400 to-sky-300"
  },
];

// Legacy color name mapping for existing data
const COLOR_ALIASES: Record<string, string> = {
  red: "coral",
  orange: "tangerine", 
  yellow: "sunshine",
  green: "mint",
  blue: "sky",
  purple: "lavender",
  pink: "bubblegum",
  teal: "ocean",
};

// Get color config by name (supports legacy names)
export function getColorConfig(colorName: string) {
  const normalizedName = COLOR_ALIASES[colorName] || colorName;
  return MEMBER_COLORS.find(c => c.name === normalizedName) || MEMBER_COLORS[0];
}
