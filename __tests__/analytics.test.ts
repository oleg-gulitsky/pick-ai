const mockAnalytics = {};
const mockLogEvent = jest.fn();

jest.mock('@react-native-firebase/analytics', () => ({
  __esModule: true,
  getAnalytics: () => mockAnalytics,
  logEvent: (...args: unknown[]) => mockLogEvent(...args),
}));

import { MAX_PARAM_VALUE_LENGTH, trackEvent } from '../src/services/analytics';

describe('trackEvent', () => {
  beforeEach(() => {
    mockLogEvent.mockReset();
    mockLogEvent.mockResolvedValue(undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('logs the event with its params', () => {
    trackEvent('ai_model_failed', { model: 'model', count: 2 });

    expect(mockLogEvent).toHaveBeenCalledWith(
      mockAnalytics,
      'ai_model_failed',
      {
        model: 'model',
        count: 2,
      },
    );
  });

  test('cuts string params to the Firebase limit', () => {
    trackEvent('event', { details: 'x'.repeat(MAX_PARAM_VALUE_LENGTH + 20) });

    const [, , params] = mockLogEvent.mock.calls[0];
    expect(params.details).toHaveLength(MAX_PARAM_VALUE_LENGTH);
  });

  test('swallows an event that Firebase rejects before sending', async () => {
    mockLogEvent.mockImplementation(() => {
      throw new Error('invalid event name');
    });

    await expect(trackEvent('bad name')).resolves.toBeUndefined();
    expect(console.warn).toHaveBeenCalledTimes(1);
  });

  test('swallows a failure of the native module', async () => {
    mockLogEvent.mockRejectedValue(new Error('native failure'));

    await expect(trackEvent('event')).resolves.toBeUndefined();
    expect(console.warn).toHaveBeenCalledTimes(1);
  });
});
