export interface ChoreSlot {
  id: string;
  name: string;
  isReal: boolean;
  points: number;
}

export interface ChoreSpinnerConfig {
  realChores: string[];
  pointsPerChore: number;
}
