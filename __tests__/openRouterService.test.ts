import {
  DETECTION_TIMEOUT_MS,
  REQUEST_TIMEOUT_MS,
  ResponseFormat,
} from '../src/services/ai/openRouterService';

type OpenRouterService = typeof import('../src/services/ai/openRouterService');

// The service keeps its config in module state, so every test gets a fresh copy.
let callOpenRouterAPI: OpenRouterService['callOpenRouterAPI'];
let detectStructuredOutputSupport: OpenRouterService['detectStructuredOutputSupport'];
let setAIModels: OpenRouterService['setAIModels'];
let setOpenRouterAPIKey: OpenRouterService['setOpenRouterAPIKey'];

function loadFreshService() {
  jest.isolateModules(() => {
    ({
      callOpenRouterAPI,
      detectStructuredOutputSupport,
      setAIModels,
      setOpenRouterAPIKey,
    } = require('../src/services/ai/openRouterService'));
  });
}

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

const endpointsResponse = (supportedParameters: string[]) => ({
  ok: true,
  status: 200,
  json: async () => ({
    data: { endpoints: [{ supported_parameters: supportedParameters }] },
  }),
});

const responseFormat: ResponseFormat = {
  type: 'json_schema',
  json_schema: { name: 'test', strict: true, schema: { type: 'object' } },
};

const parseText = (content: string) => content;

const fetchMock = jest.fn();

function requestedModel(init: RequestInit): string {
  return JSON.parse(String(init.body)).model;
}

function completionBodies(): Record<string, any> {
  return Object.fromEntries(
    fetchMock.mock.calls
      .filter(([url]) => String(url).endsWith('/chat/completions'))
      .map(([, init]) => {
        const body = JSON.parse(String(init.body));
        return [body.model, body];
      }),
  );
}

function hangUntilAborted(init: RequestInit): Promise<never> {
  return new Promise((_resolve, reject) => {
    init.signal?.addEventListener('abort', () =>
      reject(new Error('Request aborted')),
    );
  });
}

const flushPromises = () => new Promise(resolve => setImmediate(resolve));

function requestSignals(): AbortSignal[] {
  return fetchMock.mock.calls.map(([, init]) => init.signal);
}

