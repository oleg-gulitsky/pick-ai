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
let APIKey = '';
let AIModels: string[] = [];

export function setAIModels(models: string[]) {
  AIModels = models;
}

export function setOpenRouterAPIKey(newKey: string) {
  APIKey = newKey;
}

async function tryModelRequest(
  model: string,
  content: string,
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
    console.warn(error);
    throw error;
  }
}

export async function callOpenRouterAPI(content: string): Promise<string> {
  if (AIModels.length === 0) {
    throw new Error('No AI models configured');
  }

  const promises = AIModels.map(model => tryModelRequest(model, content));

  try {
    const result = await Promise.any(promises);

    if (result !== null) {
      return result;
    }
  } catch (error) {
    console.error('All AI models failed');
  }

  throw new Error('All AI models failed to provide a valid response');
}
