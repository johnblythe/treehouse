export interface Meal {
  id: string;
  name: string;
  emoji?: string;
}

export interface DinnerPickerConfig {
  meals: Meal[];
}
