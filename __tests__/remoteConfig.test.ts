const mockRemoteConfig = {
  setDefaults: jest.fn(() => Promise.resolve()),
  setConfigSettings: jest.fn(() => Promise.resolve()),
  fetchAndActivate: jest.fn(() => Promise.resolve(true)),
};

jest.mock('@react-native-firebase/remote-config', () => ({
  __esModule: true,
  default: () => mockRemoteConfig,
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

    expect(mockRemoteConfig.setConfigSettings).toHaveBeenCalledWith({
      minimumFetchIntervalMillis: 10 * 60 * 1000,
    });
  });

  it('fetches on every launch in development', async () => {
    const { initRemoteConfig } = loadModule(true);

    await initRemoteConfig({ configDefaults: {} });

    expect(mockRemoteConfig.setConfigSettings).toHaveBeenCalledWith({
      minimumFetchIntervalMillis: 0,
    });
  });

  it('lets callers override the default settings', async () => {
    const { initRemoteConfig } = loadModule(false);

    await initRemoteConfig({
      configDefaults: {},
      configSettings: { minimumFetchIntervalMillis: 1000 },
    });

    expect(mockRemoteConfig.setConfigSettings).toHaveBeenCalledWith({
      minimumFetchIntervalMillis: 1000,
    });
  });

  it('does not log fetch status in production', async () => {
    const { initRemoteConfig } = loadModule(false);

    await initRemoteConfig({ configDefaults: {} });

    expect(console.log).not.toHaveBeenCalled();
  });
});
