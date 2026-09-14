import { isQuestion, isQuestionArray } from '../src/appTypes/Question';

const validQuestion = {
  question: 'What is your budget?',
  options: ['Low', 'High'],
};

describe('isQuestion', () => {
  test('accepts a question with string options', () => {
    expect(isQuestion(validQuestion)).toBe(true);
  });

  test.each([
    ['null', null],
    ['a string', 'What is your budget?'],
    ['missing question', { options: ['Low', 'High'] }],
    ['non-string question', { question: 42, options: ['Low', 'High'] }],
    ['missing options', { question: 'What is your budget?' }],
    ['non-array options', { question: 'What is your budget?', options: 'Low' }],
    [
      'non-string option',
      { question: 'What is your budget?', options: ['Low', 2] },
    ],
  ])('rejects %s', (_, value) => {
    expect(isQuestion(value)).toBe(false);
  });
});

describe('isQuestionArray', () => {
  test('accepts an array of valid questions', () => {
    expect(isQuestionArray([validQuestion, validQuestion])).toBe(true);
  });

  test('rejects an array with an invalid element', () => {
    expect(isQuestionArray([validQuestion, { question: 'Broken' }])).toBe(
      false,
    );
  });

  test('rejects non-arrays', () => {
    expect(isQuestionArray(validQuestion)).toBe(false);
    expect(isQuestionArray(null)).toBe(false);
  });

  // Known bug, see IMPROVEMENTS.md 2.3. Switch to `test` once fixed.
  test.failing('rejects an empty array', () => {
    expect(isQuestionArray([])).toBe(false);
  });
});
