import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Question } from '../appTypes/Question';
import { createSelectors } from './createSelectors';

export type HistoryEntry = {
  id: string;
  firstOption: string;
  secondOption: string;
  questions: Question[];
  answers: number[];
  result: string;
  createdAt: number;
};

type State = {
  entries: HistoryEntry[];
};

type Action = {
  addEntry: (entry: Omit<HistoryEntry, 'id' | 'createdAt'>) => void;
  removeEntry: (id: HistoryEntry['id']) => void;
  clearHistory: () => void;
};

const useHistoryStoreBase = create<State & Action>()(
  persist(
    set => ({
      entries: [],
      addEntry: entry =>
        set(state => {
          const createdAt = Date.now();
          const newEntry: HistoryEntry = {
            ...entry,
            id: `${createdAt}-${Math.random().toString(36).slice(2, 8)}`,
            createdAt,
          };

          return { entries: [newEntry, ...state.entries] };
        }),
      removeEntry: id =>
        set(state => ({
          entries: state.entries.filter(entry => entry.id !== id),
        })),
      clearHistory: () => set(() => ({ entries: [] })),
    }),
    {
      name: 'decision-history',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({ entries: state.entries }),
    },
  ),
);

export const useHistoryStore = createSelectors(useHistoryStoreBase);
