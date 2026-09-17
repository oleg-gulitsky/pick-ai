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
