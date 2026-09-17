export type ResponseFormat = {
  type: 'json_schema';
  json_schema: {
    name: string;
    strict: boolean;
    schema: Record<string, unknown>;
  };
};

export class OpenRouterError extends Error {
  constructor(message: string, readonly details: OpenRouterErrorDetails) {
    super(message);
    this.name = 'OpenRouterError';
  }
}

export async function fetchIsStructuredOutputsSupported(
  model: string,
  signal?: AbortSignal,
): Promise<boolean> {
  const response = await fetch(`${API_URL}/models/${model}/endpoints`, {
    signal,
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
}

export async function requestCompletion({
  apiKey,
  model,
  content,
  responseFormat,
  signal,
}: CompletionRequest): Promise<string> {
  const response = await fetch(`${API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
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
      ...(responseFormat
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
    throw new OpenRouterError(
      `Model ${model} failed with HTTP ${response.status}: ${errorText}`,
      {
        type: 'http_error',
        status: response.status,
        apiMessage: getAPIMessage(parseJSON(errorText)),
      },
    );
  }

  const data = await response.json().catch(() => null);

  if (!isValidAPIResponse(data)) {
    throw new OpenRouterError(
      `Model ${model} returned invalid response format`,
      {
        type: 'invalid_response',
        status: response.status,
        apiMessage: getAPIMessage(data),
      },
    );
  }

  return data.choices[0].message.content;
}

interface APIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

type CompletionRequest = {
  apiKey: string;
  model: string;
  content: string;
  responseFormat?: ResponseFormat;
  signal?: AbortSignal;
};

type OpenRouterErrorDetails = {
  type: 'http_error' | 'invalid_response';
  status: number;
  apiMessage?: string;
};

const API_URL = 'https://openrouter.ai/api/v1';

function isValidAPIResponse(data: any): data is APIResponse {
  return (
    data &&
    Array.isArray(data.choices) &&
    data.choices.length > 0 &&
    data.choices[0]?.message?.content
  );
}

function getAPIMessage(data: any): string | undefined {
  const message = data?.error?.message;
  return typeof message === 'string' ? message : undefined;
}

function parseJSON(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
