import {
  MAX_OPTIONS,
  MAX_QUESTIONS,
  MIN_OPTIONS,
  Question,
} from '../../../../../appTypes/Question';

export function buildQuestionsPrompt(first: string, second: string): string {
  return `You are helping someone choose between "${first}" and "${second}".

Create ${REQUESTED_MIN_QUESTIONS} to ${MAX_QUESTIONS} questions to help make this decision. Each question can have ${MIN_OPTIONS} to ${MAX_OPTIONS} answer options.

REQUIRED FORMAT - Return ONLY a JSON object with a "questions" array, nothing else:
{"questions":[{"question":"text here","options":["option 1","option 2"]},{"question":"text here","options":["option 1","option 2","option 3"]}]}

EXAMPLE:
{"questions":[{"question":"What is your budget?","options":["Very limited","Limited","Moderate","Flexible"]},{"question":"How much time do you have?","options":["Very little time","Plenty of time"]}]}

RULES:
- Return ONLY the JSON object
- No markdown, no code blocks, no explanations
- Create ${REQUESTED_MIN_QUESTIONS} to ${MAX_QUESTIONS} questions
- Each question must have ${MIN_OPTIONS} to ${MAX_OPTIONS} options
- Each question must be clear and simple
- Options should be short (2-5 words)
- Must be valid JSON that works with JSON.parse()

Now create ${REQUESTED_MIN_QUESTIONS}-${MAX_QUESTIONS} questions for choosing between "${first}" and "${second}":`;
}

export function buildResultPrompt(
  options: string[],
  questions: Question[],
  answers: number[],
): string {
  const optionsText = options.reduce((prev, cur) => `"${prev}" and "${cur}"`);
  const answersText = questions
    .map((q, i) => `Q: ${q.question}\nA: ${q.options[answers[i]]}`)
    .join('\n\n');

  return `Based on these answers, choose between ${optionsText}:

${answersText}

YOUR TASK:
1. Choose either "${options[0]}" or "${options[1]}"
2. Explain your choice in 2-3 short sentences
3. Use simple language, no formatting, no bullet points

Your recommendation:`;
}

const REQUESTED_MIN_QUESTIONS = 7;
