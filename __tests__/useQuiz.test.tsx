import TestRenderer, { act, ReactTestRenderer } from 'react-test-renderer';
import { Question } from '../src/appTypes/Question';
import { tryShowInterstitial } from '../src/services/ads';
import { useQuiz } from '../src/navigation/screens/QuizScreen/useQuiz';
import { usePendingStore } from '../src/store/usePendingStore';
import { useQuizStore } from '../src/store/useQuizStore';
import { useHistoryStore } from '../src/store/useHistoryStore';
import { useSettingsStore } from '../src/store/useSettingsStore';

const mockNavigation = { replace: jest.fn() };
const mockRequestQuestions = jest.fn();
const mockRequestResult = jest.fn();

jest.mock('../src/navigation', () => ({
  useAppNavigation: () => mockNavigation,
}));
jest.mock('../src/navigation/screens/QuizScreen/useQuiz/useAIRequests', () => ({
  useAIRequests: () => ({
    requestQuestions: mockRequestQuestions,
    requestResult: mockRequestResult,
  }),
}));
jest.mock('../src/services/ads', () => ({
  tryShowInterstitial: jest.fn(),
}));

const options = ['Tea', 'Coffee', 'Juice'];

const questions: Question[] = [
  { question: 'Hot or cold?', options: ['Hot', 'Cold'] },
  { question: 'Morning or evening?', options: ['Morning', 'Evening'] },
];

const result = { winner: 'Tea', explanation: 'It keeps you calm.' };

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(res => {
    resolve = res;
  });
  return { promise, resolve };
}

