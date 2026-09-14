import {
  callOpenRouterAPI,
  REQUEST_TIMEOUT_MS,
  setAIModels,
  setOpenRouterAPIKey,
} from '../src/services/ai/openRouterService';

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

function hangUntilAborted(init: RequestInit): Promise<never> {
  return new Promise((_resolve, reject) => {
    init.signal?.addEventListener('abort', () =>
      reject(new Error('Request aborted')),
    );
  });
}

function requestSignals(): AbortSignal[] {
  return fetchMock.mock.calls.map(([, init]) => init.signal);
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
    jest.useRealTimers();
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

  test('cancels the remaining requests once one model answers', async () => {
    setAIModels(['fast', 'slow']);
    fetchMock.mockImplementation(async (_url, init: RequestInit) =>
      requestedModel(init) === 'fast'
        ? okResponse('fast answer')
        : hangUntilAborted(init),
    );

    await expect(callOpenRouterAPI('prompt')).resolves.toBe('fast answer');
    expect(requestSignals().every(signal => signal.aborted)).toBe(true);
  });

  test('clears the timeout once the request settles', async () => {
    jest.useFakeTimers();
    setAIModels(['model']);
    fetchMock.mockImplementation(async () => okResponse('answer'));

    await callOpenRouterAPI('prompt');

    expect(jest.getTimerCount()).toBe(0);
  });

  test('fails when no model answers within the timeout', async () => {
    jest.useFakeTimers();
    setAIModels(['hanging-a', 'hanging-b']);
    fetchMock.mockImplementation(async (_url, init: RequestInit) =>
      hangUntilAborted(init),
    );

    const request = callOpenRouterAPI('prompt');
    jest.advanceTimersByTime(REQUEST_TIMEOUT_MS - 1);
    expect(requestSignals().some(signal => signal.aborted)).toBe(false);
    jest.advanceTimersByTime(1);

    await expect(request).rejects.toThrow(
      `AI models did not respond within ${REQUEST_TIMEOUT_MS} ms`,
    );
    expect(requestSignals().every(signal => signal.aborted)).toBe(true);
  });

  test('cancels every request when the caller aborts', async () => {
    setAIModels(['model-a', 'model-b']);
    fetchMock.mockImplementation(async (_url, init: RequestInit) =>
      hangUntilAborted(init),
    );
    const controller = new AbortController();

    const request = callOpenRouterAPI('prompt', controller.signal);
    controller.abort();

    await expect(request).rejects.toMatchObject({ name: 'AbortError' });
    expect(requestSignals().every(signal => signal.aborted)).toBe(true);
  });

  test('rejects when the caller aborts after a response has arrived', async () => {
    setAIModels(['model']);
    fetchMock.mockImplementation(async () => okResponse('late answer'));
    const controller = new AbortController();

    const request = callOpenRouterAPI('prompt', controller.signal);
    controller.abort();

    await expect(request).rejects.toMatchObject({ name: 'AbortError' });
  });

  test('sends nothing when the caller has already aborted', async () => {
    setAIModels(['model']);
    const controller = new AbortController();
    controller.abort();

    await expect(
      callOpenRouterAPI('prompt', controller.signal),
    ).rejects.toMatchObject({ name: 'AbortError' });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
