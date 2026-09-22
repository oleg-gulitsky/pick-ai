import TestRenderer, { act, ReactTestRenderer } from 'react-test-renderer';
import { useSettings } from '../src/navigation/screens/SettingsScreen/useSettings';
import { HistoryEntry, useHistoryStore } from '../src/store/useHistoryStore';
import { useSettingsStore } from '../src/store/useSettingsStore';

const createEntry = (id: string): HistoryEntry => ({
  id,
  options: ['Tea', 'Coffee'],
  winner: 'Tea',
  explanation: 'It keeps you calm.',
  questions: [],
  answers: [],
  createdAt: 1,
});

let api: ReturnType<typeof useSettings>;

function Probe() {
  api = useSettings();
  return null;
}

describe('useSettings', () => {
  let renderer: ReactTestRenderer | null = null;

  beforeEach(() => {
    useHistoryStore.setState({
      entries: [createEntry('first'), createEntry('second')],
    });
    useSettingsStore.setState({
      theme: 'system',
      questionRange: [7, 10],
      answerRange: [2, 4],
    });
    act(() => {
      renderer = TestRenderer.create(<Probe />);
    });
  });

  afterEach(() => {
    act(() => renderer?.unmount());
    renderer = null;
  });

  test('shows how many decisions are saved', () => {
    expect(api.historySize).toBe(2);
    expect(api.canClearHistory).toBe(true);
  });

  test('clears the history once confirmed', () => {
    act(() => api.handleClearHistoryPress());

    expect(api.isClearDialogVisible).toBe(true);
    expect(useHistoryStore.getState().entries).toHaveLength(2);

    act(() => api.handleClearHistoryConfirm());

    expect(api.isClearDialogVisible).toBe(false);
    expect(useHistoryStore.getState().entries).toEqual([]);
    expect(api.historySize).toBe(0);
    expect(api.canClearHistory).toBe(false);
  });

  test('keeps the history when cancelled', () => {
    act(() => api.handleClearHistoryPress());
    act(() => api.handleClearHistoryCancel());

    expect(api.isClearDialogVisible).toBe(false);
    expect(useHistoryStore.getState().entries).toHaveLength(2);
  });

  test('saves the theme and both ranges', () => {
    act(() => {
      api.handleThemeChange('dark');
      api.handleQuestionRangeChange([5, 8]);
      api.handleAnswerRangeChange([3, 3]);
    });

    expect(api.theme).toBe('dark');
    expect(api.questionRange).toEqual([5, 8]);
    expect(api.answerRange).toEqual([3, 3]);
    expect(useSettingsStore.getState()).toMatchObject({
      theme: 'dark',
      questionRange: [5, 8],
      answerRange: [3, 3],
    });
  });
});
