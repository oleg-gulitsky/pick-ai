import TestRenderer, { act, ReactTestRenderer } from 'react-test-renderer';
import { Alert, AlertButton } from 'react-native';
import { useSettings } from '../src/navigation/screens/SettingsScreen/useSettings';
import { HistoryEntry, useHistoryStore } from '../src/store/useHistoryStore';

const createEntry = (id: string): HistoryEntry => ({
  id,
  firstOption: 'Tea',
  secondOption: 'Coffee',
  questions: [],
  answers: [],
  result: 'Pick tea',
  createdAt: 1,
});

function pressAlertButton(style: AlertButton['style']) {
  const buttons = jest.mocked(Alert.alert).mock.calls[0][2] ?? [];
  act(() => {
    buttons.find(button => button.style === style)?.onPress?.();
  });
}

let api: ReturnType<typeof useSettings>;

function Probe() {
  api = useSettings();
  return null;
}

describe('useSettings', () => {
  let renderer: ReactTestRenderer | null = null;

  beforeEach(() => {
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    useHistoryStore.setState({
      entries: [createEntry('first'), createEntry('second')],
    });
    act(() => {
      renderer = TestRenderer.create(<Probe />);
    });
  });

  afterEach(() => {
    act(() => renderer?.unmount());
    renderer = null;
    jest.restoreAllMocks();
  });

  test('shows how many decisions are saved', () => {
    expect(api.historySize).toBe(2);
    expect(api.canClearHistory).toBe(true);
  });

  test('clears the history once confirmed', () => {
    act(() => api.handleClearHistoryPress());

    expect(useHistoryStore.getState().entries).toHaveLength(2);

    pressAlertButton('destructive');

    expect(useHistoryStore.getState().entries).toEqual([]);
    expect(api.historySize).toBe(0);
    expect(api.canClearHistory).toBe(false);
  });

  test('keeps the history when cancelled', () => {
    act(() => api.handleClearHistoryPress());
    pressAlertButton('cancel');

    expect(useHistoryStore.getState().entries).toHaveLength(2);
  });
});
