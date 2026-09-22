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
import { buildQuestionsPrompt, buildResultPrompt, QuizRanges } from './prompts';
import {
  formatQuestionsResponse,
  formatResultResponse,
} from './responseFormatter';
import {
  createResultResponseFormat,
  QUESTIONS_RESPONSE_FORMAT,
} from './schemas';

export const REQUEST_TIMEOUT_MS = 60_000;

export function useAIRequests() {
  const requestQuestions = useCallback(
    async (options: string[], ranges: QuizRanges, signal: AbortSignal) => {
      await waitForAppConfig(
        config =>
          config.isConfigReady && config.structuredOutputModels !== null,
        signal,
      );
      const structuredOutputModels =
        useAppConfigStore.getState().structuredOutputModels ?? [];
      const content = buildQuestionsPrompt(options, ranges);

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
    async (
      options: string[],
      questions: Question[],
      answers: number[],
      signal: AbortSignal,
    ) => {
      if (!useAppConfigStore.getState().isConfigReady) {
        await waitForAppConfig(config => config.isConfigReady, signal);
      }
      const structuredOutputModels =
        useAppConfigStore.getState().structuredOutputModels ?? [];
      const content = buildResultPrompt(options, questions, answers);
      const responseFormat = createResultResponseFormat(options);

      return requestFromModels(
        model => ({
          content,
          responseFormat: structuredOutputModels.includes(model)
            ? responseFormat
            : undefined,
        }),
        response => formatResultResponse(response, options),
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

type AppConfig = ReturnType<typeof useAppConfigStore.getState>;

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

function waitForAppConfig(
  isReady: (config: AppConfig) => boolean,
  signal: AbortSignal,
): Promise<void> {
  const isConfigReady = () => isReady(useAppConfigStore.getState());

  if (signal.aborted) {
    return Promise.reject(createAbortError());
  }

  if (isConfigReady()) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const settle = (finish: () => void) => {
      unsubscribe();
      signal.removeEventListener('abort', handleAbort);
      finish();
    };
    const handleAbort = () => settle(() => reject(createAbortError()));
    const unsubscribe = useAppConfigStore.subscribe(() => {
      if (isConfigReady()) {
        settle(resolve);
      }
    });
    signal.addEventListener('abort', handleAbort);
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
