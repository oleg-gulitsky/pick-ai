import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Question } from '../appTypes/Question';
import { createSelectors } from './createSelectors';

type State = {
  questions: Question[];
  answers: number[];
  currentQuestionIndex: number;
  result: string;
};

type Action = {
  setQuestions: (questions: State['questions']) => void;
  setCurrentQuestionIndex: (
    currentQuestionIndex: State['currentQuestionIndex'],
  ) => void;
  addAnswer: (index: number, value: number) => void;
  setResult: (result: State['result']) => void;
  resetQuiz: () => void;
};

const defaultState: State = {
  questions: [],
  answers: [],
  currentQuestionIndex: 0,
  result: '',
};

const useQuizStoreBase = create<State & Action>()(
  immer(set => ({
    ...defaultState,
    setQuestions: questions => set(() => ({ questions })),
    setCurrentQuestionIndex: currentQuestionIndex =>
      set(() => ({ currentQuestionIndex })),
    addAnswer: (index, answer) =>
      set(state => {
        state.answers[index] = answer;
      }),
    setResult: result => set(() => ({ result })),
    resetQuiz: () => set(() => defaultState),
  })),
);

export const useQuizStore = createSelectors(useQuizStoreBase);
