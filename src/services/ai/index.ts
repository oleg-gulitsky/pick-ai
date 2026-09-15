import { Question } from '../../appTypes/Question';
import { buildQuestionsPrompt, buildResultPrompt } from './prompts';
import {
  formatQuestionsResponse,
  formatResultResponse,
} from './responseFormatter';
import { callOpenRouterAPI } from './openRouterService';
import { QUESTIONS_RESPONSE_FORMAT } from './schemas';

export {
  detectStructuredOutputSupport,
  setAIModels,
  setOpenRouterAPIKey,
} from './openRouterService';

export async function tryGetQuestions(
  first: string,
  second: string,
  signal?: AbortSignal,
): Promise<Question[]> {
  const prompt = buildQuestionsPrompt(first, second);
  return callOpenRouterAPI(prompt, {
    parse: formatQuestionsResponse,
    responseFormat: QUESTIONS_RESPONSE_FORMAT,
    signal,
  });
}

export async function tryGetResult(
  options: string[],
  questions: Question[],
  answers: number[],
  signal?: AbortSignal,
): Promise<string> {
  const prompt = buildResultPrompt(options, questions, answers);
  return callOpenRouterAPI(prompt, { parse: formatResultResponse, signal });
}
