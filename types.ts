
export interface UserInfo {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  onboarded: boolean;
}

export interface Exercise {
  id: string;
  title: string;
  category: string;
  description: string;
  instruction: string;
  duration: string;
}

export interface DailyProgress {
  date: string; // ISO format
  dayNumber: number; // 1 to 60
  scores: Record<string, number>; // exerciseId: score 1-5
  comment: string;
  completed: boolean;
  skipped?: boolean;
  skipReason?: string;
}

export interface AppState {
  user: UserInfo | null;
  progress: DailyProgress[];
  currentDay: number;
}
