import { useCallback } from 'react';
import { Question } from '../../../../../appTypes/Question';
import {
  OpenRouterError,
  requestCompletion,
  ResponseFormat,
} from '../../../../../services/ai';
import { trackEvent } from '../../../../../services/analytics';
import { useAppConfigStore } from '../../../../../store/useAppConfigStore';
import { ANALYTICS_EVENTS } from './analyticsEvents';
import { buildQuestionsPrompt, buildResultPrompt } from './prompts';
import {
  formatQuestionsResponse,
  formatResultResponse,
} from './responseFormatter';
import { QUESTIONS_RESPONSE_FORMAT } from './schemas';

export const REQUEST_TIMEOUT_MS = 60_000;

export function useAIRequests() {
  const requestQuestions = useCallback(
    async (first: string, second: string, signal: AbortSignal) => {
      await waitForStructuredOutputsCheck(signal);
      const structuredOutputModels =
        useAppConfigStore.getState().structuredOutputModels ?? [];
      const content = buildQuestionsPrompt(first, second);

      return requestFromModels(
        model => ({
          content,
          responseFormat: structuredOutputModels.includes(model)
            ? QUESTIONS_RESPONSE_FORMAT
            : undefined,
        }),
        formatQuestionsResponse,
        signal,
      );
    },
    [],
  );

  const requestResult = useCallback(
    (
      options: string[],
      questions: Question[],
      answers: number[],
      signal: AbortSignal,
    ) => {
      const content = buildResultPrompt(options, questions, answers);

      return requestFromModels(
        () => ({ content }),
        formatResultResponse,
        signal,
      );
    },
    [],
  );

  return { requestQuestions, requestResult };
}

type Prompt = {
  content: string;
  responseFormat?: ResponseFormat;
};

type RequestFailureReason =
  | 'no_models'
  | 'no_api_key'
  | 'timeout'
  | 'all_models_failed';

function createAbortError(): Error {
  const error = new Error('AI request was aborted');
  error.name = 'AbortError';
  return error;
}

function createValidationError(model: string): Error {
  const error = new Error(
    `Model ${model} returned a response that failed validation`,
  );
  error.name = 'ValidationError';
  return error;
}

function trackModelFailure(model: string, prompt: Prompt, error: unknown) {
  let reason = 'network_error';
  let details: string | undefined;

  if (error instanceof OpenRouterError) {
    const { type, status, apiMessage } = error.details;
    reason = type === 'http_error' ? `http_${status}` : 'invalid_format';
    details = apiMessage;
  } else if (error instanceof Error && error.name === 'ValidationError') {
    reason = 'validation_failed';
  }

  trackEvent(ANALYTICS_EVENTS.AI_MODEL_FAILED, {
    model,
    reason,
    structured_outputs: String(prompt.responseFormat !== undefined),
    ...(details ? { details } : {}),
  });
}

function trackRequestFailure(reason: RequestFailureReason) {
  trackEvent(ANALYTICS_EVENTS.AI_REQUEST_FAILED, {
    reason,
    models_count: useAppConfigStore.getState().aiModels.length,
  });
}

function waitForStructuredOutputsCheck(signal: AbortSignal): Promise<void> {
  const isChecked = () =>
    useAppConfigStore.getState().structuredOutputModels !== null;

  if (signal.aborted || isChecked()) {
    return Promise.resolve();
  }

  return new Promise(resolve => {
    const finish = () => {
      unsubscribe();
      signal.removeEventListener('abort', finish);
      resolve();
    };
    const unsubscribe = useAppConfigStore.subscribe(() => {
      if (isChecked()) {
        finish();
      }
    });
    signal.addEventListener('abort', finish);
  });
}

async function requestFromModels<T>(
  getPrompt: (model: string) => Prompt,
  parse: (content: string) => T | null,
  signal: AbortSignal,
): Promise<T> {
  const { aiModels, openRouterAPIKey } = useAppConfigStore.getState();

  if (aiModels.length === 0) {
    trackRequestFailure('no_models');
    throw new Error('No AI models configured');
  }

  if (!openRouterAPIKey) {
    trackRequestFailure('no_api_key');
    throw new Error('No OpenRouter API key configured');
  }

  if (signal.aborted) {
    throw createAbortError();
  }

  const controller = new AbortController();
  let isTimedOut = false;
  const timeoutId = setTimeout(() => {
    isTimedOut = true;
    controller.abort();
  }, REQUEST_TIMEOUT_MS);
  const abortRequests = () => controller.abort();
  signal.addEventListener('abort', abortRequests);

  const requestFromModel = async (model: string, prompt: Prompt) => {
    const result = parse(
      await requestCompletion({
        ...prompt,
        apiKey: openRouterAPIKey,
        model,
        signal: controller.signal,
      }),
    );

    if (result === null) {
      throw createValidationError(model);
    }

    return result;
  };

  let result: T;

  try {
    result = await Promise.any(
      aiModels.map(model => {
        const prompt = getPrompt(model);

        return requestFromModel(model, prompt).catch(error => {
          if (!controller.signal.aborted) {
            console.warn(error);
            trackModelFailure(model, prompt, error);
          }
          throw error;
        });
      }),
    );
  } catch {
    if (signal.aborted) {
      throw createAbortError();
    }

    if (isTimedOut) {
      trackRequestFailure('timeout');
      throw new Error(
        `AI models did not respond within ${REQUEST_TIMEOUT_MS} ms`,
      );
    }

    console.error('All AI models failed');
    trackRequestFailure('all_models_failed');
    throw new Error('All AI models failed to provide a valid response');
  } finally {
    clearTimeout(timeoutId);
    signal.removeEventListener('abort', abortRequests);
    controller.abort();
  }

  if (signal.aborted) {
    throw createAbortError();
  }

  return result;
}
