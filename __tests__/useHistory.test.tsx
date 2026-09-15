import TestRenderer, { act, ReactTestRenderer } from 'react-test-renderer';
import { Alert } from 'react-native';
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
    jest.restoreAllMocks();
  });

  test('shows new decisions as they are saved', () => {
    expect(api.entries).toEqual([]);

    act(() => {
      useHistoryStore.getState().addEntry({
        firstOption: 'Tea',
        secondOption: 'Coffee',
        questions: [],
        answers: [],
        result: 'Pick tea',
      });
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
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    act(() => api.handleEntryLongPress('saved'));

    expect(Alert.alert).toHaveBeenCalledTimes(1);
    expect(mockNavigation.navigate).not.toHaveBeenCalled();
  });
});
