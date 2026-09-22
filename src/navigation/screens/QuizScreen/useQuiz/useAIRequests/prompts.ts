import { Question } from '../../../../../appTypes/Question';
import { Range } from '../../../../../store/useSettingsStore';

export type QuizRanges = {
  questionRange: Range;
  answerRange: Range;
};

export function buildQuestionsPrompt(
  options: string[],
  { questionRange, answerRange }: QuizRanges,
): string {
  const optionsText = formatOptionList(options);
  const questionsCount = formatRange(questionRange);
  const answersCount = formatRange(answerRange);
  const [minAnswers, maxAnswers] = answerRange;
  const longExample = formatExampleAnswers(maxAnswers);
  const shortExample = formatExampleAnswers(minAnswers);
  const optionsToTellApart =
    options.length > 2 ? 'all the options' : 'the two options';

  return `You are helping someone choose between ${optionsText}.

Create ${questionsCount} questions to help make this decision. Each question must have ${answersCount} answer options.

REQUIRED FORMAT - Return ONLY a JSON object with a "questions" array, nothing else:
{"questions":[{"question":"text here","options":${longExample}},{"question":"text here","options":${shortExample}}]}

RULES:
- Return ONLY the JSON object
- No markdown, no code blocks, no explanations
- Create ${questionsCount} questions
- Each question must have ${answersCount} options
- Each question must be clear and simple
- Questions must help tell ${optionsToTellApart} apart
- Options should be short (2-5 words)
- Must be valid JSON that works with JSON.parse()

Now create ${questionsCount} questions for choosing between ${optionsText}:`;
}

export function buildResultPrompt(
  options: string[],
  questions: Question[],
  answers: number[],
): string {
  const optionsText = formatOptionList(options);
  const answersText = questions
    .map((q, i) => `Q: ${q.question}\nA: ${q.options[answers[i]]}`)
    .join('\n\n');

  return `Someone is choosing between ${optionsText}. These are their answers:

${answersText}

YOUR TASK:
1. Choose exactly one of: ${options.map(option => `"${option}"`).join(', ')}
2. Explain your choice in 2-3 short sentences, addressed to the person as "you"
3. Use simple language, no formatting, no bullet points, no percentages or scores

REQUIRED FORMAT - Return ONLY a JSON object, nothing else:
{"winner":"the chosen option, copied exactly","explanation":"text here"}

RULES:
- "winner" must be exactly one of the options above
- No markdown, no code blocks
- Must be valid JSON that works with JSON.parse()`;
}

function formatOptionList(options: string[]): string {
  const quoted = options.map(option => `"${option}"`);

  return quoted.length > 1
    ? `${quoted.slice(0, -1).join(', ')} and ${quoted[quoted.length - 1]}`
    : quoted.join('');
}

function formatRange([min, max]: Range): string {
  return min === max ? `${min}` : `${min} to ${max}`;
}

function formatExampleAnswers(count: number): string {
  return JSON.stringify(
    Array.from({ length: count }, (_, index) => `option ${index + 1}`),
  );
}
