import AsyncStorage from '@react-native-async-storage/async-storage';
import { HistoryEntry, useHistoryStore } from '../src/store/useHistoryStore';

const STORAGE_KEY = 'decision-history';

const flushPromises = () => new Promise(resolve => setImmediate(resolve));

const questions = [{ question: 'Hot or cold?', options: ['Hot', 'Cold'] }];

const addEntry = (firstOption = 'Tea', secondOption = 'Coffee') =>
  useHistoryStore.getState().addEntry({
    firstOption,
    secondOption,
    questions,
    answers: [1],
    result: 'Pick tea',
  });

describe('useHistoryStore', () => {
  beforeEach(async () => {
    useHistoryStore.setState({ entries: [] });
    await AsyncStorage.clear();
  });

  test('puts the newest decision first', () => {
    addEntry('Tea', 'Coffee');
    addEntry('Cats', 'Dogs');

    const { entries } = useHistoryStore.getState();

    expect(entries.map(entry => entry.firstOption)).toEqual(['Cats', 'Tea']);
    expect(entries[0]).toMatchObject({
      secondOption: 'Dogs',
      questions,
      answers: [1],
      result: 'Pick tea',
      createdAt: expect.any(Number),
    });
    expect(entries[0].id).not.toBe(entries[1].id);
  });

  test('keeps every decision', () => {
    for (let i = 0; i < 100; i++) {
      addEntry(`Option ${i}`);
    }

    const { entries } = useHistoryStore.getState();

    expect(entries).toHaveLength(100);
    expect(entries[99].firstOption).toBe('Option 0');
  });

  test('removes only the deleted decision', () => {
    addEntry('Tea', 'Coffee');
    addEntry('Cats', 'Dogs');
    const [newest, oldest] = useHistoryStore.getState().entries;

    useHistoryStore.getState().removeEntry(newest.id);

    expect(useHistoryStore.getState().entries).toEqual([oldest]);
  });

  test('clears every decision', async () => {
    addEntry('Tea', 'Coffee');
    addEntry('Cats', 'Dogs');

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
      firstOption: 'Tea',
      secondOption: 'Coffee',
      questions,
      answers: [0],
      result: 'Pick tea',
      createdAt: 1,
    };
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state: { entries: [entry] }, version: 1 }),
    );

    await useHistoryStore.persist.rehydrate();

    expect(useHistoryStore.getState().entries).toEqual([entry]);
    expect(typeof useHistoryStore.getState().addEntry).toBe('function');
  });
});
