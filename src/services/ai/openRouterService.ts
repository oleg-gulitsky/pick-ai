interface APIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export type ResponseFormat = {
  type: 'json_schema';
  json_schema: {
    name: string;
    strict: boolean;
    schema: Record<string, unknown>;
  };
};

type CallOptions<T> = {
  parse: (content: string) => T | null;
  responseFormat?: ResponseFormat;
  signal?: AbortSignal;
};

function isValidAPIResponse(data: any): data is APIResponse {
  return (
    data &&
    Array.isArray(data.choices) &&
    data.choices.length > 0 &&
    data.choices[0]?.message?.content
  );
}

const API_URL = 'https://openrouter.ai/api/v1';
export const REQUEST_TIMEOUT_MS = 60_000;
export const DETECTION_TIMEOUT_MS = 5_000;
let APIKey = '';
let AIModels: string[] = [];
const structuredOutputModels = new Set<string>();
let structuredOutputDetection: Promise<void> = Promise.resolve();

export function setAIModels(models: string[]) {
  AIModels = models;
}

export function setOpenRouterAPIKey(newKey: string) {
  APIKey = newKey;
}

async function supportsStructuredOutputs(model: string): Promise<boolean> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DETECTION_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_URL}/models/${model}/endpoints`, {
      signal: controller.signal,
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    const endpoints = data?.data?.endpoints;

    return (
      Array.isArray(endpoints) &&
      endpoints.some(
        (endpoint: any) =>
          Array.isArray(endpoint?.supported_parameters) &&
          endpoint.supported_parameters.includes('structured_outputs'),
      )
    );
  } catch (error) {
    console.warn(error);
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}

export function detectStructuredOutputSupport(models: string[]): Promise<void> {
  structuredOutputDetection = Promise.all(
    models.map(async model => {
      if (await supportsStructuredOutputs(model)) {
        structuredOutputModels.add(model);
      } else {
        structuredOutputModels.delete(model);
      }
    }),
  ).then(() => undefined);

  return structuredOutputDetection;
}

function waitForStructuredOutputDetection(signal?: AbortSignal): Promise<void> {
  if (!signal) {
    return structuredOutputDetection;
  }

  return new Promise(resolve => {
    const finish = () => {
      signal.removeEventListener('abort', finish);
      resolve();
    };
    signal.addEventListener('abort', finish);
    structuredOutputDetection.then(finish);
  });
}

function createAbortError(): Error {
  const error = new Error('AI request was aborted');
  error.name = 'AbortError';
  return error;
}

async function tryModelRequest<T>(
  model: string,
  content: string,
  { parse, responseFormat }: CallOptions<T>,
  signal: AbortSignal,
): Promise<T> {
  const useStructuredOutputs =
    responseFormat !== undefined && structuredOutputModels.has(model);

  try {
    const response = await fetch(`${API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${APIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content,
          },
        ],
        ...(useStructuredOutputs
          ? {
              response_format: responseFormat,
              provider: { require_parameters: true },
            }
          : {}),
      }),
      signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Model ${model} failed with HTTP ${response.status}: ${errorText}`,
      );
    } else {
      const data = await response.json();

      if (!isValidAPIResponse(data)) {
        throw new Error(`Model ${model} returned invalid response format`);
      }

      const result = parse(data.choices[0].message.content);

      if (result === null) {
        throw new Error(
          `Model ${model} returned a response that failed validation`,
        );
      }

      return result;
    }
  } catch (error) {
    if (!signal.aborted) {
      console.warn(error);
    }
    throw error;
  }
}

export async function callOpenRouterAPI<T>(
  content: string,
  options: CallOptions<T>,
): Promise<T> {
  const { signal } = options;

  if (AIModels.length === 0) {
    throw new Error('No AI models configured');
  }

  if (!APIKey) {
    throw new Error('No OpenRouter API key configured');
  }

  if (options.responseFormat) {
    await waitForStructuredOutputDetection(signal);
  }

  if (signal?.aborted) {
    throw createAbortError();
  }

  const controller = new AbortController();
  let isTimedOut = false;
  const timeoutId = setTimeout(() => {
    isTimedOut = true;
    controller.abort();
  }, REQUEST_TIMEOUT_MS);
  const abortRequests = () => controller.abort();
  signal?.addEventListener('abort', abortRequests);

  let result: T;

  try {
    result = await Promise.any(
      AIModels.map(model =>
        tryModelRequest(model, content, options, controller.signal),
      ),
    );
  } catch {
    if (signal?.aborted) {
      throw createAbortError();
    }

    if (isTimedOut) {
      throw new Error(
        `AI models did not respond within ${REQUEST_TIMEOUT_MS} ms`,
      );
    }

    console.error('All AI models failed');
    throw new Error('All AI models failed to provide a valid response');
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', abortRequests);
    controller.abort();
  }

  if (signal?.aborted) {
    throw createAbortError();
  }

  return result;
}
