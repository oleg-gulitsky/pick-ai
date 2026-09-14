interface APIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

function isValidAPIResponse(data: any): data is APIResponse {
  return (
    data &&
    Array.isArray(data.choices) &&
    data.choices.length > 0 &&
    data.choices[0]?.message?.content
  );
}

const BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';
export const REQUEST_TIMEOUT_MS = 60_000;
let APIKey = '';
let AIModels: string[] = [];

export function setAIModels(models: string[]) {
  AIModels = models;
}

export function setOpenRouterAPIKey(newKey: string) {
  APIKey = newKey;
}

function createAbortError(): Error {
  const error = new Error('AI request was aborted');
  error.name = 'AbortError';
  return error;
}

async function tryModelRequest(
  model: string,
  content: string,
  signal: AbortSignal,
): Promise<string> {
  try {
    const response = await fetch(BASE_URL, {
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

      return data.choices[0].message.content;
    }
  } catch (error) {
    if (!signal.aborted) {
      console.warn(error);
    }
    throw error;
  }
}

export async function callOpenRouterAPI(
  content: string,
  signal?: AbortSignal,
): Promise<string> {
  if (AIModels.length === 0) {
    throw new Error('No AI models configured');
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

  let result: string;

  try {
    result = await Promise.any(
      AIModels.map(model => tryModelRequest(model, content, controller.signal)),
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
