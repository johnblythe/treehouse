import { Member } from "@/lib/types";

export interface PickerOption {
  id: string;
  name: string;
  emoji?: string;
}

export interface PickerProps {
  options: PickerOption[];
  onResult: (winner: PickerOption) => void;
  onCancel?: () => void;
}

export interface VotingPickerProps extends PickerProps {
  familyMembers: Member[];
  requiredVotes?: number; // How many YES votes needed (swipe)
}
