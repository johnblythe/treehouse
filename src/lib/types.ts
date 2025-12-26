export interface Member {
  id: string;
  name: string;
  avatar: string; // emoji
  color: string; // tailwind color class
  role: "parent" | "child";
  points: number;
  createdAt: string;
}

export interface Activity {
  id: string;
  memberId: string;
  type: "chore" | "checklist" | "dinner_pick";
  name: string;
  points: number;
  completedAt: string;
  metadata?: Record<string, unknown>;
}

export interface ChoreItem {
  id: string;
  name: string;
  points: number;
  isDecoy: boolean;
}

export interface DinnerOption {
  id: string;
  name: string;
  votes: string[]; // member IDs who voted
}

export interface ChecklistItem {
  id: string;
  name: string;
  points: number;
  category: "morning" | "evening" | "anytime";
}

export interface MicroAppProps {
  familyMembers: Member[];
  onPointsAwarded: (memberId: string, points: number, activity: string) => void;
}
