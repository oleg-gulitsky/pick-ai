import { Alert } from 'react-native';
import TestRenderer, { act, ReactTestRenderer } from 'react-test-renderer';
import { Question } from '../src/appTypes/Question';
import { STRINGS } from '../src/constants/strings';
import { tryShowInterstitial } from '../src/services/ads';
import { useQuiz } from '../src/navigation/screens/QuizScreen/useQuiz';
import { usePendingStore } from '../src/store/usePendingStore';
import { useQuizStore } from '../src/store/useQuizStore';
import { useHistoryStore } from '../src/store/useHistoryStore';

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
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    useQuizStore.getState().resetQuiz();
    useQuizStore.getState().setOptions('Tea', 'Coffee');
    usePendingStore.getState().setIsPendingFalse();
    useHistoryStore.setState({ entries: [] });
  });

  afterEach(unmount);

  test('requests the questions once and shows the first one', async () => {
    mockRequestQuestions.mockResolvedValue(questions);

    await mount();
    await rerender();

    expect(mockRequestQuestions).toHaveBeenCalledTimes(1);
    expect(api.question).toEqual(questions[0]);
    expect(isPending()).toBe(false);
  });

  test('leaves the quiz without retrying when the questions request fails', async () => {
    mockRequestQuestions.mockRejectedValue(new Error());

    await mount();
    await rerender();

    expect(Alert.alert).toHaveBeenCalledTimes(1);
    expect(Alert.alert).toHaveBeenCalledWith(
      STRINGS.SERVICE_ERROR_ALERT_TITLE,
      STRINGS.SERVICE_ERROR_ALERT_MESSAGE,
    );
    expect(mockNavigation.replace).toHaveBeenCalledTimes(1);
    expect(mockNavigation.replace).toHaveBeenCalledWith('Options');
    expect(mockRequestQuestions).toHaveBeenCalledTimes(1);
    expect(useQuizStore.getState().firstOption).toBe('');
    expect(isPending()).toBe(false);
  });

  test('shows the result after the last answer', async () => {
    mockRequestQuestions.mockResolvedValue(questions);
    mockRequestResult.mockResolvedValue('Pick tea');

    await mount();
    act(() => api.handleOptionPress(0));
    await act(async () => {
      api.handleOptionPress(1);
      await flushPromises();
    });

    expect(mockRequestResult).toHaveBeenCalledWith(
      ['Tea', 'Coffee'],
      questions,
      [0, 1],
      expect.anything(),
    );
    expect(useQuizStore.getState().result).toBe('Pick tea');
    expect(useHistoryStore.getState().entries).toEqual([
      expect.objectContaining({
        firstOption: 'Tea',
        secondOption: 'Coffee',
        questions,
        answers: [0, 1],
        result: 'Pick tea',
      }),
    ]);
    expect(mockNavigation.replace).toHaveBeenCalledWith('Result');
    expect(isPending()).toBe(false);
  });

  test('sends the result request once when the last answer is tapped twice', async () => {
    mockRequestQuestions.mockResolvedValue(questions);
    mockRequestResult.mockReturnValue(new Promise(() => {}));

    await mount();
    act(() => api.handleOptionPress(0));
    // Both taps land before the re-render, so they share the same handler.
    const pressLastQuestionOption = api.handleOptionPress;
    act(() => {
      pressLastQuestionOption(1);
      pressLastQuestionOption(0);
    });
    await rerender();

    expect(mockRequestResult).toHaveBeenCalledTimes(1);
    expect(tryShowInterstitial).toHaveBeenCalledTimes(1);
    expect(useQuizStore.getState().answers).toEqual([0, 1]);
  });

  test('drops a result that arrives after the screen is gone', async () => {
    const result = deferred<string>();
    mockRequestQuestions.mockResolvedValue(questions);
    mockRequestResult.mockReturnValue(result.promise);

    await mount();
    act(() => api.handleOptionPress(0));
    act(() => api.handleOptionPress(1));
    const signal = mockRequestResult.mock.calls[0][3];
    unmount();

    expect(signal?.aborted).toBe(true);
    expect(isPending()).toBe(false);

    await act(async () => {
      result.resolve('Pick tea');
      await flushPromises();
    });

    expect(useQuizStore.getState().result).toBe('');
    expect(useHistoryStore.getState().entries).toEqual([]);
    expect(mockNavigation.replace).not.toHaveBeenCalled();
  });
});
