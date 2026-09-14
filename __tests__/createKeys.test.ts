import { createKeys } from '../src/tools/createKeys';

describe('createKeys', () => {
  test('maps each uppercased key to the original key', () => {
    const keys = createKeys({
      current_model: 'model',
      openrouter_api_key: 'key',
      ai_models: '[]',
    });

    expect(keys).toEqual({
      CURRENT_MODEL: 'current_model',
      OPENROUTER_API_KEY: 'openrouter_api_key',
      AI_MODELS: 'ai_models',
    });
  });

  test('ignores values', () => {
    expect(createKeys({ flag: false, count: 0, nested: { a: 1 } })).toEqual({
      FLAG: 'flag',
      COUNT: 'count',
      NESTED: 'nested',
    });
  });

  test('returns an empty object for an empty input', () => {
    expect(createKeys({})).toEqual({});
  });
});
