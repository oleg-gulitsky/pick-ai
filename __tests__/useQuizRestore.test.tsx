import TestRenderer, { act, ReactTestRenderer } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Question } from '../src/appTypes/Question';
import { useQuizRestore } from '../src/hooks/useQuizRestore';
import { useQuizStore } from '../src/store/useQuizStore';

const flushPromises = () => new Promise<void>(resolve => setImmediate(resolve));

const questions: Question[] = [
  { question: 'Hot or cold?', options: ['Hot', 'Cold'] },
  { question: 'Morning or evening?', options: ['Morning', 'Evening'] },
];

const decisionTabOn = (screen: string) => ({
  routes: [{ name: 'NewDecisionTab', state: { routes: [{ name: screen }] } }],
});

async function saveQuiz(state: object) {
  await AsyncStorage.setItem(
    'quiz',
    JSON.stringify({
      state: {
        options: ['Tea', 'Coffee'],
        questions: [],
        answers: [],
        currentQuestionIndex: 0,
        result: null,
        ...state,
      },
      version: 1,
    }),
  );
}

let api: ReturnType<typeof useQuizRestore>;

function Probe() {
  api = useQuizRestore();
  return null;
}

describe('useQuizRestore', () => {
  let renderer: ReactTestRenderer | null = null;

  async function mount() {
    await act(async () => {
      renderer = TestRenderer.create(<Probe />);
      await flushPromises();
    });
  }

  beforeEach(async () => {
    useQuizStore.getState().resetQuiz();
    await AsyncStorage.clear();
  });

  afterEach(() => {
    act(() => renderer?.unmount());
    renderer = null;
    jest.restoreAllMocks();
  });

  test('waits for the saved quiz before the navigation mounts', async () => {
    act(() => {
      renderer = TestRenderer.create(<Probe />);
    });

    expect(api.isRestored).toBe(false);

    await act(flushPromises);

    expect(api.isRestored).toBe(true);
  });

  test('opens the options when nothing is saved', async () => {
    await mount();

    expect(api).toEqual({ isRestored: true, initialState: undefined });
  });

  test('opens the quiz that was being answered', async () => {
    await saveQuiz({ questions, answers: [1], currentQuestionIndex: 1 });

    await mount();

    expect(api.initialState).toEqual(decisionTabOn('Quiz'));
    expect(useQuizStore.getState().currentQuestionIndex).toBe(1);
  });

  test('opens the result of a finished quiz', async () => {
    await saveQuiz({
      questions,
      answers: [1, 0],
      currentQuestionIndex: 2,
      result: { winner: 'Tea', explanation: 'Calm.', savedId: 'id' },
    });

    await mount();

    expect(api.initialState).toEqual(decisionTabOn('Result'));
  });

  test('opens the options, filled in, before the questions arrived', async () => {
    await saveQuiz({ options: ['Tea', 'Coffee', 'Juice'] });

    await mount();

    expect(api.initialState).toBeUndefined();
    expect(useQuizStore.getState().options).toEqual(['Tea', 'Coffee', 'Juice']);
  });

  test('starts with no quiz when the storage fails', async () => {
    jest
      .spyOn(AsyncStorage, 'getItem')
      .mockRejectedValueOnce(new Error('Storage is unavailable'));

    await mount();

    expect(api).toEqual({ isRestored: true, initialState: undefined });
  });
});
