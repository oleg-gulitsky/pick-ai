import {
  formatQuestionsResponse,
  formatResultResponse,
} from '../src/services/ai/responseFormatter';

const questions = [
  { question: 'What is your budget?', options: ['Low', 'High'] },
  {
    question: 'How much time do you have?',
    options: ['Little', 'Some', 'Plenty'],
  },
];
const json = JSON.stringify(questions);

describe('formatQuestionsResponse', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('parses a bare JSON array', () => {
    expect(formatQuestionsResponse(json)).toEqual(questions);
  });

  test('parses a ```json fenced block', () => {
    expect(formatQuestionsResponse('```json\n' + json + '\n```')).toEqual(
      questions,
    );
  });

  test('parses a ```javascript fenced block', () => {
    expect(formatQuestionsResponse('```javascript\n' + json + '\n```')).toEqual(
      questions,
    );
  });

  test('parses pretty-printed JSON', () => {
    expect(formatQuestionsResponse(JSON.stringify(questions, null, 2))).toEqual(
      questions,
    );
  });

  test('returns null for malformed JSON', () => {
    expect(formatQuestionsResponse('[{"question":')).toBeNull();
  });

  test('returns null for JSON of the wrong shape', () => {
    expect(formatQuestionsResponse('{"question":"Q","options":[]}')).toBeNull();
  });

  test('returns null for a plain-text answer', () => {
    expect(
      formatQuestionsResponse('Sorry, I cannot help with that.'),
    ).toBeNull();
  });

  // Known bug, see IMPROVEMENTS.md 2.4. Switch to `test` once fixed.
  test.failing('keeps escaped quotes inside string values', () => {
    const withQuotes = [{ question: 'Is it "cheap"?', options: ['Yes', 'No'] }];
    expect(formatQuestionsResponse(JSON.stringify(withQuotes))).toEqual(
      withQuotes,
    );
  });
});

describe('formatResultResponse', () => {
  test('trims surrounding whitespace', () => {
    expect(formatResultResponse('\n  Pick the first one.  \n')).toBe(
      'Pick the first one.',
    );
  });
});
