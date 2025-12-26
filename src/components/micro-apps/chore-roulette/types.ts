export interface RouletteChore {
  id: string;
  name: string;
  isReal: boolean;
  points: number;
}

export interface RouletteSlot {
  id: string;
  chore: RouletteChore;
  state: "shuffling" | "landing" | "landed";
}

export interface ChoreRouletteConfig {
  realChores: { name: string; points: number }[];
}
