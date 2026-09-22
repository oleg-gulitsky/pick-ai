import { STRINGS } from '../constants/strings';

export function formatDay(timestamp: number, now = Date.now()): string {
  const date = new Date(timestamp);
  const today = new Date(now);

  if (date.toDateString() === today.toDateString()) {
    return STRINGS.HISTORY_TODAY;
  }

  return formatCalendarDay(date, today);
}

export function formatDateTime(timestamp: number, now = Date.now()): string {
  const date = new Date(timestamp);
  const time = [date.getHours(), date.getMinutes()]
    .map(part => String(part).padStart(2, '0'))
    .join(':');

  return `${formatCalendarDay(date, new Date(now))}, ${time}`;
}

const MONTHS = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
];

function formatCalendarDay(date: Date, today: Date): string {
  const day = `${date.getDate()} ${MONTHS[date.getMonth()]}`;

  return date.getFullYear() === today.getFullYear()
    ? day
    : `${day} ${date.getFullYear()}`;
}
