import {
  OpenRouterError,
  requestCompletion,
  ResponseFormat,
  fetchIsStructuredOutputsSupported,
} from '../src/services/ai';

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

const fetchMock = jest.fn();

function requestBody(): Record<string, any> {
  return JSON.parse(String(fetchMock.mock.calls[0][1].body));
}

describe('requestCompletion', () => {
  const request = {
    apiKey: 'test-key',
    model: 'model',
    content: 'prompt',
  };

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  test('sends an authorized request to the model', async () => {
    const controller = new AbortController();
    fetchMock.mockResolvedValue(okResponse('answer'));

    await expect(
      requestCompletion({ ...request, signal: controller.signal }),
    ).resolves.toBe('answer');

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://openrouter.ai/api/v1/chat/completions');
    expect(init.headers).toMatchObject({ Authorization: 'Bearer test-key' });
    expect(init.signal).toBe(controller.signal);
    expect(requestBody()).toEqual({
      model: 'model',
      messages: [{ role: 'user', content: 'prompt' }],
    });
  });

  test('asks for the schema when one is given', async () => {
    fetchMock.mockResolvedValue(okResponse('answer'));

    await requestCompletion({ ...request, responseFormat });

    expect(requestBody()).toMatchObject({
      response_format: responseFormat,
      provider: { require_parameters: true },
    });
  });

  test('throws on an HTTP error with the message from OpenRouter', async () => {
    const body = JSON.stringify({
      error: { code: 429, message: 'Rate limit exceeded' },
    });
    fetchMock.mockResolvedValue(errorResponse(429, body));

    const error = await requestCompletion(request).catch(e => e);

    expect(error).toBeInstanceOf(OpenRouterError);
    expect(error.message).toBe(`Model model failed with HTTP 429: ${body}`);
    expect(error.details).toEqual({
      type: 'http_error',
      status: 429,
      apiMessage: 'Rate limit exceeded',
    });
  });

  test('throws on an HTTP error whose body is not JSON', async () => {
    fetchMock.mockResolvedValue(errorResponse(404, '<html>Not Found</html>'));

    await expect(requestCompletion(request)).rejects.toMatchObject({
      details: { type: 'http_error', status: 404, apiMessage: undefined },
    });
  });

  test('throws on a response without choices', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ choices: [] }),
    });

    await expect(requestCompletion(request)).rejects.toThrow(
      'Model model returned invalid response format',
    );
  });

  test('keeps the error OpenRouter returns inside a successful response', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ error: { message: 'Provider disconnected' } }),
    });

    await expect(requestCompletion(request)).rejects.toMatchObject({
      details: {
        type: 'invalid_response',
        status: 200,
        apiMessage: 'Provider disconnected',
      },
    });
  });

  test('treats a successful body that is not JSON as an invalid response', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError('Unexpected token <');
      },
    });

    await expect(requestCompletion(request)).rejects.toMatchObject({
      details: { type: 'invalid_response', status: 200 },
    });
  });
});

describe('fetchIsStructuredOutputsSupported', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  test('checks the endpoints of the model', async () => {
    const controller = new AbortController();
    fetchMock.mockResolvedValue(
      endpointsResponse(['response_format', 'structured_outputs']),
    );

    await expect(
      fetchIsStructuredOutputsSupported('vendor/model', controller.signal),
    ).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://openrouter.ai/api/v1/models/vendor/model/endpoints',
      { signal: controller.signal },
    );
  });

  test('returns false when no endpoint supports it', async () => {
    fetchMock.mockResolvedValue(endpointsResponse(['temperature']));

    await expect(fetchIsStructuredOutputsSupported('model')).resolves.toBe(
      false,
    );
  });

  test('returns false on an HTTP error', async () => {
    fetchMock.mockResolvedValue(errorResponse(404, 'not found'));

    await expect(fetchIsStructuredOutputsSupported('model')).resolves.toBe(
      false,
    );
  });
});
