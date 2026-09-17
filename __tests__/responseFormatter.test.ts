import { MIN_QUESTIONS } from '../src/appTypes/Question';
import {
  formatQuestionsResponse,
  formatResultResponse,
} from '../src/navigation/screens/QuizScreen/useQuiz/useAIRequests/responseFormatter';

const questions = Array.from({ length: MIN_QUESTIONS }, (_, i) => ({
  question: `Question ${i + 1}?`,
  options: ['Low', 'Some', 'Plenty'],
}));
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

  test('parses questions wrapped in an object', () => {
    expect(formatQuestionsResponse(JSON.stringify({ questions }))).toEqual(
      questions,
    );
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

  test('returns null for an empty array', () => {
    expect(formatQuestionsResponse('[]')).toBeNull();
  });

  test('returns null for a wrapper without valid questions', () => {
    expect(formatQuestionsResponse('{"questions":[]}')).toBeNull();
  });

  test('returns null for a plain-text answer', () => {
    expect(
      formatQuestionsResponse('Sorry, I cannot help with that.'),
    ).toBeNull();
  });

  test('parses a fenced block without a language tag', () => {
    expect(formatQuestionsResponse('\n```\n' + json + '\n```\n')).toEqual(
      questions,
    );
  });

  test('keeps escaped quotes inside string values', () => {
    const withQuotes = [
      { question: 'Is it "cheap"?', options: ['Yes', 'No'] },
      ...questions.slice(1),
    ];
    expect(formatQuestionsResponse(JSON.stringify(withQuotes))).toEqual(
      withQuotes,
    );
  });

  test('keeps escaped line breaks inside string values', () => {
    const withLineBreak = [
      { question: 'First line\nSecond line', options: ['Yes', 'No'] },
      ...questions.slice(1),
    ];
    expect(
      formatQuestionsResponse(
        '```json\n' + JSON.stringify(withLineBreak) + '\n```',
      ),
    ).toEqual(withLineBreak);
  });

  test('decodes unicode escapes inside string values', () => {
    const escaped = json.replace('Question 1?', 'Caf\\u00e9?');
    expect(formatQuestionsResponse(escaped)?.[0].question).toBe('Café?');
  });
});

describe('formatResultResponse', () => {
  test('trims surrounding whitespace', () => {
    expect(formatResultResponse('\n  Pick the first one.  \n')).toBe(
      'Pick the first one.',
    );
  });

  test('returns null for a blank answer', () => {
    expect(formatResultResponse(' \n ')).toBeNull();
  });
});
