import TestRenderer, { act, ReactTestRenderer } from 'react-test-renderer';
import { initAds } from '../src/services/ads';
import {
  getRemoteBoolean,
  getRemoteValue,
  initRemoteConfig,
} from '../src/services/remoteConfig';
import { fetchIsStructuredOutputsSupported } from '../src/services/ai';
import { DETECTION_TIMEOUT_MS, useAppInit } from '../src/hooks/useAppInit';
import { useAppConfigStore } from '../src/store/useAppConfigStore';

jest.mock('react-native-config', () => ({}));
jest.mock('../src/services/ads', () => ({
  initAds: jest.fn(),
}));
jest.mock('../src/services/remoteConfig', () => ({
  initRemoteConfig: jest.fn(),
  getRemoteValue: jest.fn(),
  getRemoteBoolean: jest.fn(),
}));
jest.mock('../src/services/ai', () => ({
  fetchIsStructuredOutputsSupported: jest.fn(),
}));

const mockedInitRemoteConfig = jest.mocked(initRemoteConfig);
const mockedGetRemoteValue = jest.mocked(getRemoteValue);
const mockedGetRemoteBoolean = jest.mocked(getRemoteBoolean);
const mockedFetchIsStructuredOutputsSupported = jest.mocked(
  fetchIsStructuredOutputsSupported,
);

const remoteValues: Record<string, string> = {
  ai_models: '["model-a","model-b"]',
  openrouter_api_key: 'remote-key',
};

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>(res => {
    resolve = res;
  });
  return { promise, resolve };
}

const flushPromises = () => new Promise(resolve => setImmediate(resolve));

const isConfigReady = () => useAppConfigStore.getState().isConfigReady;
const isAdsEnabled = () => useAppConfigStore.getState().isAdsEnabled;
const structuredOutputModels = () =>
  useAppConfigStore.getState().structuredOutputModels;

function Probe() {
  useAppInit();
  return null;
}

describe('useAppInit', () => {
  let renderer: ReactTestRenderer | null = null;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    useAppConfigStore.setState({
      isConfigReady: false,
      isAdsEnabled: false,
      aiModels: [],
      openRouterAPIKey: '',
      structuredOutputModels: [],
    });
    mockedGetRemoteValue.mockImplementation(key => remoteValues[key]);
    mockedGetRemoteBoolean.mockReturnValue(true);
  });

  afterEach(() => {
    act(() => renderer?.unmount());
    renderer = null;
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('marks the config ready only after Remote Config is applied', async () => {
    const remoteConfig = deferred();
    mockedInitRemoteConfig.mockReturnValue(remoteConfig.promise);

    act(() => {
      renderer = TestRenderer.create(<Probe />);
    });

    expect(isConfigReady()).toBe(false);
    expect(useAppConfigStore.getState().aiModels).toEqual([]);

    await act(async () => {
      remoteConfig.resolve();
      await flushPromises();
    });

    expect(useAppConfigStore.getState()).toMatchObject({
      aiModels: ['model-a', 'model-b'],
      openRouterAPIKey: 'remote-key',
    });
    expect(isConfigReady()).toBe(true);
  });

  test('checks structured outputs support without blocking the UI', async () => {
    let resolveChecks!: () => void;
    const checks = new Promise<void>(resolve => {
      resolveChecks = resolve;
    });
    mockedFetchIsStructuredOutputsSupported.mockImplementation(async model => {
      await checks;
      return model === 'model-a';
    });
    mockedInitRemoteConfig.mockResolvedValue();

    await act(async () => {
      renderer = TestRenderer.create(<Probe />);
      await flushPromises();
    });

    expect(isConfigReady()).toBe(true);
    expect(structuredOutputModels()).toBeNull();

    await act(async () => {
      resolveChecks();
      await flushPromises();
    });

    expect(structuredOutputModels()).toEqual(['model-a']);
  });

  test('treats a failed support check as unsupported', async () => {
    mockedFetchIsStructuredOutputsSupported.mockImplementation(async model => {
      if (model === 'model-a') {
        throw new TypeError('Network request failed');
      }
      return true;
    });
    mockedInitRemoteConfig.mockResolvedValue();

    await act(async () => {
      renderer = TestRenderer.create(<Probe />);
      await flushPromises();
    });

    expect(structuredOutputModels()).toEqual(['model-b']);
  });

  test('treats a hanging support check as unsupported', async () => {
    jest.useFakeTimers();
    mockedFetchIsStructuredOutputsSupported.mockImplementation(
      (model, signal) =>
        new Promise((resolve, reject) => {
          if (model === 'model-b') {
            resolve(true);
          }
          signal?.addEventListener('abort', () =>
            reject(new Error('Request aborted')),
          );
        }),
    );
    mockedInitRemoteConfig.mockResolvedValue();

    await act(async () => {
      renderer = TestRenderer.create(<Probe />);
    });
    await act(async () => {
      jest.advanceTimersByTime(DETECTION_TIMEOUT_MS - 1);
    });
    expect(structuredOutputModels()).toBeNull();

    await act(async () => {
      jest.advanceTimersByTime(1);
    });

    expect(structuredOutputModels()).toEqual(['model-b']);
  });

  test.each([
    ['not valid JSON', 'not json'],
    ['not a list of model names', '{"model":"model-a"}'],
  ])(
    'still unlocks the UI when the models value is %s',
    async (_case, modelsValue) => {
      mockedInitRemoteConfig.mockResolvedValue();
      mockedGetRemoteValue.mockImplementation(key =>
        key === 'ai_models' ? modelsValue : remoteValues[key],
      );

      await act(async () => {
        renderer = TestRenderer.create(<Probe />);
        await flushPromises();
      });

      expect(useAppConfigStore.getState().aiModels).toEqual([]);
      expect(mockedFetchIsStructuredOutputsSupported).not.toHaveBeenCalled();
      expect(structuredOutputModels()).toEqual([]);
      expect(isConfigReady()).toBe(true);
    },
  );

  test('initializes ads only after Remote Config is applied', async () => {
    const remoteConfig = deferred();
    mockedInitRemoteConfig.mockReturnValue(remoteConfig.promise);

    act(() => {
      renderer = TestRenderer.create(<Probe />);
    });

    expect(initAds).not.toHaveBeenCalled();
    expect(isAdsEnabled()).toBe(false);

    await act(async () => {
      remoteConfig.resolve();
      await flushPromises();
    });

    expect(mockedGetRemoteBoolean).toHaveBeenCalledWith('ads_enabled');
    expect(initAds).toHaveBeenCalledTimes(1);
    expect(isAdsEnabled()).toBe(true);
  });

  test('skips ads initialization when ads are disabled remotely', async () => {
    mockedInitRemoteConfig.mockResolvedValue();
    mockedGetRemoteBoolean.mockReturnValue(false);

    await act(async () => {
      renderer = TestRenderer.create(<Probe />);
      await flushPromises();
    });

    expect(initAds).not.toHaveBeenCalled();
    expect(isAdsEnabled()).toBe(false);
    expect(isConfigReady()).toBe(true);
  });
});
