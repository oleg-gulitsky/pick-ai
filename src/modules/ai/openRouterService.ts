import { Alert } from 'react-native';
import Config from 'react-native-config';

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
let APIKey = Config.OPEN_ROUTER_API_KEY;
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
): Promise<string | null> {
  try {
    console.log(`Trying model: ${model}`);

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
      console.warn(
        `Model ${model} failed with HTTP ${response.status}: ${errorText}`,
      );
      return null;
    }

    const data = await response.json();

    if (!isValidAPIResponse(data)) {
      console.warn(`Model ${model} returned invalid response format`);
      return null;
    }

    console.log(`Model ${model} succeeded`);
    return data.choices[0].message.content;
  } catch (error) {
    console.warn(`Model ${model} request failed:`, error);
    return null;
  }
}

export async function callOpenRouterAPI(content: string): Promise<string> {
  if (AIModels.length === 0) {
    throw new Error('No AI models configured');
  }

  const promises = AIModels.map(model => tryModelRequest(model, content));

  try {
    const results = await Promise.allSettled(promises);

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value !== null) {
        return result.value;
      }
    }
  } catch (error) {
    console.error('Unexpected error in parallel requests:', error);
  }

  Alert.alert('Service Temporarily Unavailable', 'Please try again later');
  throw new Error('All AI models failed to provide a valid response');
}
