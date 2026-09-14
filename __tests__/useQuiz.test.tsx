import TestRenderer, { act, ReactTestRenderer } from 'react-test-renderer';
import { Question } from '../src/appTypes/Question';
import { tryShowInterstitial } from '../src/services/ads';
import { tryGetQuestions, tryGetResult } from '../src/services/ai';
import { useQuiz } from '../src/navigation/screens/QuizScreen/useQuiz';
import { usePendingStore } from '../src/store/usePendingStore';
import { useQuizStore } from '../src/store/useQuizStore';

const mockNavigation = { replace: jest.fn() };
const mockHandleServiceError = jest.fn();

jest.mock('../src/navigation', () => ({
  useAppNavigation: () => mockNavigation,
}));
jest.mock('../src/hooks/useHandleServiceError', () => ({
  useHandleServiceError: () => mockHandleServiceError,
}));
jest.mock('../src/services/ai', () => ({
  tryGetQuestions: jest.fn(),
  tryGetResult: jest.fn(),
}));
jest.mock('../src/services/ads', () => ({
  tryShowInterstitial: jest.fn(),
}));

const mockedTryGetQuestions = jest.mocked(tryGetQuestions);
const mockedTryGetResult = jest.mocked(tryGetResult);

const questions: Question[] = [
  { question: 'Hot or cold?', options: ['Hot', 'Cold'] },
  { question: 'Morning or evening?', options: ['Morning', 'Evening'] },
];

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(res => {
    resolve = res;
  });
  return { promise, resolve };
}

const flushPromises = () => new Promise(resolve => setImmediate(resolve));

const isPending = () => usePendingStore.getState().isPending;

let api: ReturnType<typeof useQuiz>;

function Probe() {
  api = useQuiz();
  return null;
}

describe('useQuiz', () => {
  let renderer: ReactTestRenderer | null = null;

  async function mount() {
    await act(async () => {
      renderer = TestRenderer.create(<Probe />);
      await flushPromises();
    });
  }

  async function rerender() {
    await act(async () => {
      renderer?.update(<Probe />);
      await flushPromises();
    });
  }

  function unmount() {
    act(() => renderer?.unmount());
    renderer = null;
  }

  beforeEach(() => {
    jest.resetAllMocks();
    useQuizStore.getState().resetQuiz();
    useQuizStore.getState().setOptions('Tea', 'Coffee');
    usePendingStore.getState().setIsPendingFalse();
  });

  afterEach(unmount);

  test('requests the questions once and shows the first one', async () => {
    mockedTryGetQuestions.mockResolvedValue(questions);

    await mount();
    await rerender();

    expect(mockedTryGetQuestions).toHaveBeenCalledTimes(1);
    expect(api.question).toEqual(questions[0]);
    expect(isPending()).toBe(false);
  });

  test.each([
    ['fails', () => mockedTryGetQuestions.mockRejectedValue(new Error())],
    ['returns nothing', () => mockedTryGetQuestions.mockResolvedValue(null)],
  ])(
    'leaves the quiz without retrying when the questions request %s',
    async (_case, arrange) => {
      arrange();

      await mount();
      await rerender();

      expect(mockHandleServiceError).toHaveBeenCalledTimes(1);
      expect(mockHandleServiceError).toHaveBeenCalledWith('Options');
      expect(mockedTryGetQuestions).toHaveBeenCalledTimes(1);
      expect(useQuizStore.getState().firstOption).toBe('');
      expect(isPending()).toBe(false);
    },
  );

  test('shows the result after the last answer', async () => {
    mockedTryGetQuestions.mockResolvedValue(questions);
    mockedTryGetResult.mockResolvedValue('Pick tea');

    await mount();
    act(() => api.handleOptionPress(0));
    await act(async () => {
      api.handleOptionPress(1);
      await flushPromises();
    });

    expect(mockedTryGetResult).toHaveBeenCalledWith(
      ['Tea', 'Coffee'],
      questions,
      [0, 1],
      expect.anything(),
    );
    expect(useQuizStore.getState().result).toBe('Pick tea');
    expect(mockNavigation.replace).toHaveBeenCalledWith('Result');
    expect(isPending()).toBe(false);
  });

  test('sends the result request once when the last answer is tapped twice', async () => {
    mockedTryGetQuestions.mockResolvedValue(questions);
    mockedTryGetResult.mockReturnValue(new Promise(() => {}));

    await mount();
    act(() => api.handleOptionPress(0));
    // Both taps land before the re-render, so they share the same handler.
    const pressLastQuestionOption = api.handleOptionPress;
    act(() => {
      pressLastQuestionOption(1);
      pressLastQuestionOption(0);
    });
    await rerender();

    expect(mockedTryGetResult).toHaveBeenCalledTimes(1);
    expect(tryShowInterstitial).toHaveBeenCalledTimes(1);
    expect(useQuizStore.getState().answers).toEqual([0, 1]);
  });

  test('drops a result that arrives after the screen is gone', async () => {
    const result = deferred<string>();
    mockedTryGetQuestions.mockResolvedValue(questions);
    mockedTryGetResult.mockReturnValue(result.promise);

    await mount();
    act(() => api.handleOptionPress(0));
    act(() => api.handleOptionPress(1));
    const signal = mockedTryGetResult.mock.calls[0][3];
    unmount();

    expect(signal?.aborted).toBe(true);
    expect(isPending()).toBe(false);

    await act(async () => {
      result.resolve('Pick tea');
      await flushPromises();
    });

    expect(useQuizStore.getState().result).toBe('');
    expect(mockNavigation.replace).not.toHaveBeenCalled();
  });
});
