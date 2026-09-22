import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Question } from '../appTypes/Question';
import { createSelectors } from './createSelectors';

export type HistoryEntry = {
  id: string;
  options: string[];
  winner: string;
  explanation: string;
  questions: Question[];
  answers: number[];
  createdAt: number;
};

type State = {
  entries: HistoryEntry[];
};

type Action = {
  addEntry: (entry: Omit<HistoryEntry, 'id' | 'createdAt'>) => string;
  removeEntry: (id: HistoryEntry['id']) => void;
  clearHistory: () => void;
};

type LegacyHistoryEntry = {
  id: string;
  firstOption: string;
  secondOption: string;
  questions: Question[];
  answers: number[];
  result: string;
  createdAt: number;
};

const useHistoryStoreBase = create<State & Action>()(
  persist(
    set => ({
      entries: [],
      addEntry: entry => {
        const createdAt = Date.now();
        const id = `${createdAt}-${Math.random().toString(36).slice(2, 8)}`;

        set(state => ({
          entries: [{ ...entry, id, createdAt }, ...state.entries],
        }));

        return id;
      },
      removeEntry: id =>
        set(state => ({
          entries: state.entries.filter(entry => entry.id !== id),
        })),
      clearHistory: () => set(() => ({ entries: [] })),
    }),
    {
      name: 'decision-history',
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({ entries: state.entries }),
      migrate: (persistedState, version) => {
        if (version < 2) {
          const { entries } = persistedState as {
            entries: LegacyHistoryEntry[];
          };
          return { entries: entries.map(migrateLegacyEntry) };
        }

        return persistedState as State;
      },
    },
  ),
);

export const useHistoryStore = createSelectors(useHistoryStoreBase);

function migrateLegacyEntry({
  firstOption,
  secondOption,
  result,
  ...entry
}: LegacyHistoryEntry): HistoryEntry {
  return {
    ...entry,
    options: [firstOption, secondOption],
    winner: '',
    explanation: result,
  };
}
