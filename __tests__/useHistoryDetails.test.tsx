import TestRenderer, { act, ReactTestRenderer } from 'react-test-renderer';
import { useHistoryDetails } from '../src/navigation/screens/HistoryDetailsScreen/useHistoryDetails';
import { HistoryEntry, useHistoryStore } from '../src/store/useHistoryStore';

const mockNavigation = { goBack: jest.fn() };

jest.mock('../src/navigation', () => ({
  useAppNavigation: () => mockNavigation,
}));

const entry: HistoryEntry = {
  id: 'saved',
  options: ['Tea', 'Coffee'],
  winner: 'Tea',
  explanation: 'It keeps you calm.',
  questions: [
    { question: 'Hot or cold?', options: ['Hot', 'Cold'] },
    { question: 'Morning or evening?', options: ['Morning', 'Evening'] },
  ],
  answers: [1, 0],
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
    useHistoryStore.setState({ entries: [entry] });
  });

  afterEach(() => {
    act(() => renderer?.unmount());
    renderer = null;
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

    expect(api.isDeleteDialogVisible).toBe(true);
    expect(mockNavigation.goBack).not.toHaveBeenCalled();

    act(() => api.handleDeleteConfirm());

    expect(mockNavigation.goBack).toHaveBeenCalledTimes(1);
    expect(useHistoryStore.getState().entries).toEqual([]);
    // The closing screen keeps its content instead of going blank.
    expect(api.entry).toBe(entry);
  });

  test('keeps the decision when the deletion is cancelled', () => {
    mount('saved');

    act(() => api.handleDeletePress());
    act(() => api.handleDeleteCancel());

    expect(api.isDeleteDialogVisible).toBe(false);
    expect(mockNavigation.goBack).not.toHaveBeenCalled();
    expect(useHistoryStore.getState().entries).toEqual([entry]);
  });
});
