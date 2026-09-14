import { safeParse } from '../src/tools/safeParse';

const isNumberArray = (x: any): x is number[] =>
  Array.isArray(x) && x.every(n => typeof n === 'number');

describe('safeParse', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('returns parsed value when it passes the validator', () => {
    expect(safeParse('[1, 2, 3]', isNumberArray)).toEqual([1, 2, 3]);
  });

  test('returns null when parsed value fails the validator', () => {
    expect(safeParse('["a", "b"]', isNumberArray)).toBeNull();
    expect(safeParse('{"a": 1}', isNumberArray)).toBeNull();
  });

  test('returns null on malformed JSON', () => {
    expect(safeParse('[1, 2', isNumberArray)).toBeNull();
  });

  test('returns null on empty input', () => {
    expect(safeParse('', isNumberArray)).toBeNull();
  });
});
