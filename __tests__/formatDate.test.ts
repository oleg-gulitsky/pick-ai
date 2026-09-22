import { formatDateTime, formatDay } from '../src/tools/formatDate';

const now = new Date(2026, 8, 17, 12, 0).getTime();

describe('formatDay', () => {
  test('says today for a decision made today', () => {
    expect(formatDay(new Date(2026, 8, 17, 0, 5).getTime(), now)).toBe('TODAY');
  });

  test('shows the day and month for an earlier day this year', () => {
    expect(formatDay(new Date(2026, 8, 3, 23, 59).getTime(), now)).toBe(
      '3 SEP',
    );
  });

  test('adds the year for another year', () => {
    expect(formatDay(new Date(2025, 11, 31).getTime(), now)).toBe(
      '31 DEC 2025',
    );
  });
});

describe('formatDateTime', () => {
  test('shows the day, month and padded time', () => {
    expect(formatDateTime(new Date(2026, 8, 16, 9, 5).getTime(), now)).toBe(
      '16 SEP, 09:05',
    );
  });

  test('adds the year for another year', () => {
    expect(formatDateTime(new Date(2025, 0, 2, 16, 48).getTime(), now)).toBe(
      '2 JAN 2025, 16:48',
    );
  });
});
