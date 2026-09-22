import { Question, isQuestionArray } from '../../../../../appTypes/Question';
import { safeParse } from '../../../../../tools/safeParse';

export type AIResult = {
  winner: string;
  explanation: string;
};

export function formatQuestionsResponse(content: string): Question[] | null {
  const parsed = safeParse(cleanJsonResponse(content), isQuestionsResponse);

  if (parsed === null) {
    return null;
  }

  return Array.isArray(parsed) ? parsed : parsed.questions;
}

export function formatResultResponse(
  content: string,
  options: string[],
): AIResult | null {
  const parsed = safeParse(cleanJsonResponse(content), isResultPayload);

  if (parsed === null) {
    return null;
  }

  const winner = options.find(
    option => normalize(option) === normalize(parsed.winner),
  );
  const explanation = parsed.explanation.trim();

  return winner && explanation ? { winner, explanation } : null;
}

type QuestionsPayload = { questions: Question[] };

const FENCED_BLOCK = /^```[a-z]*\s*([\s\S]*?)\s*```$/i;

function cleanJsonResponse(content: string): string {
  const trimmed = content.trim();
  const fenced = trimmed.match(FENCED_BLOCK);
  return fenced ? fenced[1] : trimmed;
}

function normalize(text: string): string {
  return text.trim().toLowerCase();
}

function isResultPayload(obj: any): obj is AIResult {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.winner === 'string' &&
    typeof obj.explanation === 'string'
  );
}

function isQuestionsResponse(obj: any): obj is Question[] | QuestionsPayload {
  return (
    isQuestionArray(obj) ||
    (typeof obj === 'object' && obj !== null && isQuestionArray(obj.questions))
  );
}