const flushPromises = () => new Promise<void>(resolve => setImmediate(resolve));

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

  async function answerAll() {
    act(() => api.handleAnswerPress(0));
    await act(async () => {
      api.handleAnswerPress(1);
      await flushPromises();
    });
  }

  beforeEach(() => {
    jest.resetAllMocks();
    useQuizStore.getState().resetQuiz();
    useQuizStore.getState().startQuiz(options);
    usePendingStore.getState().setIsPendingFalse();
    useHistoryStore.setState({ entries: [] });
    useSettingsStore.setState({ questionRange: [5, 8], answerRange: [3, 4] });
  });

  afterEach(unmount);

  test('requests the questions once and shows the first one', async () => {
    mockRequestQuestions.mockResolvedValue(questions);

    await mount();
    await rerender();

    expect(mockRequestQuestions).toHaveBeenCalledTimes(1);
    expect(mockRequestQuestions).toHaveBeenCalledWith(
      options,
      { questionRange: [5, 8], answerRange: [3, 4] },
      expect.anything(),
    );
    expect(api.question).toEqual(questions[0]);
    expect(api.questionsCount).toBe(2);
    expect(isPending()).toBe(false);
  });

  test('shows the error over the waiting state and keeps the options', async () => {
    mockRequestQuestions.mockRejectedValue(new Error());

    await mount();
    await rerender();

    expect(api.hasError).toBe(true);
    expect(api.question).toBeUndefined();
    expect(mockRequestQuestions).toHaveBeenCalledTimes(1);
    expect(mockNavigation.replace).not.toHaveBeenCalled();
    expect(useQuizStore.getState().options).toEqual(options);
    expect(isPending()).toBe(false);
  });

  test('requests the questions again on retry', async () => {
    mockRequestQuestions.mockRejectedValueOnce(new Error());
    mockRequestQuestions.mockResolvedValueOnce(questions);

    await mount();
    await act(async () => {
      api.handleRetryPress();
      await flushPromises();
    });

    expect(api.hasError).toBe(false);
    expect(mockRequestQuestions).toHaveBeenCalledTimes(2);
    expect(api.question).toEqual(questions[0]);
  });

  test('goes back to the options with them kept', async () => {
    mockRequestQuestions.mockRejectedValue(new Error());

    await mount();
    act(() => api.handleBackToOptionsPress());

    expect(api.hasError).toBe(false);
    expect(mockNavigation.replace).toHaveBeenCalledWith('Options');
    expect(useQuizStore.getState().options).toEqual(options);
  });

  test('cancels the questions request and returns to the options', async () => {
    mockRequestQuestions.mockImplementation(() => new Promise(() => {}));

    await mount();
    const signal = mockRequestQuestions.mock.calls[0][2];
    act(() => api.handleCancelPress());

    expect(signal.aborted).toBe(true);
    expect(isPending()).toBe(false);
    expect(mockNavigation.replace).toHaveBeenCalledWith('Options');
    expect(useQuizStore.getState().options).toEqual(options);
  });

  test('returns to the previous question with its answer selected', async () => {
    mockRequestQuestions.mockResolvedValue(questions);

    await mount();

    expect(api.canGoBack).toBe(false);

    act(() => api.handleAnswerPress(1));

    expect(api.question).toEqual(questions[1]);
    expect(api.selectedAnswer).toBeUndefined();
    expect(api.canGoBack).toBe(true);

    act(() => api.handleBackPress());

    expect(api.questionIndex).toBe(0);
    expect(api.selectedAnswer).toBe(1);
  });

  test('saves and shows the result after the last answer', async () => {
    mockRequestQuestions.mockResolvedValue(questions);
    mockRequestResult.mockResolvedValue(result);

    await mount();
    await answerAll();

    expect(mockRequestResult).toHaveBeenCalledWith(
      options,
      questions,
      [0, 1],
      expect.anything(),
    );
    const [entry] = useHistoryStore.getState().entries;
    expect(entry).toMatchObject({
      options,
      questions,
      answers: [0, 1],
      ...result,
    });
    expect(useQuizStore.getState().result).toEqual({
      ...result,
      savedId: entry.id,
    });
    expect(mockNavigation.replace).toHaveBeenCalledWith('Result');
    expect(isPending()).toBe(false);
  });

  test('waits for the result instead of showing a question', async () => {
    mockRequestQuestions.mockResolvedValue(questions);
    mockRequestResult.mockReturnValue(new Promise(() => {}));

    await mount();
    await answerAll();

    expect(api.question).toBeUndefined();
    expect(api.isWaitingForResult).toBe(true);
  });

  test('cancelling the result request returns to the last question', async () => {
    mockRequestQuestions.mockResolvedValue(questions);
    mockRequestResult.mockReturnValue(new Promise(() => {}));

    await mount();
    await answerAll();
    const signal = mockRequestResult.mock.calls[0][3];
    act(() => api.handleCancelPress());

    expect(signal.aborted).toBe(true);
    expect(api.question).toEqual(questions[1]);
    expect(api.selectedAnswer).toBe(1);
    expect(mockNavigation.replace).not.toHaveBeenCalled();
  });

  test('retries the result request after an error', async () => {
    mockRequestQuestions.mockResolvedValue(questions);
    mockRequestResult.mockRejectedValueOnce(new Error());
    mockRequestResult.mockResolvedValueOnce(result);

    await mount();
    await answerAll();

    expect(api.hasError).toBe(true);

    await act(async () => {
      api.handleRetryPress();
      await flushPromises();
    });

    expect(mockRequestResult).toHaveBeenCalledTimes(2);
    expect(mockRequestQuestions).toHaveBeenCalledTimes(1);
    expect(tryShowInterstitial).toHaveBeenCalledTimes(1);
    expect(mockNavigation.replace).toHaveBeenCalledWith('Result');
  });

  test('leaves after a result error without requesting questions again', async () => {
    mockRequestQuestions.mockResolvedValue(questions);
    mockRequestResult.mockRejectedValue(new Error());

    await mount();
    await answerAll();
    await act(async () => {
      api.handleBackToOptionsPress();
      await flushPromises();
    });

    expect(mockNavigation.replace).toHaveBeenCalledWith('Options');
    expect(mockRequestQuestions).toHaveBeenCalledTimes(1);
    expect(useQuizStore.getState()).toMatchObject({
      options,
      questions: [],
      answers: [],
      currentQuestionIndex: 0,
    });
  });

  test('opens a restored quiz on its question without a request', async () => {
    useQuizStore.setState({
      questions,
      answers: [1],
      currentQuestionIndex: 1,
    });

    await mount();

    expect(mockRequestQuestions).not.toHaveBeenCalled();
    expect(api.question).toEqual(questions[1]);
    expect(api.canGoBack).toBe(true);
  });

  test('sends the result request once when the last answer is tapped twice', async () => {
    mockRequestQuestions.mockResolvedValue(questions);
    mockRequestResult.mockReturnValue(new Promise(() => {}));

    await mount();
    act(() => api.handleAnswerPress(0));
    // Both taps land before the re-render, so they share the same handler.
    const pressLastQuestionAnswer = api.handleAnswerPress;
    act(() => {
      pressLastQuestionAnswer(1);
      pressLastQuestionAnswer(0);
    });
    await rerender();

    expect(mockRequestResult).toHaveBeenCalledTimes(1);
    expect(tryShowInterstitial).toHaveBeenCalledTimes(1);
    expect(useQuizStore.getState().answers).toEqual([0, 1]);
  });

  test('drops a result that arrives after the screen is gone', async () => {
    const pendingResult = deferred<typeof result>();
    mockRequestQuestions.mockResolvedValue(questions);
    mockRequestResult.mockReturnValue(pendingResult.promise);

    await mount();
    act(() => api.handleAnswerPress(0));
    act(() => api.handleAnswerPress(1));
    const signal = mockRequestResult.mock.calls[0][3];
    unmount();

    expect(signal?.aborted).toBe(true);
    expect(isPending()).toBe(false);

    await act(async () => {
      pendingResult.resolve(result);
      await flushPromises();
    });

    expect(useQuizStore.getState().result).toBeNull();
    expect(useHistoryStore.getState().entries).toEqual([]);
    expect(mockNavigation.replace).not.toHaveBeenCalled();
  });
});
