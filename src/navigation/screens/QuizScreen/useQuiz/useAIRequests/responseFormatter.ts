import { Question, isQuestionArray } from '../../../../../appTypes/Question';
import { safeParse } from '../../../../../tools/safeParse';

export function formatQuestionsResponse(content: string): Question[] | null {
  const parsed = safeParse(cleanJsonResponse(content), isQuestionsResponse);

  if (parsed === null) {
    return null;
  }

  return Array.isArray(parsed) ? parsed : parsed.questions;
}

export function formatResultResponse(content: string): string | null {
  const result = content.trim();
  return result.length > 0 ? result : null;
}

type QuestionsPayload = { questions: Question[] };

const FENCED_BLOCK = /^```[a-z]*\s*([\s\S]*?)\s*```$/i;

function cleanJsonResponse(content: string): string {
  const trimmed = content.trim();
  const fenced = trimmed.match(FENCED_BLOCK);
  return fenced ? fenced[1] : trimmed;
}

function isQuestionsResponse(obj: any): obj is Question[] | QuestionsPayload {
  return (
    isQuestionArray(obj) ||
    (typeof obj === 'object' && obj !== null && isQuestionArray(obj.questions))
  );
}
