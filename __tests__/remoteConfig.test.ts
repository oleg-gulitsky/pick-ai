const mockRemoteConfig = {};
const mockSetDefaults = jest.fn(() => Promise.resolve());
const mockSetConfigSettings = jest.fn(() => Promise.resolve());
const mockFetchAndActivate = jest.fn(() => Promise.resolve(true));

jest.mock('@react-native-firebase/remote-config', () => ({
  __esModule: true,
  getRemoteConfig: () => mockRemoteConfig,
  setDefaults: mockSetDefaults,
  setConfigSettings: mockSetConfigSettings,
  fetchAndActivate: mockFetchAndActivate,
}));

type RemoteConfigModule = typeof import('../src/services/remoteConfig');

const globalWithDev = global as typeof global & { __DEV__: boolean };
const originalDev = globalWithDev.__DEV__;

function loadModule(isDev: boolean): RemoteConfigModule {
  globalWithDev.__DEV__ = isDev;
  let module!: RemoteConfigModule;
  jest.isolateModules(() => {
    module = require('../src/services/remoteConfig');
  });
  return module;
}

describe('initRemoteConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    globalWithDev.__DEV__ = originalDev;
    jest.restoreAllMocks();
  });

  it('uses a 10-minute fetch interval in production', async () => {
    const { initRemoteConfig } = loadModule(false);

    await initRemoteConfig({ configDefaults: {} });

    expect(mockSetConfigSettings).toHaveBeenCalledWith(mockRemoteConfig, {
      minimumFetchIntervalMillis: 10 * 60 * 1000,
    });
  });

  it('fetches on every launch in development', async () => {
    const { initRemoteConfig } = loadModule(true);

    await initRemoteConfig({ configDefaults: {} });

    expect(mockSetConfigSettings).toHaveBeenCalledWith(mockRemoteConfig, {
      minimumFetchIntervalMillis: 0,
    });
  });

  it('lets callers override the default settings', async () => {
    const { initRemoteConfig } = loadModule(false);

    await initRemoteConfig({
      configDefaults: {},
      configSettings: { minimumFetchIntervalMillis: 1000 },
    });

    expect(mockSetConfigSettings).toHaveBeenCalledWith(mockRemoteConfig, {
      minimumFetchIntervalMillis: 1000,
    });
  });

  it('does not log fetch status in production', async () => {
    const { initRemoteConfig } = loadModule(false);

    await initRemoteConfig({ configDefaults: {} });

    expect(console.log).not.toHaveBeenCalled();
  });
});
