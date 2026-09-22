import TestRenderer, { act, ReactTestRenderer } from 'react-test-renderer';
import { Question } from '../src/appTypes/Question';
import { OpenRouterError, requestCompletion } from '../src/services/ai';
import { trackEvent } from '../src/services/analytics';
import {
  createResultResponseFormat,
  QUESTIONS_RESPONSE_FORMAT,
} from '../src/navigation/screens/QuizScreen/useQuiz/useAIRequests/schemas';
import {
  REQUEST_TIMEOUT_MS,
  useAIRequests,
} from '../src/navigation/screens/QuizScreen/useQuiz/useAIRequests';
import { useAppConfigStore } from '../src/store/useAppConfigStore';

jest.mock('../src/services/ai', () => ({
  OpenRouterError: jest.requireActual('../src/services/ai').OpenRouterError,
  requestCompletion: jest.fn(),
}));
jest.mock('../src/services/analytics', () => ({
  trackEvent: jest.fn(),
}));

const mockedRequestCompletion = jest.mocked(requestCompletion);
const mockedTrackEvent = jest.mocked(trackEvent);

type CompletionRequest = Parameters<typeof requestCompletion>[0];

const questions: Question[] = [
  { question: 'Hot or cold?', options: ['Hot', 'Cold'] },
  { question: 'Morning or evening?', options: ['Morning', 'Evening'] },
  { question: 'Sweet or bitter?', options: ['Sweet', 'Bitter'] },
];
const questionsContent = JSON.stringify({ questions });
const resultContent = (explanation = 'Tea keeps you calm.') =>
  JSON.stringify({ winner: 'Tea', explanation });
const options = ['Tea', 'Coffee'];
const ranges = {
  questionRange: [5, 8] as [number, number],
  answerRange: [3, 4] as [number, number],
};

function hangUntilAborted({ signal }: CompletionRequest): Promise<never> {
  return new Promise((_resolve, reject) => {
    signal?.addEventListener('abort', () =>
      reject(new Error('Request aborted')),
    );
  });
}

const flushPromises = () => new Promise(resolve => setImmediate(resolve));

function trackedEvents(name: string) {
  return mockedTrackEvent.mock.calls
    .filter(([eventName]) => eventName === name)
    .map(([, params]) => params);
}

function completionRequests(): CompletionRequest[] {
  return mockedRequestCompletion.mock.calls.map(([request]) => request);
}

let api: ReturnType<typeof useAIRequests>;

function Probe() {
  api = useAIRequests();
  return null;
}

