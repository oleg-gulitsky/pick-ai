import AsyncStorage from '@react-native-async-storage/async-storage';
import { HistoryEntry, useHistoryStore } from '../src/store/useHistoryStore';

const STORAGE_KEY = 'decision-history';

const flushPromises = () => new Promise(resolve => setImmediate(resolve));

const questions = [{ question: 'Hot or cold?', options: ['Hot', 'Cold'] }];

const addEntry = (options = ['Tea', 'Coffee']) =>
  useHistoryStore.getState().addEntry({
    options,
    winner: options[0],
    explanation: 'It keeps you calm.',
    questions,
    answers: [1],
  });

describe('useHistoryStore', () => {
  beforeEach(async () => {
    useHistoryStore.setState({ entries: [] });
    await AsyncStorage.clear();
  });

  test('puts the newest decision first', () => {
    addEntry(['Tea', 'Coffee']);
    addEntry(['Cats', 'Dogs', 'Fish']);

    const { entries } = useHistoryStore.getState();

    expect(entries.map(entry => entry.winner)).toEqual(['Cats', 'Tea']);
    expect(entries[0]).toMatchObject({
      options: ['Cats', 'Dogs', 'Fish'],
      explanation: 'It keeps you calm.',
      questions,
      answers: [1],
      createdAt: expect.any(Number),
    });
    expect(entries[0].id).not.toBe(entries[1].id);
  });

  test('returns the id of the saved decision', () => {
    const id = addEntry();

    expect(useHistoryStore.getState().entries[0].id).toBe(id);
  });

  test('keeps every decision', () => {
    for (let i = 0; i < 100; i++) {
      addEntry([`Option ${i}`, 'Other']);
    }

    const { entries } = useHistoryStore.getState();

    expect(entries).toHaveLength(100);
    expect(entries[99].winner).toBe('Option 0');
  });

  test('removes only the deleted decision', () => {
    addEntry(['Tea', 'Coffee']);
    addEntry(['Cats', 'Dogs']);
    const [newest, oldest] = useHistoryStore.getState().entries;

    useHistoryStore.getState().removeEntry(newest.id);

    expect(useHistoryStore.getState().entries).toEqual([oldest]);
  });

  test('clears every decision', async () => {
    addEntry(['Tea', 'Coffee']);
    addEntry(['Cats', 'Dogs']);

    useHistoryStore.getState().clearHistory();
    await flushPromises();

    const stored = JSON.parse((await AsyncStorage.getItem(STORAGE_KEY))!);

    expect(useHistoryStore.getState().entries).toEqual([]);
    expect(stored.state.entries).toEqual([]);
  });

  test('writes only the entries to storage', async () => {
    addEntry();
    await flushPromises();

    const stored = JSON.parse((await AsyncStorage.getItem(STORAGE_KEY))!);

    expect(Object.keys(stored.state)).toEqual(['entries']);
    expect(stored.state.entries).toHaveLength(1);
  });

  test('restores the entries saved by a previous launch', async () => {
    const entry: HistoryEntry = {
      id: 'saved',
      options: ['Tea', 'Coffee'],
      winner: 'Tea',
      explanation: 'It keeps you calm.',
      questions,
      answers: [0],
      createdAt: 1,
    };
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state: { entries: [entry] }, version: 2 }),
    );

    await useHistoryStore.persist.rehydrate();

    expect(useHistoryStore.getState().entries).toEqual([entry]);
    expect(typeof useHistoryStore.getState().addEntry).toBe('function');
  });

  test('keeps decisions saved before options became a list', async () => {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        state: {
          entries: [
            {
              id: 'legacy',
              firstOption: 'Tea',
              secondOption: 'Coffee',
              questions,
              answers: [0],
              result: 'Pick tea, it keeps you calm.',
              createdAt: 1,
            },
          ],
        },
        version: 1,
      }),
    );

    await useHistoryStore.persist.rehydrate();

    expect(useHistoryStore.getState().entries).toEqual([
      {
        id: 'legacy',
        options: ['Tea', 'Coffee'],
        winner: '',
        explanation: 'Pick tea, it keeps you calm.',
        questions,
        answers: [0],
        createdAt: 1,
      },
    ]);
  });
});
