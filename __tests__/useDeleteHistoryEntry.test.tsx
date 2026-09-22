import TestRenderer, { act, ReactTestRenderer } from 'react-test-renderer';
import { useDeleteHistoryEntry } from '../src/hooks/useDeleteHistoryEntry';
import { HistoryEntry, useHistoryStore } from '../src/store/useHistoryStore';

const createEntry = (id: string): HistoryEntry => ({
  id,
  options: ['Tea', 'Coffee'],
  winner: 'Tea',
  explanation: 'It keeps you calm.',
  questions: [],
  answers: [],
  createdAt: 1,
});

const entryIds = () => useHistoryStore.getState().entries.map(({ id }) => id);

let api: ReturnType<typeof useDeleteHistoryEntry>;

function Probe() {
  api = useDeleteHistoryEntry();
  return null;
}

describe('useDeleteHistoryEntry', () => {
  let renderer: ReactTestRenderer | null = null;
  const onDeleted = jest.fn();

  beforeEach(() => {
    onDeleted.mockClear();
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
  });

  test('asks for confirmation before deleting', () => {
    expect(api.isDeleteDialogVisible).toBe(false);

    act(() => api.requestDelete('first', onDeleted));

    expect(api.isDeleteDialogVisible).toBe(true);
    expect(entryIds()).toEqual(['first', 'second']);
    expect(onDeleted).not.toHaveBeenCalled();
  });

  test('deletes the decision once confirmed', () => {
    act(() => api.requestDelete('first', onDeleted));
    act(() => api.confirmDelete());

    expect(api.isDeleteDialogVisible).toBe(false);
    expect(entryIds()).toEqual(['second']);
    expect(onDeleted).toHaveBeenCalledTimes(1);
  });

  test('keeps the decision when cancelled', () => {
    act(() => api.requestDelete('first', onDeleted));
    act(() => api.cancelDelete());

    expect(api.isDeleteDialogVisible).toBe(false);
    expect(entryIds()).toEqual(['first', 'second']);
    expect(onDeleted).not.toHaveBeenCalled();
  });

  test('deletes nothing when confirmed without a request', () => {
    act(() => api.confirmDelete());

    expect(entryIds()).toEqual(['first', 'second']);
  });
});
