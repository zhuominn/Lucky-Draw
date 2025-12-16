export interface Participant {
  id: string;
  name: string;
  department?: string;
  weight?: number; // For future weighted random support
}

export interface Settings {
  title: string;
  winnerCount: number; // How many to draw at once
  theme: 'dark' | 'pink';
  allowRepeats: boolean;
  musicEnabled: boolean;
}

export interface AppState {
  participants: Participant[];
  winners: Participant[];
  settings: Settings;
  
  // Actions
  setParticipants: (list: Participant[]) => void;
  addParticipant: (p: Participant) => void;
  clearParticipants: () => void;
  
  addWinner: (p: Participant) => void;
  clearWinners: () => void;
  removeWinner: (id: string) => void;
  
  updateSettings: (settings: Partial<Settings>) => void;
  resetAll: () => void;
}
