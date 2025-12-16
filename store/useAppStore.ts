import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AppState, Participant, Settings } from '../types';

const DEFAULT_SETTINGS: Settings = {
  title: 'Lucky Draw',
  winnerCount: 1,
  theme: 'dark',
  allowRepeats: false,
  musicEnabled: true,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      participants: [],
      winners: [],
      settings: DEFAULT_SETTINGS,

      setParticipants: (list) => set({ participants: list }),
      
      addParticipant: (p) => set((state) => ({ 
        participants: [...state.participants, p] 
      })),
      
      clearParticipants: () => set({ participants: [] }),

      addWinner: (p) => set((state) => ({ 
        winners: [p, ...state.winners] 
      })),

      clearWinners: () => set({ winners: [] }),

      removeWinner: (id) => set((state) => ({
        winners: state.winners.filter(w => w.id !== id)
      })),

      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),

      resetAll: () => set({
        participants: [],
        winners: [],
        settings: DEFAULT_SETTINGS
      }),
    }),
    {
      name: 'lucky-draw-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);