describe('callOpenRouterAPI', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
    loadFreshService();
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

    await expect(
      callOpenRouterAPI('prompt', { parse: parseText }),
    ).rejects.toThrow('No AI models configured');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('throws when the API key is missing', async () => {
    setAIModels(['model']);
    setOpenRouterAPIKey('');

    await expect(
      callOpenRouterAPI('prompt', { parse: parseText }),
    ).rejects.toThrow('No OpenRouter API key configured');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('sends one authorized request per model', async () => {
    setAIModels(['model-a', 'model-b']);
    fetchMock.mockImplementation(async () => okResponse('answer'));

    await callOpenRouterAPI('prompt', { parse: parseText });

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

    await expect(
      callOpenRouterAPI('prompt', { parse: parseText }),
    ).resolves.toBe('answer from working');
  });

  test('moves on to another model when an answer fails validation', async () => {
    setAIModels(['invalid', 'valid']);
    fetchMock.mockImplementation(async (_url, init: RequestInit) =>
      okResponse(
        requestedModel(init) === 'invalid' ? 'bad answer' : 'good answer',
      ),
    );
    const parse = (content: string) =>
      content === 'good answer' ? content : null;

    await expect(callOpenRouterAPI('prompt', { parse })).resolves.toBe(
      'good answer',
    );
  });

  test('throws when no answer passes validation', async () => {
    setAIModels(['model-a', 'model-b']);
    fetchMock.mockImplementation(async () => okResponse('answer'));

    await expect(
      callOpenRouterAPI('prompt', { parse: () => null }),
    ).rejects.toThrow('All AI models failed to provide a valid response');
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

    await expect(
      callOpenRouterAPI('prompt', { parse: parseText }),
    ).rejects.toThrow('All AI models failed to provide a valid response');
  });

  test('cancels the remaining requests once one model answers', async () => {
    setAIModels(['fast', 'slow']);
    fetchMock.mockImplementation(async (_url, init: RequestInit) =>
      requestedModel(init) === 'fast'
        ? okResponse('fast answer')
        : hangUntilAborted(init),
    );

    await expect(
      callOpenRouterAPI('prompt', { parse: parseText }),
    ).resolves.toBe('fast answer');
    expect(requestSignals().every(signal => signal.aborted)).toBe(true);
  });

  test('clears the timeout once the request settles', async () => {
    jest.useFakeTimers();
    setAIModels(['model']);
    fetchMock.mockImplementation(async () => okResponse('answer'));

    await callOpenRouterAPI('prompt', { parse: parseText });

    expect(jest.getTimerCount()).toBe(0);
  });

  test('fails when no model answers within the timeout', async () => {
    jest.useFakeTimers();
    setAIModels(['hanging-a', 'hanging-b']);
    fetchMock.mockImplementation(async (_url, init: RequestInit) =>
      hangUntilAborted(init),
    );

    const request = callOpenRouterAPI('prompt', { parse: parseText });
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

    const request = callOpenRouterAPI('prompt', {
      parse: parseText,
      signal: controller.signal,
    });
    controller.abort();

    await expect(request).rejects.toMatchObject({ name: 'AbortError' });
    expect(requestSignals().every(signal => signal.aborted)).toBe(true);
  });

  test('rejects when the caller aborts after a response has arrived', async () => {
    setAIModels(['model']);
    fetchMock.mockImplementation(async () => okResponse('late answer'));
    const controller = new AbortController();

    const request = callOpenRouterAPI('prompt', {
      parse: parseText,
      signal: controller.signal,
    });
    controller.abort();

    await expect(request).rejects.toMatchObject({ name: 'AbortError' });
  });

  test('sends nothing when the caller has already aborted', async () => {
    setAIModels(['model']);
    const controller = new AbortController();
    controller.abort();

    await expect(
      callOpenRouterAPI('prompt', {
        parse: parseText,
        signal: controller.signal,
      }),
    ).rejects.toMatchObject({ name: 'AbortError' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  describe('structured outputs', () => {
    test('asks for the schema only from models that support it', async () => {
      fetchMock.mockImplementation(async (url: string) => {
        if (url.endsWith('/models/schema-model/endpoints')) {
          return endpointsResponse(['response_format', 'structured_outputs']);
        }
        if (url.endsWith('/endpoints')) {
          return endpointsResponse(['temperature']);
        }
        return okResponse('answer');
      });

      await detectStructuredOutputSupport(['schema-model', 'plain-model']);
      setAIModels(['schema-model', 'plain-model']);
      await callOpenRouterAPI('prompt', { parse: parseText, responseFormat });

      const bodies = completionBodies();
      expect(bodies['schema-model']).toMatchObject({
        response_format: responseFormat,
        provider: { require_parameters: true },
      });
      expect(bodies['plain-model']).not.toHaveProperty('response_format');
      expect(bodies['plain-model']).not.toHaveProperty('provider');
    });

    test('falls back to the prompt when the support check fails', async () => {
      fetchMock.mockImplementation(async (url: string) => {
        if (url.endsWith('/endpoints')) {
          throw new TypeError('Network request failed');
        }
        return okResponse('answer');
      });

      await expect(
        detectStructuredOutputSupport(['unchecked-model']),
      ).resolves.toBeUndefined();
      setAIModels(['unchecked-model']);
      await callOpenRouterAPI('prompt', { parse: parseText, responseFormat });

      expect(completionBodies()['unchecked-model']).not.toHaveProperty(
        'response_format',
      );
    });

    test('sends no schema when the caller does not ask for one', async () => {
      fetchMock.mockImplementation(async (url: string) =>
        url.endsWith('/endpoints')
          ? endpointsResponse(['structured_outputs'])
          : okResponse('answer'),
      );

      await detectStructuredOutputSupport(['capable-model']);
      setAIModels(['capable-model']);
      await callOpenRouterAPI('prompt', { parse: parseText });

      expect(completionBodies()['capable-model']).not.toHaveProperty(
        'response_format',
      );
    });

    test('waits for a pending support check before asking for a schema', async () => {
      let resolveEndpoints!: () => void;
      fetchMock.mockImplementation((url: string) =>
        url.endsWith('/endpoints')
          ? new Promise(resolve => {
              resolveEndpoints = () =>
                resolve(endpointsResponse(['structured_outputs']));
            })
          : Promise.resolve(okResponse('answer')),
      );
      setAIModels(['capable-model']);

      const detection = detectStructuredOutputSupport(['capable-model']);
      const request = callOpenRouterAPI('prompt', {
        parse: parseText,
        responseFormat,
      });
      await flushPromises();
      expect(completionBodies()).toEqual({});

      resolveEndpoints();
      await detection;
      await request;

      expect(completionBodies()['capable-model']).toMatchObject({
        response_format: responseFormat,
      });
    });

    test('treats a hanging support check as unsupported', async () => {
      jest.useFakeTimers();
      fetchMock.mockImplementation(async (url: string, init: RequestInit) =>
        url.endsWith('/endpoints')
          ? hangUntilAborted(init ?? {})
          : okResponse('answer'),
      );
      setAIModels(['slow-model']);

      const detection = detectStructuredOutputSupport(['slow-model']);
      jest.advanceTimersByTime(DETECTION_TIMEOUT_MS);
      await detection;
      await callOpenRouterAPI('prompt', { parse: parseText, responseFormat });

      expect(completionBodies()['slow-model']).not.toHaveProperty(
        'response_format',
      );
    });

    test('stops waiting for the support check when the caller aborts', async () => {
      jest.useFakeTimers();
      fetchMock.mockImplementation(async (url: string, init: RequestInit) =>
        url.endsWith('/endpoints')
          ? hangUntilAborted(init ?? {})
          : okResponse('answer'),
      );
      setAIModels(['slow-model']);
      detectStructuredOutputSupport(['slow-model']);
      const controller = new AbortController();

      const request = callOpenRouterAPI('prompt', {
        parse: parseText,
        responseFormat,
        signal: controller.signal,
      });
      controller.abort();

      await expect(request).rejects.toMatchObject({ name: 'AbortError' });
      expect(completionBodies()).toEqual({});
    });
  });
});
