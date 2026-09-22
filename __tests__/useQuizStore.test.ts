import AsyncStorage from '@react-native-async-storage/async-storage';
import { Question } from '../src/appTypes/Question';
import { useQuizStore } from '../src/store/useQuizStore';

const STORAGE_KEY = 'quiz';

const flushPromises = () => new Promise<void>(resolve => setImmediate(resolve));

const questions: Question[] = [
  { question: 'Hot or cold?', options: ['Hot', 'Cold'] },
  { question: 'Morning or evening?', options: ['Morning', 'Evening'] },
];

async function saveQuiz(state: object) {
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ state, version: 1 }),
  );
}

describe('useQuizStore', () => {
  beforeEach(async () => {
    useQuizStore.getState().resetQuiz();
    await AsyncStorage.clear();
  });

  test('saves the progress of the quiz', async () => {
    useQuizStore.getState().startQuiz(['Tea', 'Coffee']);
    useQuizStore.getState().setQuestions(questions);
    useQuizStore.getState().addAnswer(0, 1);
    await flushPromises();

    const stored = JSON.parse((await AsyncStorage.getItem(STORAGE_KEY))!);

    expect(stored.state).toEqual({
      options: ['Tea', 'Coffee'],
      questions,
      answers: [1],
      currentQuestionIndex: 1,
      result: null,
    });
  });

  test('brings back a saved quiz', async () => {
    await saveQuiz({
      options: ['Tea', 'Coffee'],
      questions,
      answers: [1],
      currentQuestionIndex: 1,
      result: null,
    });

    await useQuizStore.persist.rehydrate();

    expect(useQuizStore.getState()).toMatchObject({
      options: ['Tea', 'Coffee'],
      questions,
      answers: [1],
      currentQuestionIndex: 1,
    });
  });

  test('reopens on the last question when the result was loading', async () => {
    await saveQuiz({
      options: ['Tea', 'Coffee'],
      questions,
      answers: [1, 0],
      currentQuestionIndex: 2,
      result: null,
    });

    await useQuizStore.persist.rehydrate();

    expect(useQuizStore.getState()).toMatchObject({
      answers: [1, 0],
      currentQuestionIndex: 1,
    });
  });

  test('keeps the options when the progress is dropped', () => {
    useQuizStore.getState().startQuiz(['Tea', 'Coffee']);
    useQuizStore.getState().setQuestions(questions);
    useQuizStore.getState().addAnswer(0, 1);

    useQuizStore.getState().resetProgress();

    expect(useQuizStore.getState()).toMatchObject({
      options: ['Tea', 'Coffee'],
      questions: [],
      answers: [],
      currentQuestionIndex: 0,
      result: null,
    });
  });
});
