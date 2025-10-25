import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Question } from '../appTypes/Question';
import { createSelectors } from './createSelectors';

type State = {
  firstOption: string;
  secondOption: string;
  questions: Question[];
  answers: number[];
  currentQuestionIndex: number;
  result: string;
};

type Action = {
  setOptions: (
    firstOption: State['firstOption'],
    secondOption: State['secondOption'],
  ) => void;
  setQuestions: (questions: State['questions']) => void;
  addAnswer: (index: number, value: number) => void;
  setResult: (result: State['result']) => void;
  resetQuiz: () => void;
};

const defaultState: State = {
  firstOption: '',
  secondOption: '',
  questions: [],
  answers: [],
  currentQuestionIndex: 0,
  result: '',
};

const useQuizStoreBase = create<State & Action>()(
  immer(set => ({
    ...defaultState,
    setOptions: (firstOption, secondOption) =>
      set(() => ({ firstOption, secondOption })),
    setQuestions: questions => set(() => ({ questions })),
    addAnswer: (index, answer) =>
      set(state => {
        state.currentQuestionIndex = index + 1;
        state.answers[index] = answer;
      }),
    setResult: result => set(() => ({ result })),
    resetQuiz: () => set(() => defaultState),
  })),
);

export const useQuizStore = createSelectors(useQuizStoreBase);
