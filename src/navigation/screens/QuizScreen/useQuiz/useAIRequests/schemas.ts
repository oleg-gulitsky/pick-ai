import { ResponseFormat } from '../../../../../services/ai';

export const QUESTIONS_RESPONSE_FORMAT: ResponseFormat = {
  type: 'json_schema',
  json_schema: {
    name: 'questions',
    strict: true,
    schema: {
      type: 'object',
      properties: {
        questions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              question: { type: 'string' },
              options: { type: 'array', items: { type: 'string' } },
            },
            required: ['question', 'options'],
            additionalProperties: false,
          },
        },
      },
      required: ['questions'],
      additionalProperties: false,
    },
  },
};

export function createResultResponseFormat(options: string[]): ResponseFormat {
  return {
    type: 'json_schema',
    json_schema: {
      name: 'result',
      strict: true,
      schema: {
        type: 'object',
        properties: {
          winner: { type: 'string', enum: options },
          explanation: { type: 'string' },
        },
        required: ['winner', 'explanation'],
        additionalProperties: false,
      },
    },
  };
}