describe('useAIRequests', () => {
  let renderer: ReactTestRenderer | null = null;

  const requestQuestions = (signal = new AbortController().signal) =>
    api.requestQuestions(options, ranges, signal);

  const requestResult = (signal = new AbortController().signal) =>
    api.requestResult(options, questions, [0, 1, 1], signal);

  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    useAppConfigStore.setState({
      isConfigReady: true,
      aiModels: ['model'],
      openRouterAPIKey: 'test-key',
      structuredOutputModels: [],
    });
    act(() => {
      renderer = TestRenderer.create(<Probe />);
    });
  });

  afterEach(() => {
    act(() => renderer?.unmount());
    renderer = null;
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('throws when the model pool is empty', async () => {
    useAppConfigStore.setState({ aiModels: [] });

    await expect(requestResult()).rejects.toThrow('No AI models configured');
    expect(mockedRequestCompletion).not.toHaveBeenCalled();
  });

  test('throws when the API key is missing', async () => {
    useAppConfigStore.setState({ openRouterAPIKey: '' });

    await expect(requestResult()).rejects.toThrow(
      'No OpenRouter API key configured',
    );
    expect(mockedRequestCompletion).not.toHaveBeenCalled();
  });

  test('sends the result prompt to every model', async () => {
    useAppConfigStore.setState({ aiModels: ['model-a', 'model-b'] });
    mockedRequestCompletion.mockResolvedValue(resultContent());

    await expect(requestResult()).resolves.toEqual({
      winner: 'Tea',
      explanation: 'Tea keeps you calm.',
    });

    expect(completionRequests()).toEqual([
      expect.objectContaining({ apiKey: 'test-key', model: 'model-a' }),
      expect.objectContaining({ apiKey: 'test-key', model: 'model-b' }),
    ]);
    completionRequests().forEach(request => {
      expect(request.content).toContain('Q: Morning or evening?\nA: Evening');
      expect(request.responseFormat).toBeUndefined();
    });
  });

  test('returns the answer of a working model when another one fails', async () => {
    useAppConfigStore.setState({ aiModels: ['broken', 'working'] });
    mockedRequestCompletion.mockImplementation(async ({ model }) => {
      if (model === 'broken') {
        throw new Error('HTTP 429');
      }
      return resultContent('from working');
    });

    await expect(requestResult()).resolves.toMatchObject({
      explanation: 'from working',
    });
  });

  test('moves on to another model when an answer fails validation', async () => {
    useAppConfigStore.setState({ aiModels: ['invalid', 'valid'] });
    mockedRequestCompletion.mockImplementation(async ({ model }) =>
      model === 'invalid' ? 'not json' : questionsContent,
    );

    await expect(requestQuestions()).resolves.toEqual(questions);
  });

  test('throws when every model fails', async () => {
    useAppConfigStore.setState({ aiModels: ['http-error', 'empty-answer'] });
    mockedRequestCompletion.mockImplementation(async ({ model }) => {
      if (model === 'http-error') {
        throw new Error('HTTP 500');
      }
      return '   ';
    });

    await expect(requestResult()).rejects.toThrow(
      'All AI models failed to provide a valid response',
    );
  });

  test('cancels the remaining requests once one model answers', async () => {
    useAppConfigStore.setState({ aiModels: ['fast', 'slow'] });
    mockedRequestCompletion.mockImplementation(async request =>
      request.model === 'fast'
        ? resultContent('fast answer')
        : hangUntilAborted(request),
    );

    await expect(requestResult()).resolves.toMatchObject({
      explanation: 'fast answer',
    });
    expect(completionRequests().every(({ signal }) => signal?.aborted)).toBe(
      true,
    );
    expect(mockedTrackEvent).not.toHaveBeenCalled();
  });

  test('clears the timeout once the request settles', async () => {
    jest.useFakeTimers();
    mockedRequestCompletion.mockResolvedValue(resultContent());

    await requestResult();

    expect(jest.getTimerCount()).toBe(0);
  });

  test('fails when no model answers within the timeout', async () => {
    jest.useFakeTimers();
    useAppConfigStore.setState({ aiModels: ['hanging-a', 'hanging-b'] });
    mockedRequestCompletion.mockImplementation(hangUntilAborted);

    const request = requestResult();
    jest.advanceTimersByTime(REQUEST_TIMEOUT_MS - 1);
    expect(completionRequests().some(({ signal }) => signal?.aborted)).toBe(
      false,
    );
    jest.advanceTimersByTime(1);

    await expect(request).rejects.toThrow(
      `AI models did not respond within ${REQUEST_TIMEOUT_MS} ms`,
    );
    expect(completionRequests().every(({ signal }) => signal?.aborted)).toBe(
      true,
    );
  });

  test('cancels every request when the caller aborts', async () => {
    useAppConfigStore.setState({ aiModels: ['model-a', 'model-b'] });
    mockedRequestCompletion.mockImplementation(hangUntilAborted);
    const controller = new AbortController();

    const request = requestResult(controller.signal);
    controller.abort();

    await expect(request).rejects.toMatchObject({ name: 'AbortError' });
    expect(completionRequests().every(({ signal }) => signal?.aborted)).toBe(
      true,
    );
    expect(mockedTrackEvent).not.toHaveBeenCalled();
  });

  test('rejects when the caller aborts after a response has arrived', async () => {
    mockedRequestCompletion.mockResolvedValue(resultContent());
    const controller = new AbortController();

    const request = requestResult(controller.signal);
    controller.abort();

    await expect(request).rejects.toMatchObject({ name: 'AbortError' });
  });

  test('sends nothing when the caller has already aborted', async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(requestResult(controller.signal)).rejects.toMatchObject({
      name: 'AbortError',
    });
    expect(mockedRequestCompletion).not.toHaveBeenCalled();
  });

  describe('analytics', () => {
    test('reports why each model failed', async () => {
      useAppConfigStore.setState({
        aiModels: [
          'rate-limited',
          'broken-answer',
          'offline',
          'invalid-answer',
        ],
      });
      mockedRequestCompletion.mockImplementation(async ({ model }) => {
        switch (model) {
          case 'rate-limited':
            throw new OpenRouterError('HTTP 429', {
              type: 'http_error',
              status: 429,
              apiMessage: 'Rate limit exceeded',
            });
          case 'broken-answer':
            throw new OpenRouterError('Invalid response', {
              type: 'invalid_response',
              status: 200,
            });
          case 'offline':
            throw new TypeError('Network request failed');
          default:
            return '   ';
        }
      });

      await expect(requestResult()).rejects.toThrow(
        'All AI models failed to provide a valid response',
      );

      const failure = { structured_outputs: 'false' };
      expect(trackedEvents('ai_model_failed')).toHaveLength(4);
      expect(trackedEvents('ai_model_failed')).toEqual(
        expect.arrayContaining([
          {
            ...failure,
            model: 'rate-limited',
            reason: 'http_429',
            details: 'Rate limit exceeded',
          },
          { ...failure, model: 'broken-answer', reason: 'invalid_format' },
          { ...failure, model: 'offline', reason: 'network_error' },
          { ...failure, model: 'invalid-answer', reason: 'validation_failed' },
        ]),
      );
      expect(trackedEvents('ai_request_failed')).toEqual([
        { reason: 'all_models_failed', models_count: 4 },
      ]);
    });

    test('reports a failed model even when another one answers', async () => {
      useAppConfigStore.setState({ aiModels: ['broken', 'working'] });
      mockedRequestCompletion.mockImplementation(async ({ model }) => {
        if (model === 'broken') {
          throw new OpenRouterError('HTTP 503', {
            type: 'http_error',
            status: 503,
          });
        }
        await flushPromises();
        return resultContent();
      });

      await expect(requestResult()).resolves.toMatchObject({ winner: 'Tea' });

      expect(mockedTrackEvent.mock.calls).toEqual([
        [
          'ai_model_failed',
          { model: 'broken', reason: 'http_503', structured_outputs: 'false' },
        ],
      ]);
    });

    test('marks failures of requests that asked for the schema', async () => {
      useAppConfigStore.setState({ structuredOutputModels: ['model'] });
      mockedRequestCompletion.mockRejectedValue(
        new OpenRouterError('HTTP 400', { type: 'http_error', status: 400 }),
      );

      await expect(requestQuestions()).rejects.toThrow();

      expect(trackedEvents('ai_model_failed')).toEqual([
        { model: 'model', reason: 'http_400', structured_outputs: 'true' },
      ]);
    });

    test('reports a timeout once for the whole request', async () => {
      jest.useFakeTimers();
      useAppConfigStore.setState({ aiModels: ['hanging-a', 'hanging-b'] });
      mockedRequestCompletion.mockImplementation(hangUntilAborted);

      const request = requestResult();
      jest.advanceTimersByTime(REQUEST_TIMEOUT_MS);
      await expect(request).rejects.toThrow('did not respond');

      expect(mockedTrackEvent.mock.calls).toEqual([
        ['ai_request_failed', { reason: 'timeout', models_count: 2 }],
      ]);
    });

    test('reports a missing configuration', async () => {
      useAppConfigStore.setState({ aiModels: [] });
      await expect(requestResult()).rejects.toThrow();

      useAppConfigStore.setState({ aiModels: ['model'], openRouterAPIKey: '' });
      await expect(requestResult()).rejects.toThrow();

      expect(trackedEvents('ai_request_failed')).toEqual([
        { reason: 'no_models', models_count: 0 },
        { reason: 'no_api_key', models_count: 1 },
      ]);
    });
  });

  describe('questions', () => {
    test('asks for the schema only from models that support it', async () => {
      useAppConfigStore.setState({
        aiModels: ['schema-model', 'plain-model'],
        structuredOutputModels: ['schema-model'],
      });
      mockedRequestCompletion.mockResolvedValue(questionsContent);

      await expect(requestQuestions()).resolves.toEqual(questions);

      const [schemaRequest, plainRequest] = completionRequests();
      expect(schemaRequest).toMatchObject({
        model: 'schema-model',
        responseFormat: QUESTIONS_RESPONSE_FORMAT,
      });
      expect(schemaRequest.content).toContain('"Tea" and "Coffee"');
      expect(schemaRequest.content).toContain('Create 5 to 8 questions');
      expect(schemaRequest.content).toContain('3 to 4 answer options');
      expect(plainRequest.model).toBe('plain-model');
      expect(plainRequest.responseFormat).toBeUndefined();
    });

    test('waits for a running check before requesting the questions', async () => {
      useAppConfigStore.setState({ structuredOutputModels: null });
      mockedRequestCompletion.mockResolvedValue(questionsContent);

      const request = requestQuestions();
      await flushPromises();
      expect(mockedRequestCompletion).not.toHaveBeenCalled();

      useAppConfigStore.getState().setStructuredOutputModels(['model']);
      await request;

      expect(completionRequests()).toEqual([
        expect.objectContaining({ responseFormat: QUESTIONS_RESPONSE_FORMAT }),
      ]);
    });

    test('stops waiting for the check when the caller aborts', async () => {
      useAppConfigStore.setState({ structuredOutputModels: null });
      const controller = new AbortController();

      const request = requestQuestions(controller.signal);
      controller.abort();

      await expect(request).rejects.toMatchObject({ name: 'AbortError' });
      expect(mockedRequestCompletion).not.toHaveBeenCalled();
    });

    test('lists every option in the prompt', async () => {
      mockedRequestCompletion.mockResolvedValue(questionsContent);

      await api.requestQuestions(
        ['Tea', 'Coffee', 'Juice'],
        ranges,
        new AbortController().signal,
      );

      expect(completionRequests()[0].content).toContain(
        '"Tea", "Coffee" and "Juice"',
      );
    });
  });

  describe('result', () => {
    test('asks for the schema only from models that support it', async () => {
      useAppConfigStore.setState({
        aiModels: ['schema-model', 'plain-model'],
        structuredOutputModels: ['schema-model'],
      });
      mockedRequestCompletion.mockResolvedValue(resultContent());

      await requestResult();

      const [schemaRequest, plainRequest] = completionRequests();
      expect(schemaRequest.responseFormat).toEqual(
        createResultResponseFormat(options),
      );
      expect(plainRequest.responseFormat).toBeUndefined();
    });

    test('waits for the config before requesting the result', async () => {
      useAppConfigStore.setState({ isConfigReady: false });
      mockedRequestCompletion.mockResolvedValue(resultContent());

      const request = requestResult();
      await flushPromises();
      expect(mockedRequestCompletion).not.toHaveBeenCalled();

      useAppConfigStore.getState().setIsConfigReadyTrue();

      await expect(request).resolves.toMatchObject({ winner: 'Tea' });
    });

    test('stops waiting for the config when the caller aborts', async () => {
      useAppConfigStore.setState({ isConfigReady: false, aiModels: [] });
      const controller = new AbortController();

      const request = requestResult(controller.signal);
      controller.abort();

      await expect(request).rejects.toMatchObject({ name: 'AbortError' });
      expect(mockedRequestCompletion).not.toHaveBeenCalled();
      expect(trackedEvents('ai_request_failed')).toEqual([]);
    });

    test('does not wait for the check before requesting the result', async () => {
      useAppConfigStore.setState({ structuredOutputModels: null });
      mockedRequestCompletion.mockResolvedValue(resultContent());

      await expect(requestResult()).resolves.toMatchObject({ winner: 'Tea' });
      expect(completionRequests()[0].responseFormat).toBeUndefined();
    });

    test('moves on when the winner is not one of the options', async () => {
      useAppConfigStore.setState({ aiModels: ['invented', 'valid'] });
      mockedRequestCompletion.mockImplementation(async ({ model }) =>
        model === 'invented'
          ? JSON.stringify({ winner: 'Juice', explanation: 'Fresh.' })
          : resultContent(),
      );

      await expect(requestResult()).resolves.toMatchObject({ winner: 'Tea' });
    });
  });
});
