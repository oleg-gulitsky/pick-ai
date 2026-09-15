import {
  MAX_OPTIONS,
  MAX_QUESTIONS,
  MIN_OPTIONS,
  MIN_QUESTIONS,
  isQuestion,
  isQuestionArray,
} from '../src/appTypes/Question';

const validQuestion = {
  question: 'What is your budget?',
  options: ['Low', 'High'],
};

const optionsOf = (count: number) =>
  Array.from({ length: count }, (_, i) => `Option ${i + 1}`);

const questionsOf = (count: number) => Array(count).fill(validQuestion);

describe('isQuestion', () => {
  test.each([MIN_OPTIONS, MAX_OPTIONS])(
    'accepts a question with %i options',
    count => {
      expect(
        isQuestion({
          question: 'What is your budget?',
          options: optionsOf(count),
        }),
      ).toBe(true);
    },
  );

  test.each([
    ['null', null],
    ['a string', 'What is your budget?'],
    ['missing question', { options: ['Low', 'High'] }],
    ['non-string question', { question: 42, options: ['Low', 'High'] }],
    ['empty question', { question: '', options: ['Low', 'High'] }],
    ['whitespace-only question', { question: '   ', options: ['Low', 'High'] }],
    ['missing options', { question: 'What is your budget?' }],
    ['non-array options', { question: 'What is your budget?', options: 'Low' }],
    [
      'non-string option',
      { question: 'What is your budget?', options: ['Low', 2] },
    ],
    [
      'empty option',
      { question: 'What is your budget?', options: ['Low', ' '] },
    ],
    [
      'too few options',
      { question: 'What is your budget?', options: optionsOf(MIN_OPTIONS - 1) },
    ],
    [
      'too many options',
      { question: 'What is your budget?', options: optionsOf(MAX_OPTIONS + 1) },
    ],
  ])('rejects %s', (_, value) => {
    expect(isQuestion(value)).toBe(false);
  });
});

describe('isQuestionArray', () => {
  test.each([MIN_QUESTIONS, MAX_QUESTIONS])(
    'accepts %i valid questions',
    count => {
      expect(isQuestionArray(questionsOf(count))).toBe(true);
    },
  );

  test('rejects an array with an invalid element', () => {
    expect(
      isQuestionArray([
        ...questionsOf(MIN_QUESTIONS - 1),
        { question: 'Broken' },
      ]),
    ).toBe(false);
  });

  test.each([
    ['an empty array', []],
    ['too few questions', questionsOf(MIN_QUESTIONS - 1)],
    ['too many questions', questionsOf(MAX_QUESTIONS + 1)],
  ])('rejects %s', (_, value) => {
    expect(isQuestionArray(value)).toBe(false);
  });

  test('rejects non-arrays', () => {
    expect(isQuestionArray(validQuestion)).toBe(false);
    expect(isQuestionArray(null)).toBe(false);
  });
});
