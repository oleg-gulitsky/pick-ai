import remoteConfig, {
  FirebaseRemoteConfigTypes,
} from '@react-native-firebase/remote-config';

export const DEFAULT_REMOTE_CONFIG_SETTINGS = {
  minimumFetchIntervalMillis: 300,
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

    if (fetchedRemotely && __DEV__) {
      console.log('Configs were retrieved from the backend and activated.');
    } else {
      console.log(
        'No configs were fetched from the backend, and the local configs were already activated',
      );
    }
  } catch (error) {
    console.error('Error with Remote Config operations:', error);
  }
}

export function getRemoteValue(key: string) {
  return remoteConfig().getValue(key).asString();
}
