import { Question, isQuestionArray } from '../../appTypes/Question';
import { safeParse } from '../../tools/safeParse';

function cleanJsonResponse(content: string): string {
  return content
    .replace(/^\`\`\`javascript\s*/, '')
    .replace(/^\`\`\`json\s*/, '')
    .replace(/\s*\`\`\`$/, '')
    .replace(/\n/g, '')
    .replace(/\\/g, '');
}

export function formatQuestionsResponse(content: string): Question[] | null {
  const cleanedContent = cleanJsonResponse(content);
  return safeParse<Question[]>(cleanedContent, isQuestionArray);
}

export function formatResultResponse(content: string): string {
  return content.trim();
}