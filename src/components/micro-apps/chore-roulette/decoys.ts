// Decoy chores - intentionally harder/worse to make real chores feel like a win
export const DECOY_CHORES = [
  // Gross/unpleasant
  "Clean toilet with toothbrush",
  "Scrub garbage cans",
  "Clean behind fridge",
  "Wash all baseboards",
  "Deep clean oven",
  "Clean out garage",
  "Organize junk drawer",
  "Scrub grout by hand",
  "Clean ceiling fans",
  "Wash all windows",
  
  // Time-consuming
  "Reorganize entire pantry",
  "Fold ALL the laundry",
  "Vacuum under furniture",
  "Dust every bookshelf",
  "Clean out closet",
  "Wash car by hand",
  "Rake entire yard",
  "Pull all weeds",
  "Mop every floor",
  "Organize toy room",
  
  // Tedious
  "Match all socks",
  "Sharpen every pencil",
  "Organize Tupperware",
  "Clean light switches",
  "Wipe all door handles",
  "Clean microwave",
  "Organize under sink",
  "Sort recycling",
  "Clean all mirrors",
  "Dust all blinds",
  
  // Physical effort
  "Move furniture to vacuum",
  "Take all trash out",
  "Put away groceries",
  "Stack firewood",
  "Sweep driveway",
  "Clean car trunk",
  "Organize the shed",
  "Wash patio furniture",
  "Clean the grill",
  "Organize sports gear",
  
  // Extra hard
  "Alphabetize spice rack",
  "Polish all doorknobs",
  "Iron all sheets",
  "Clean window tracks",
  "Organize garage tools",
  "Wash all pet bedding",
  "Clean AC vents",
  "Organize craft supplies",
];

// Get random decoys, avoiding duplicates and similar to real chores
export function getRandomDecoys(count: number, realChores: string[]): string[] {
  const realLower = realChores.map(c => c.toLowerCase());
  
  // Filter out decoys that are too similar to real chores
  const available = DECOY_CHORES.filter(decoy => {
    const decoyLower = decoy.toLowerCase();
    return !realLower.some(real => 
      decoyLower.includes(real) || real.includes(decoyLower)
    );
  });
  
  // Shuffle and take what we need
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
