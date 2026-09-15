import TestRenderer, { act, ReactTestRenderer } from 'react-test-renderer';
import { useAppInit } from '../src/hooks/useAppInit';
import { getRemoteValue, initRemoteConfig } from '../src/services/remoteConfig';
import {
  detectStructuredOutputSupport,
  setAIModels,
  setOpenRouterAPIKey,
} from '../src/services/ai';
import { useAppConfigStore } from '../src/store/useAppConfigStore';

jest.mock('react-native-config', () => ({}));
jest.mock('../src/services/ads', () => ({
  initAds: jest.fn(),
}));
jest.mock('../src/services/remoteConfig', () => ({
  initRemoteConfig: jest.fn(),
  getRemoteValue: jest.fn(),
}));
jest.mock('../src/services/ai', () => ({
  detectStructuredOutputSupport: jest.fn(),
  setAIModels: jest.fn(),
  setOpenRouterAPIKey: jest.fn(),
}));

const mockedInitRemoteConfig = jest.mocked(initRemoteConfig);
const mockedGetRemoteValue = jest.mocked(getRemoteValue);

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

function Probe() {
  useAppInit();
  return null;
}

describe('useAppInit', () => {
  let renderer: ReactTestRenderer | null = null;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    useAppConfigStore.setState({ isConfigReady: false });
    mockedGetRemoteValue.mockImplementation(key => remoteValues[key]);
  });

  afterEach(() => {
    act(() => renderer?.unmount());
    renderer = null;
  });

  test('marks the config ready only after Remote Config is applied', async () => {
    const remoteConfig = deferred();
    mockedInitRemoteConfig.mockReturnValue(remoteConfig.promise);

    act(() => {
      renderer = TestRenderer.create(<Probe />);
    });

    expect(isConfigReady()).toBe(false);
    expect(setAIModels).not.toHaveBeenCalled();

    await act(async () => {
      remoteConfig.resolve();
      await flushPromises();
    });

    expect(setAIModels).toHaveBeenCalledWith(['model-a', 'model-b']);
    expect(setOpenRouterAPIKey).toHaveBeenCalledWith('remote-key');
    expect(isConfigReady()).toBe(true);
  });

  test('checks structured outputs support without blocking the UI', async () => {
    jest
      .mocked(detectStructuredOutputSupport)
      .mockReturnValue(new Promise(() => {}));
    mockedInitRemoteConfig.mockResolvedValue();

    await act(async () => {
      renderer = TestRenderer.create(<Probe />);
      await flushPromises();
    });

    expect(detectStructuredOutputSupport).toHaveBeenCalledWith([
      'model-a',
      'model-b',
    ]);
    expect(isConfigReady()).toBe(true);
  });

  test('still unlocks the UI when the models value is not valid JSON', async () => {
    mockedInitRemoteConfig.mockResolvedValue();
    mockedGetRemoteValue.mockImplementation(key =>
      key === 'ai_models' ? 'not json' : remoteValues[key],
    );

    await act(async () => {
      renderer = TestRenderer.create(<Probe />);
      await flushPromises();
    });

    expect(setAIModels).not.toHaveBeenCalled();
    expect(detectStructuredOutputSupport).not.toHaveBeenCalled();
    expect(isConfigReady()).toBe(true);
  });
});
