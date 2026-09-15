import TestRenderer, { act, ReactTestRenderer } from 'react-test-renderer';
import { Alert, AlertButton } from 'react-native';
import { useDeleteHistoryEntry } from '../src/hooks/useDeleteHistoryEntry';
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

const entryIds = () => useHistoryStore.getState().entries.map(({ id }) => id);

let deleteEntry: ReturnType<typeof useDeleteHistoryEntry>;

function Probe() {
  deleteEntry = useDeleteHistoryEntry();
  return null;
}

describe('useDeleteHistoryEntry', () => {
  let renderer: ReactTestRenderer | null = null;
  const onDeleted = jest.fn();

  beforeEach(() => {
    onDeleted.mockClear();
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

  test('asks for confirmation before deleting', () => {
    act(() => deleteEntry('first', onDeleted));

    expect(Alert.alert).toHaveBeenCalledTimes(1);
    expect(entryIds()).toEqual(['first', 'second']);
    expect(onDeleted).not.toHaveBeenCalled();
  });

  test('deletes the decision once confirmed', () => {
    act(() => deleteEntry('first', onDeleted));
    pressAlertButton('destructive');

    expect(entryIds()).toEqual(['second']);
    expect(onDeleted).toHaveBeenCalledTimes(1);
  });

  test('keeps the decision when cancelled', () => {
    act(() => deleteEntry('first', onDeleted));
    pressAlertButton('cancel');

    expect(entryIds()).toEqual(['first', 'second']);
    expect(onDeleted).not.toHaveBeenCalled();
  });
});
