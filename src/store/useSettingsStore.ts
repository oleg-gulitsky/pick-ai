import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSelectors } from './createSelectors';

export type ThemePreference = 'system' | 'light' | 'dark';

export type Range = [min: number, max: number];

export const QUESTION_RANGE_BOUNDS: Range = [4, 10];
export const ANSWER_RANGE_BOUNDS: Range = [2, 4];

type State = {
  theme: ThemePreference;
  questionRange: Range;
  answerRange: Range;
};

type Action = {
  setTheme: (theme: State['theme']) => void;
  setQuestionRange: (questionRange: State['questionRange']) => void;
  setAnswerRange: (answerRange: State['answerRange']) => void;
};

const useSettingsStoreBase = create<State & Action>()(
  persist(
    set => ({
      theme: 'system',
      questionRange: [7, 10],
      answerRange: [2, 4],
      setTheme: theme => set(() => ({ theme })),
      setQuestionRange: questionRange => set(() => ({ questionRange })),
      setAnswerRange: answerRange => set(() => ({ answerRange })),
    }),
    {
      name: 'settings',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        theme: state.theme,
        questionRange: state.questionRange,
        answerRange: state.answerRange,
      }),
    },
  ),
);

export const useSettingsStore = createSelectors(useSettingsStoreBase);
