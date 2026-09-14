import {
  callOpenRouterAPI,
  setAIModels,
  setOpenRouterAPIKey,
} from '../src/modules/ai/openRouterService';

const okResponse = (content: string) => ({
  ok: true,
  status: 200,
  json: async () => ({ choices: [{ message: { content } }] }),
});

const errorResponse = (status: number, text: string) => ({
  ok: false,
  status,
  text: async () => text,
});

const invalidFormatResponse = () => ({
  ok: true,
  status: 200,
  json: async () => ({ choices: [] }),
});

const fetchMock = jest.fn();

function requestedModel(init: RequestInit): string {
  return JSON.parse(String(init.body)).model;
}

describe('callOpenRouterAPI', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
    setOpenRouterAPIKey('test-key');
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('throws when the model pool is empty', async () => {
    setAIModels([]);

    await expect(callOpenRouterAPI('prompt')).rejects.toThrow(
      'No AI models configured',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('sends one authorized request per model', async () => {
    setAIModels(['model-a', 'model-b']);
    fetchMock.mockImplementation(async () => okResponse('answer'));

    await callOpenRouterAPI('prompt');

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const inits: RequestInit[] = fetchMock.mock.calls.map(([, init]) => init);
    expect(inits.map(requestedModel)).toEqual(['model-a', 'model-b']);
    inits.forEach(init => {
      expect(init.headers).toMatchObject({ Authorization: 'Bearer test-key' });
      expect(JSON.parse(String(init.body)).messages).toEqual([
        { role: 'user', content: 'prompt' },
      ]);
    });
  });

  test('returns the answer of a working model when another one fails', async () => {
    setAIModels(['broken', 'working']);
    fetchMock.mockImplementation(async (_url, init: RequestInit) =>
      requestedModel(init) === 'broken'
        ? errorResponse(429, 'rate limited')
        : okResponse('answer from working'),
    );

    await expect(callOpenRouterAPI('prompt')).resolves.toBe(
      'answer from working',
    );
  });

  test('throws when every model fails', async () => {
    setAIModels(['http-error', 'network-error', 'invalid-format']);
    fetchMock.mockImplementation(async (_url, init: RequestInit) => {
      switch (requestedModel(init)) {
        case 'http-error':
          return errorResponse(500, 'internal error');
        case 'network-error':
          throw new TypeError('Network request failed');
        default:
          return invalidFormatResponse();
      }
    });

    await expect(callOpenRouterAPI('prompt')).rejects.toThrow(
      'All AI models failed to provide a valid response',
    );
  });
});
