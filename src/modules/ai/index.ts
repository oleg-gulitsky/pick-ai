import { Question } from '../../appTypes/Question';
import { buildQuestionsPrompt, buildResultPrompt } from './prompts';
import {
  formatQuestionsResponse,
  formatResultResponse,
} from './responseFormatter';
import { callOpenRouterAPI } from './openRouterService';

export { setAIModels, setOpenRouterAPIKey } from './openRouterService';

export async function tryGetQuestions(
  first: string,
  second: string,
  signal?: AbortSignal,
): Promise<Question[] | null> {
  const prompt = buildQuestionsPrompt(first, second);
  const response = await callOpenRouterAPI(prompt, signal);
  return formatQuestionsResponse(response);
}

export async function tryGetResult(
  options: string[],
  questions: Question[],
  answers: number[],
  signal?: AbortSignal,
): Promise<string> {
  const prompt = buildResultPrompt(options, questions, answers);
  const response = await callOpenRouterAPI(prompt, signal);
  return formatResultResponse(response);
}
