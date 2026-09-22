import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Question } from '../appTypes/Question';
import { createSelectors } from './createSelectors';

export type QuizResult = {
  winner: string;
  explanation: string;
  savedId: string;
};

type State = {
  options: string[];
  questions: Question[];
  answers: number[];
  currentQuestionIndex: number;
  result: QuizResult | null;
};

type Action = {
  startQuiz: (options: State['options']) => void;
  setQuestions: (questions: State['questions']) => void;
  addAnswer: (index: number, value: number) => void;
  goToPreviousQuestion: () => void;
  setResult: (result: QuizResult) => void;
  resetProgress: () => void;
  resetQuiz: () => void;
};

const defaultState: State = {
  options: [],
  questions: [],
  answers: [],
  currentQuestionIndex: 0,
  result: null,
};

const useQuizStoreBase = create<State & Action>()(
  persist(
    immer(set => ({
      ...defaultState,
      startQuiz: options => set(() => ({ ...defaultState, options })),
      setQuestions: questions => set(() => ({ questions })),
      addAnswer: (index, answer) =>
        set(state => {
          state.currentQuestionIndex = index + 1;
          state.answers[index] = answer;
        }),
      goToPreviousQuestion: () =>
        set(state => {
          state.currentQuestionIndex = Math.max(
            0,
            state.currentQuestionIndex - 1,
          );
        }),
      setResult: result => set(() => ({ result })),
      resetProgress: () =>
        set(state => ({ ...defaultState, options: state.options })),
      resetQuiz: () => set(() => defaultState),
    })),
    {
      name: 'quiz',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      skipHydration: true,
      partialize: ({
        options,
        questions,
        answers,
        currentQuestionIndex,
        result,
      }): State => ({
        options,
        questions,
        answers,
        currentQuestionIndex,
        result,
      }),
      merge: (persistedState, currentState) => {
        if (!persistedState) {
          return currentState;
        }

        const quiz = { ...currentState, ...(persistedState as State) };
        const lastIndex = Math.max(quiz.questions.length - 1, 0);

        return {
          ...quiz,
          currentQuestionIndex: Math.min(quiz.currentQuestionIndex, lastIndex),
        };
      },
    },
  ),
);

export const useQuizStore = createSelectors(useQuizStoreBase);
