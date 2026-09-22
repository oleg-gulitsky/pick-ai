import TestRenderer, { act, ReactTestRenderer } from 'react-test-renderer';
import { tryShowInterstitial } from '../src/services/ads';
import { useOptionsForm } from '../src/navigation/screens/OptionsScreen/useOptionsForm';
import { useAppConfigStore } from '../src/store/useAppConfigStore';
import { usePendingStore } from '../src/store/usePendingStore';
import { useQuizStore } from '../src/store/useQuizStore';

const mockNavigation = { replace: jest.fn() };

jest.mock('../src/navigation', () => ({
  useAppNavigation: () => mockNavigation,
}));
jest.mock('../src/services/ads', () => ({
  tryShowInterstitial: jest.fn(),
}));

let api: ReturnType<typeof useOptionsForm>;

const texts = () => api.options.map(option => option.text);

function Probe() {
  api = useOptionsForm();
  return null;
}

describe('useOptionsForm', () => {
  let renderer: ReactTestRenderer | null = null;

  function mount() {
    act(() => {
      renderer = TestRenderer.create(<Probe />);
    });
  }

  function fillOptions() {
    act(() => {
      api.handleOptionChange(0, 'Tea');
      api.handleOptionChange(1, 'Coffee');
    });
  }

  beforeEach(() => {
    jest.resetAllMocks();
    useAppConfigStore.setState({ isConfigReady: false });
    usePendingStore.getState().setIsPendingFalse();
    useQuizStore.getState().resetQuiz();
  });

  afterEach(() => {
    act(() => renderer?.unmount());
    renderer = null;
  });

  test('starts with two empty options', () => {
    mount();

    expect(texts()).toEqual(['', '']);
    expect(api.options.map(option => option.isRemovable)).toEqual([
      false,
      false,
    ]);
    expect(api.autoFocusKey).toBeNull();
    expect(api.canAddOption).toBe(true);
  });

  test('does not submit before the config is ready', () => {
    mount();
    fillOptions();

    expect(api.canSubmit).toBe(false);

    act(() => api.handleSubmit());

    expect(mockNavigation.replace).not.toHaveBeenCalled();
    expect(tryShowInterstitial).not.toHaveBeenCalled();
    expect(useQuizStore.getState().options).toEqual([]);
    expect(usePendingStore.getState().isPending).toBe(false);
  });

  test('submits once the config is ready', () => {
    mount();
    fillOptions();
    act(() => useAppConfigStore.getState().setIsConfigReadyTrue());

    expect(api.canSubmit).toBe(true);

    act(() => api.handleSubmit());

    expect(mockNavigation.replace).toHaveBeenCalledWith('Quiz');
    expect(useQuizStore.getState().options).toEqual(['Tea', 'Coffee']);
  });

  test('starts the new quiz without the progress of the previous one', () => {
    useQuizStore.getState().startQuiz(['Cats', 'Dogs']);
    useQuizStore
      .getState()
      .setQuestions([{ question: 'Walks?', options: ['Yes', 'No'] }]);
    useQuizStore.getState().addAnswer(0, 1);
    mount();
    act(() => {
      useAppConfigStore.getState().setIsConfigReadyTrue();
      api.handleOptionChange(0, 'Tea');
    });
    act(() => api.handleSubmit());

    expect(useQuizStore.getState()).toMatchObject({
      options: ['Tea', 'Dogs'],
      questions: [],
      answers: [],
      currentQuestionIndex: 0,
    });
  });

  test('does not submit with a single filled option', () => {
    mount();
    act(() => {
      useAppConfigStore.getState().setIsConfigReadyTrue();
      api.handleOptionChange(0, 'Tea');
      api.handleOptionChange(1, '   ');
    });

    expect(api.canSubmit).toBe(false);
  });

  test('does not submit while a request is pending', () => {
    mount();
    fillOptions();
    act(() => {
      useAppConfigStore.getState().setIsConfigReadyTrue();
      usePendingStore.getState().setIsPendingTrue();
    });

    expect(api.canSubmit).toBe(false);
  });

  test('adds up to four options and focuses the new one', () => {
    mount();

    act(() => api.handleAddOptionPress());

    expect(texts()).toEqual(['', '', '']);
    expect(api.options[2].isRemovable).toBe(true);
    expect(api.autoFocusKey).toBe(api.options[2].key);

    act(() => api.handleAddOptionPress());
    act(() => api.handleAddOptionPress());

    expect(api.options).toHaveLength(4);
    expect(api.canAddOption).toBe(false);
  });

  test('sends every option, trimmed', () => {
    mount();
    act(() => {
      useAppConfigStore.getState().setIsConfigReadyTrue();
      api.handleAddOptionPress();
      api.handleAddOptionPress();
    });
    act(() => {
      api.handleOptionChange(0, '  Tea ');
      api.handleOptionChange(1, 'Milk');
      api.handleOptionChange(2, 'Juice');
    });
    act(() => api.handleOptionChange(3, 'Coffee'));
    act(() => api.handleSubmit());

    expect(useQuizStore.getState().options).toEqual([
      'Tea',
      'Milk',
      'Juice',
      'Coffee',
    ]);
  });

  test('does not submit while an added option is empty', () => {
    mount();
    fillOptions();
    act(() => {
      useAppConfigStore.getState().setIsConfigReadyTrue();
      api.handleAddOptionPress();
    });

    expect(api.canSubmit).toBe(false);

    act(() => api.handleOptionChange(2, '  '));

    expect(api.canSubmit).toBe(false);

    act(() => api.handleRemoveOptionPress(2));

    expect(api.canSubmit).toBe(true);
  });

  test('removes an added option and keeps the rows below it', () => {
    mount();
    fillOptions();
    act(() => {
      api.handleAddOptionPress();
      api.handleAddOptionPress();
    });
    act(() => {
      api.handleOptionChange(2, 'Juice');
      api.handleOptionChange(3, 'Milk');
    });
    const milkKey = api.options[3].key;

    act(() => api.handleRemoveOptionPress(2));

    expect(texts()).toEqual(['Tea', 'Coffee', 'Milk']);
    expect(api.options[2]).toMatchObject({ key: milkKey, isRemovable: true });
    expect(api.canAddOption).toBe(true);
  });

  test('keeps the first two options', () => {
    mount();
    fillOptions();

    act(() => api.handleRemoveOptionPress(1));

    expect(texts()).toEqual(['Tea', 'Coffee']);
  });

  test('focuses a row added after a removal', () => {
    mount();
    act(() => api.handleAddOptionPress());
    const removedKey = api.options[2].key;
    act(() => api.handleRemoveOptionPress(2));
    act(() => api.handleAddOptionPress());

    expect(api.options[2].key).not.toBe(removedKey);
    expect(api.autoFocusKey).toBe(api.options[2].key);
  });

  test('turns line breaks into spaces', () => {
    mount();
    act(() => api.handleOptionChange(0, 'Green\ntea'));

    expect(api.options[0].text).toBe('Green tea');
  });

  test('brings back the options of a cancelled decision', () => {
    useQuizStore.getState().startQuiz(['Tea', 'Coffee', 'Juice']);
    mount();

    expect(texts()).toEqual(['Tea', 'Coffee', 'Juice']);
    expect(api.options[2].isRemovable).toBe(true);
  });
});
