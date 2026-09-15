import TestRenderer, { act, ReactTestRenderer } from 'react-test-renderer';
import { Alert } from 'react-native';
import { useHistoryDetails } from '../src/navigation/screens/HistoryDetailsScreen/useHistoryDetails';
import { HistoryEntry, useHistoryStore } from '../src/store/useHistoryStore';

const mockNavigation = { goBack: jest.fn() };

jest.mock('../src/navigation', () => ({
  useAppNavigation: () => mockNavigation,
}));

const entry: HistoryEntry = {
  id: 'saved',
  firstOption: 'Tea',
  secondOption: 'Coffee',
  questions: [
    { question: 'Hot or cold?', options: ['Hot', 'Cold'] },
    { question: 'Morning or evening?', options: ['Morning', 'Evening'] },
  ],
  answers: [1, 0],
  result: 'Pick tea',
  createdAt: 1,
};

let api: ReturnType<typeof useHistoryDetails>;

function Probe({ id }: { id: string }) {
  api = useHistoryDetails(id);
  return null;
}

describe('useHistoryDetails', () => {
  let renderer: ReactTestRenderer | null = null;

  function mount(id: string) {
    act(() => {
      renderer = TestRenderer.create(<Probe id={id} />);
    });
  }

  beforeEach(() => {
    mockNavigation.goBack.mockClear();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    useHistoryStore.setState({ entries: [entry] });
  });

  afterEach(() => {
    act(() => renderer?.unmount());
    renderer = null;
    jest.restoreAllMocks();
  });

  test('shows every option and marks the chosen one', () => {
    mount('saved');

    expect(api.entry).toBe(entry);
    expect(api.answeredQuestions).toEqual([
      {
        question: 'Hot or cold?',
        options: [
          { text: 'Hot', isChosen: false },
          { text: 'Cold', isChosen: true },
        ],
      },
      {
        question: 'Morning or evening?',
        options: [
          { text: 'Morning', isChosen: true },
          { text: 'Evening', isChosen: false },
        ],
      },
    ]);
  });

  test('shows nothing for an unknown decision', () => {
    mount('missing');

    expect(api.entry).toBeUndefined();
    expect(api.answeredQuestions).toEqual([]);
  });

  test('goes back to the list', () => {
    mount('saved');

    act(() => api.handleBackPress());

    expect(mockNavigation.goBack).toHaveBeenCalledTimes(1);
  });

  test('closes and deletes the decision once confirmed', () => {
    mount('saved');

    act(() => api.handleDeletePress());

    expect(mockNavigation.goBack).not.toHaveBeenCalled();

    const buttons = jest.mocked(Alert.alert).mock.calls[0][2] ?? [];
    act(() => {
      buttons.find(button => button.style === 'destructive')?.onPress?.();
    });

    expect(mockNavigation.goBack).toHaveBeenCalledTimes(1);
    expect(useHistoryStore.getState().entries).toEqual([]);
    // The closing screen keeps its content instead of going blank.
    expect(api.entry).toBe(entry);
  });
});
