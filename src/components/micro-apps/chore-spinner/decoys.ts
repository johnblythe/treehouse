// Decoy chores - intentionally harder/worse to make real chores feel like a win
export const DECOY_CHORES = [
  // Gross/unpleasant
  "Clean the toilet with a toothbrush",
  "Scrub the garbage cans inside and out",
  "Clean behind the refrigerator",
  "Wash all the baseboards",
  "Deep clean the oven",
  "Clean out the garage",
  "Organize the junk drawer",
  "Scrub grout with a brush",
  "Clean ceiling fans",
  "Wash all the windows inside and out",
  
  // Time-consuming
  "Reorganize the entire pantry",
  "Sort and fold ALL the laundry",
  "Vacuum under every piece of furniture",
  "Dust every bookshelf and item on it",
  "Clean out and organize the closet",
  "Wash the car inside and out",
  "Rake the entire yard",
  "Pull weeds from the garden",
  "Mop every floor in the house",
  "Organize the toy room completely",
  
  // Tedious
  "Match all the socks in the house",
  "Sharpen every pencil in the house",
  "Organize the Tupperware cabinet",
  "Clean all the light switches",
  "Wipe down every door handle",
  "Clean the microwave inside and out",
  "Organize under the bathroom sink",
  "Sort the recycling",
  "Clean all the mirrors",
  "Dust all the blinds",
  
  // Physical effort
  "Move furniture and vacuum underneath",
  "Carry all the trash to the curb",
  "Bring in and put away all groceries",
  "Stack firewood",
  "Sweep the driveway",
  "Clean out the car trunk",
  "Organize the shed",
  "Wash all outdoor furniture",
  "Clean the grill",
  "Organize sports equipment",
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
