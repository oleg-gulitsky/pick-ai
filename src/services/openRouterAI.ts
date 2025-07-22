import { isQuestionArray, Question } from '../appTypes/Question';
import { safeParse } from '../tools/safeParse';

export const MODELS = {
  MoonshotAI_Kimi_K2: 'moonshotai/kimi-k2:free',
  Google_Gemma_3n_4B: 'google/gemma-3n-e4b-it:free',
  Meta_Llam_4_Maverick: 'meta-llama/llama-4-maverick:free',
  Deepseek_R1_0528_Qwen3_8B: 'deepseek/deepseek-r1-0528-qwen3-8b:free',
  TNG_DeepSeek_R1T2_Chimera: 'tngtech/deepseek-r1t2-chimera:free',
  Mistral_Devstral_Small: 'mistralai/devstral-small-2505:free',
  Meta_Llama_3_3_8B_Instruct: 'meta-llama/llama-3.3-8b-instruct:free',
};

let currentModel = MODELS.Deepseek_R1_0528_Qwen3_8B;

export function setCurrentModel(newModel: string) {
  currentModel = newModel;
}

async function callOpenRouterAPI(content: string) {
  try {
    const response = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization:
            'Bearer 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',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: currentModel,
          messages: [
            {
              role: 'user',
              content,
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Unexpected API response format');
    }
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenRouter API:', error);
    throw error;
  }
}

export async function getQuestionsFromOpenRouter(
  first: string,
  second: string,
): Promise<Question[] | null> {
  const content = await callOpenRouterAPI(`
      Make a list of a maximum of 7–10 questions in the same language as "${first}" and "${second}", the answers to which will help make a choice between "${first}" and "${second}".
      The answers to the questions should be brief.
      Return only a valid JavaScript array of 7–10 objects, each with fields "question" and "options". 
      Do not include any other text, comments, quotes, explanations, markdown, or characters. 
      Respond in a single line, no newlines, no formatting, and no extra output. 
      Output must be strictly valid JSON and parseable using JSON.parse().
    `);

  return safeParse<Question[]>(
    content
      .replace(/(\s*)(\w+):/g, '$1"$2":')
      .replace(/^\`\`\`javascript\s*/, '')
      .replace(/\s*\`\`\`$/, '')
      .replace(/\n/g, '')
      .replace(/\\/g, ''),
    isQuestionArray,
  );
}

export async function getResultFromOpenRouter(
  options: string[],
  questions: Question[],
  answers: number[],
): Promise<string> {
  const message = getMessageForResultRequest(options, questions, answers);
  const content = await callOpenRouterAPI(message);
  return content;
}

function getMessageForResultRequest(
  options: string[],
  questions: Question[],
  answers: number[],
): string {
  const o = options.reduce((prev, cur) => `"${prev}" и "${cur}"`);
  const a = questions.reduce(
    (prev, cur, i) =>
      prev + `Question: ${cur.question} Answer: ${cur.options[answers[i]]}.\n`,
    '',
  );

  return `
    Make a choice between ${o} based on the answers to these questions.
    ${a}
    Briefly explain why you made this choice.
    If the options are not in English, the response language must match answers language.
    Important! Do not use any formatting in your response!
  `;
}
