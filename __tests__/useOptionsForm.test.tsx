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

function Probe() {
  api = useOptionsForm();
  return null;
}

describe('useOptionsForm', () => {
  let renderer: ReactTestRenderer | null = null;

  function fillOptions() {
    act(() => {
      api.handleFirstOptionChange('Tea');
      api.handleSecondOptionChange('Coffee');
    });
  }

  beforeEach(() => {
    jest.resetAllMocks();
    useAppConfigStore.setState({ isConfigReady: false });
    usePendingStore.getState().setIsPendingFalse();
    useQuizStore.getState().resetQuiz();
    act(() => {
      renderer = TestRenderer.create(<Probe />);
    });
  });

  afterEach(() => {
    act(() => renderer?.unmount());
    renderer = null;
  });

  test('does not submit before the config is ready', () => {
    fillOptions();

    expect(api.canSubmit).toBe(false);

    act(() => api.handleSubmit());

    expect(mockNavigation.replace).not.toHaveBeenCalled();
    expect(tryShowInterstitial).not.toHaveBeenCalled();
    expect(useQuizStore.getState().firstOption).toBe('');
    expect(usePendingStore.getState().isPending).toBe(false);
  });

  test('submits once the config is ready', () => {
    fillOptions();
    act(() => useAppConfigStore.getState().setIsConfigReadyTrue());

    expect(api.canSubmit).toBe(true);

    act(() => api.handleSubmit());

    expect(mockNavigation.replace).toHaveBeenCalledWith('Quiz');
    expect(useQuizStore.getState().firstOption).toBe('Tea');
    expect(useQuizStore.getState().secondOption).toBe('Coffee');
  });

  test('does not submit with an empty option', () => {
    act(() => {
      useAppConfigStore.getState().setIsConfigReadyTrue();
      api.handleFirstOptionChange('Tea');
    });

    expect(api.canSubmit).toBe(false);
  });

  test('does not submit while a request is pending', () => {
    fillOptions();
    act(() => {
      useAppConfigStore.getState().setIsConfigReadyTrue();
      usePendingStore.getState().setIsPendingTrue();
    });

    expect(api.canSubmit).toBe(false);
  });
});
