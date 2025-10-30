import { Question } from '../../appTypes/Question';

export function buildQuestionsPrompt(first: string, second: string): string {
  return `
    Make a list of a maximum of 7–10 questions,
    the answers to which will help make a choice between "${first}" and "${second}".
    The answers to the questions should be brief.
    Return only a valid JavaScript array of 7–10 objects, each with fields "question" and "options".
    Do not include any other text, comments, quotes, explanations, markdown, or characters.
    Respond in a single line, no newlines, no formatting, and no extra output.
    Output must be strictly valid JSON and parseable using JSON.parse().
  `;
}

export function buildResultPrompt(
  options: string[],
  questions: Question[],
  answers: number[]
): string {
  const optionsText = options.reduce((prev, cur) => `"${prev}" и "${cur}"`);
  const answersText = questions.reduce(
    (prev, cur, i) =>
      prev + `Question: ${cur.question} Answer: ${cur.options[answers[i]]}.\n`,
    '',
  );

  return `
    Make a choice between ${optionsText} based on the answers to these questions.
    ${answersText}
    Briefly explain why you made this choice.
    Important! Do not use any formatting in your response!
  `;
}