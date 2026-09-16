import {
  fetchAndActivate,
  FirebaseRemoteConfigTypes,
  getBoolean,
  getRemoteConfig,
  getString,
  setConfigSettings,
  setDefaults,
} from '@react-native-firebase/remote-config';

const DEV_FETCH_INTERVAL_MS = 0;
const PROD_FETCH_INTERVAL_MS = 10 * 60 * 1000;

export const DEFAULT_REMOTE_CONFIG_SETTINGS = {
  minimumFetchIntervalMillis: __DEV__
    ? DEV_FETCH_INTERVAL_MS
    : PROD_FETCH_INTERVAL_MS,
};

type initRemoteConfigParams = {
  configDefaults: FirebaseRemoteConfigTypes.ConfigDefaults;
  configSettings?: FirebaseRemoteConfigTypes.ConfigSettings;
};

export async function initRemoteConfig({
  configDefaults,
  configSettings,
}: initRemoteConfigParams) {
  try {
    const remoteConfig = getRemoteConfig();

    await setDefaults(remoteConfig, configDefaults);

    await setConfigSettings(remoteConfig, {
      ...DEFAULT_REMOTE_CONFIG_SETTINGS,
      ...configSettings,
    });

    const fetchedRemotely = await fetchAndActivate(remoteConfig);

    if (__DEV__) {
      console.log(
        fetchedRemotely
          ? 'Configs were retrieved from the backend and activated.'
          : 'No configs were fetched from the backend, and the local configs were already activated',
      );
    }
  } catch (error) {
    console.error('Error with Remote Config operations:', error);
  }
}

export function getRemoteValue(key: string) {
  return getString(getRemoteConfig(), key);
}

export function getRemoteBoolean(key: string) {
  return getBoolean(getRemoteConfig(), key);
}
