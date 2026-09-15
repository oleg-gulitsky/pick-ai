import remoteConfig, {
  FirebaseRemoteConfigTypes,
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
    await remoteConfig().setDefaults(configDefaults);

    await remoteConfig().setConfigSettings({
      ...DEFAULT_REMOTE_CONFIG_SETTINGS,
      ...configSettings,
    });

    const fetchedRemotely = await remoteConfig().fetchAndActivate();

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
  return remoteConfig().getValue(key).asString();
}

export function getRemoteBoolean(key: string) {
  return remoteConfig().getValue(key).asBoolean();
}
