import TestRenderer, { act, ReactTestRenderer } from 'react-test-renderer';
import { useHistory } from '../src/navigation/screens/HistoryScreen/useHistory';
import { useHistoryStore } from '../src/store/useHistoryStore';

const mockNavigation = { navigate: jest.fn() };

jest.mock('../src/navigation', () => ({
  useAppNavigation: () => mockNavigation,
}));

let api: ReturnType<typeof useHistory>;

function Probe() {
  api = useHistory();
  return null;
}

const addEntry = () =>
  useHistoryStore.getState().addEntry({
    options: ['Tea', 'Coffee'],
    winner: 'Tea',
    explanation: 'It keeps you calm.',
    questions: [],
    answers: [],
  });

describe('useHistory', () => {
  let renderer: ReactTestRenderer | null = null;

  beforeEach(() => {
    jest.clearAllMocks();
    useHistoryStore.setState({ entries: [] });
    act(() => {
      renderer = TestRenderer.create(<Probe />);
    });
  });

  afterEach(() => {
    act(() => renderer?.unmount());
    renderer = null;
  });

  test('shows new decisions as they are saved', () => {
    expect(api.entries).toEqual([]);

    act(() => {
      addEntry();
    });

    expect(api.entries).toHaveLength(1);
  });

  test('opens the details of the pressed decision', () => {
    act(() => api.handleEntryPress('saved'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('HistoryDetails', {
      id: 'saved',
    });
  });

  test('asks before deleting a long-pressed decision', () => {
    let id = '';
    act(() => {
      id = addEntry();
    });

    act(() => api.handleEntryLongPress(id));

    expect(api.isDeleteDialogVisible).toBe(true);
    expect(mockNavigation.navigate).not.toHaveBeenCalled();

    act(() => api.handleDeleteConfirm());

    expect(api.isDeleteDialogVisible).toBe(false);
    expect(api.entries).toEqual([]);
  });

  test('starts a decision from the empty state', () => {
    act(() => api.handleStartDecisionPress());

    expect(mockNavigation.navigate).toHaveBeenCalledWith('NewDecisionTab');
  });
});
